// webhook/stripe-webhook.js - Updated
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
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
      req.rawBody || req.body,
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

    try {
      // Check for existing order
      const existingOrder = await Order.findOne({
        where: { paymentIntentId: session.payment_intent },
      });

      if (existingOrder) {
        console.log("⚠️ Order already exists");
        return res.json({ received: true });
      }

      // Parse cart items
      let cartItems = [];
      try {
        cartItems = JSON.parse(session.metadata?.cartItems || '[]');
      } catch (err) {
        console.error("❌ Failed to parse cartItems:", err);
      }

      const orderNumber = generateOrderNumber();
      const userId = parseInt(session.metadata?.userId) || 0;
      const productTotal = parseFloat(session.metadata?.product_total || 0);
      const shippingCost = parseFloat(session.metadata?.shipping_cost || 0);
      const grandTotal = parseFloat(session.metadata?.grand_total || 0);

      // Create the order
      const newOrder = await Order.create({
        userId: userId,
        orderNumber,
        paymentIntentId: session.payment_intent,
        subtotal: productTotal,
        shipping: shippingCost,
        total: grandTotal,
        address: session.shipping_details ? {
          name: session.shipping_details.name,
          address: {
            line1: session.shipping_details.address.line1,
            line2: session.shipping_details.address.line2 || '',
            city: session.shipping_details.address.city,
            state: session.shipping_details.address.state || '',
            postal_code: session.shipping_details.address.postal_code,
            country: session.shipping_details.address.country
          }
        } : null,
        status: 'paid'
      });

      // Create order items and update stock
      for (const item of cartItems) {
        try {
          // Create order item
          await OrderItem.create({
            orderId: newOrder.id,
            productId: item.productId,
            variantKey: item.variantKey,
            quantity: item.quantity,
            price: item.price,
            title: item.title,
            img: item.img,
            attributes: item.attributes
          });

          // Update product stock
          const product = await Product.findByPk(item.productId);
          if (product && item.variantKey) {
            await product.decreaseStock(item.attributes, item.quantity);
          } else if (product && product.stockByVariant) {
            // Fallback for variant key
            const variantKey = product.getVariantKey(item.attributes);
            await product.decreaseStock(item.attributes, item.quantity);
          }
        } catch (error) {
          console.error(`❌ Failed to process product ${item.productId}:`, error);
        }
      }

      // Send email confirmation
      const recipientEmail = session.customer_details?.email;
      if (recipientEmail) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.HOST_EMAIL,
              pass: process.env.EMAIL_PASS,
            }
          });

          let productsHtml = '';
          for (const item of cartItems) {
            const attributes = item.attributes || {};
            const attributeText = Object.entries(attributes)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            
            productsHtml += `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${attributeText || '-'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${(item.price * item.quantity).toFixed(2)}€</td>
              </tr>
            `;
          }

          await transporter.sendMail({
            from: process.env.HOST_EMAIL,
            to: recipientEmail,
            subject: `Confirmation de votre commande ${orderNumber}`,
            html: `
            <div style="font-family: 'Arial', sans-serif; background-color: #f5f5f5; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <div style="background-color: #4CAF50; color: white; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">Merci pour votre commande !</h1>
                </div>
                <div style="padding: 30px; color: #333333; line-height: 1.6;">
                  <p style="font-size: 16px;">Bonjour <strong>${session.shipping_details?.name || 'client'}</strong>,</p>
                  <p style="font-size: 16px;">Nous avons bien reçu votre commande. Voici les détails :</p>
                  <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin: 0; color: #4CAF50; text-align: center;">Commande: ${orderNumber}</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                      <thead>
                        <tr style="background-color: #e0e0e0;">
                          <th style="padding: 10px; text-align: left;">Produit</th>
                          <th style="padding: 10px; text-align: left;">Attributs</th>
                          <th style="padding: 10px; text-align: left;">Quantité</th>
                          <th style="padding: 10px; text-align: left;">Total</th>
                        </tr>
                      </thead>
                      <tbody>${productsHtml}</tbody>
                    </table>
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                      <p style="margin: 5px 0; font-size: 14px;">Sous-total: <strong>€${productTotal.toFixed(2)}</strong></p>
                      <p style="margin: 5px 0; font-size: 14px;">Livraison: <strong>€${shippingCost.toFixed(2)}</strong></p>
                      <p style="margin: 10px 0 0 0; font-size: 16px; border-top: 1px solid #ddd; padding-top: 10px;">
                        Total: <strong>€${grandTotal.toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                  <p style="font-size: 16px;">Nous vous tiendrons informé lorsque votre commande sera expédiée.</p>
                </div>
              </div>
            </div>
            `
          });

          console.log("✅ Confirmation email sent to:", recipientEmail);
        } catch (emailErr) {
          console.error("❌ Failed to send confirmation email:", emailErr.message);
        }
      }

      console.log("✅ Order created successfully:", orderNumber);

    } catch (err) {
      console.error("❌ Order creation failed:", err);
      return res.status(500).send("Order creation failed");
    }
  }

  res.json({ received: true });
};