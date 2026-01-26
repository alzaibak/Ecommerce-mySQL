const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const nodemailer = require("nodemailer");

// Helper: generate unique 6-letter order number
function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔔 Webhook received:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    console.log("📦 Session details:", {
      id: session.id,
      metadata: session.metadata,
      userId: session.metadata?.userId,
      customer_details: session.customer_details,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal,
      total_details: session.total_details,
      shipping_cost: session.metadata?.shipping_cost
    });

    try {
      // 🔒 Idempotency
      const existingOrder = await Order.findOne({
        where: { paymentIntentId: session.payment_intent },
      });

      if (existingOrder) {
        console.log("⚠️ Order already exists");
        return res.json({ received: true });
      }

      const productIds = session.metadata?.cart_ids
        ? session.metadata.cart_ids.split(",")
        : [];

      const orderNumber = generateOrderNumber();

      // Parse userId to integer 
      const userId = parseInt(session.metadata?.userId) || 0;
      
      // CORRECTION CRITIQUE : 
      // Utiliser les valeurs de la session Stripe pour shipping et total
      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
      
      // Récupérer les frais de livraison depuis total_details OU metadata
      let shippingCost = 0;
      if (session.total_details?.amount_shipping) {
        shippingCost = session.total_details.amount_shipping / 100;
      } else if (session.metadata?.shipping_cost) {
        shippingCost = parseFloat(session.metadata.shipping_cost);
      }
      
      // Vérifier la cohérence : totalAmount doit être = productTotal + shippingCost
      const productTotal = totalAmount - shippingCost;
      
      console.log("💰 Calculated amounts:", {
        totalAmount,
        shippingCost,
        productTotal,
        verification: `productTotal(${productTotal}) + shippingCost(${shippingCost}) = ${productTotal + shippingCost}, should equal totalAmount(${totalAmount})`
      });

      // Create order
      const newOrder = await Order.create({
        userId: userId,
        customerId: session.customer || null,
        paymentIntentId: session.payment_intent,
        orderNumber,
        products: productIds,
        shipping: shippingCost, // Frais de livraison
        amount: totalAmount, // Total final (produits + livraison)
        address: session.customer_details
          ? {
              name: session.customer_details.name || null,
              email: session.customer_details.email || null,
              phone: session.customer_details.phone || null,
              address: session.customer_details.address || null,
            }
          : null,
        status: "confirmed",
      });

      console.log("✅ Order created successfully:", {
        orderNumber,
        shipping: newOrder.shipping,
        amount: newOrder.amount,
        verification: `shipping (${newOrder.shipping}) + productTotal (${productTotal}) = ${newOrder.shipping + productTotal} should equal amount (${newOrder.amount})`,
        products: newOrder.products.length
      });

      // Send email confirmation to user
      const recipientEmail = newOrder.address?.email || session.customer_details?.email;
      
      if (recipientEmail) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.HOST_EMAIL,
              pass: process.env.EMAIL_PASS,
            }
          });

          await transporter.verify();

          await transporter.sendMail({
            from: process.env.HOST_EMAIL,
            to: recipientEmail,
            subject: `Confirmation de votre commande ${orderNumber}`,
            html: `
            <div style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; padding: 5px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                
                <div style="background-color: #4CAF50; color: white; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">Merci pour votre commande !</h1>
                </div>
                
                <div style="padding: 30px; color: #333333; line-height: 1.6;">
                  <p style="font-size: 16px;">Bonjour <strong>${newOrder.address?.name || 'client'}</strong>,</p>
                  
                  <p style="font-size: 16px;">Nous avons bien reçu votre commande. Voici les détails :</p>
                  
                  <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h2 style="margin: 0; color: #4CAF50;">Commande: ${orderNumber}</h2>
                    <div style="margin: 10px 0;">
                      <p style="margin: 5px 0; font-size: 14px;">Sous-total produits: <strong>€${productTotal.toFixed(2)}</strong></p>
                      <p style="margin: 5px 0; font-size: 14px;">Frais de livraison: <strong>€${shippingCost.toFixed(2)}</strong></p>
                      <p style="margin: 10px 0 0 0; font-size: 16px; border-top: 1px solid #ddd; padding-top: 10px;">
                        Montant total : <strong>€${totalAmount.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                  
                  <p style="font-size: 16px;">Nous vous tiendrons informé lorsque votre commande sera expédiée.</p>
                  <p style="font-size: 16px;">Merci pour votre confiance !</p>
                </div>
                
                <div style="background-color: #f9f9f9; text-align: center; padding: 20px; font-size: 12px; color: #888888;">
                  &copy; ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.
                </div>
                
              </div>
            </div>
            `
          });

          console.log("✅ Confirmation email sent to:", recipientEmail);
        } catch (emailErr) {
          console.error("❌ Failed to send confirmation email:", emailErr.message);
        }
      } else {
        console.log("⚠️ No email address found for order confirmation");
      }

    } catch (err) {
      console.error("❌ Order creation failed:", err);
      return res.status(500).send("Order creation failed");
    }
  }

  res.json({ received: true });
};