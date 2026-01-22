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

    console.log("📦 Session metadata:", session.metadata);
    console.log("👤 User ID from metadata:", session.metadata?.userId);
    console.log("📧 Customer details:", session.customer_details);

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
      const userId = parseInt(session.metadata.userId);
      // Create order and store it in a variable
      const newOrder = await Order.create({
        userId: userId,
        customerId: session.customer || null,
        paymentIntentId: session.payment_intent,
        orderNumber,
        products: productIds,
        amount: session.amount_total / 100,
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

      console.log("✅ Order created successfully:", orderNumber);
      console.log("👤 Order created with userId:", newOrder.userId);
      console.log("📧 Order email address:", newOrder.address?.email);

      // Send email confirmation to user
      const recipientEmail = newOrder.address?.email || session.customer_details?.email;
      
      if (recipientEmail) {
        try {
          // For Gmail with 2FA, you need an App Password
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.HOST_EMAIL,
              pass: process.env.EMAIL_PASS, // This should be an App Password, not your regular password
            }
          });

          // Verify connection configuration
          await transporter.verify();
          console.log("✅ Email server connection verified");

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
                          <p style="margin: 10px 0 0 0; font-size: 16px;">Montant total : <strong>€${newOrder.amount.toFixed(2)}</strong></p>
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
          // Log more details about the email error
          console.log("ℹ️ Email config - HOST_EMAIL:", process.env.HOST_EMAIL);
          console.log("ℹ️ Make sure EMAIL_PASS is an App Password (not your regular password)");
          console.log("ℹ️ Generate App Password here: https://myaccount.google.com/apppasswords");
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