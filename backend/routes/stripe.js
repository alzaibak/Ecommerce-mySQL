const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const YOUR_DOMAIN = process.env.CLIENT_DOMAIN || 'http://localhost:8080';

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, total, email } = req.body;

    // Validate cart
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }

    // Ensure domain is set
    if (!YOUR_DOMAIN) {
      return res.status(500).json({ message: 'CLIENT_DOMAIN is not defined in env' });
    }

    // Determine shipping cost (free if total > 100€)
    const shipping = total > 100 ? 0 : 9.99;

    // Build Stripe line items for each product
    const line_items = cartItems.map(item => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (!price || price <= 0) throw new Error(`Invalid price for item ${item.title}`);
      if (!quantity || quantity <= 0) throw new Error(`Invalid quantity for item ${item.title}`);

      return {
        price_data: {
          currency: 'EUR',
          product_data: {
            name: item.title,
            images: item.img ? [item.img] : [],
          },
          unit_amount: Math.round(price * 100), // convert to cents
        },
        quantity,
      };
    });

    // Add shipping as a separate line item if needed
    if (shipping > 0) {
      line_items.push({
        price_data: {
          currency: 'EUR',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(shipping * 100), // convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: email || undefined,
      shipping_address_collection: { allowed_countries: ['FR'] },
      metadata: {
        cart_ids: cartItems.map(i => i._id).join(','),
        userId: req.user?.id || req.body.userId || '',
      },
      success_url: `${YOUR_DOMAIN}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cart`,
    });

    // Send session URL to frontend
    res.json({ url: session.url });

  } catch (err) {
    console.error('Stripe session creation error:', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// Retrieve Stripe Checkout session
router.get("/checkout-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"] 
    });

    if (!session) return res.status(404).json({ message: "Stripe session not found" });

    res.json(session);
  } catch (err) {
    console.error("Stripe API error:", err);
    res.status(400).json({
      message: "Invalid or expired Stripe session",
      error: err.message
    });
  }
});

module.exports = router;
