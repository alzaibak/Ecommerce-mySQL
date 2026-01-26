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
    
    // Calculate product total (sans les frais de livraison)
    const productTotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
    
    // Calculate grand total (product total + shipping)
    const grandTotal = productTotal + shipping;

    console.log("💰 Calculated amounts:", {
      productTotal,
      shipping,
      grandTotal,
      totalFromFrontend: total
    });

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

    // Use Stripe shipping options instead of adding shipping as line item
    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: email,
      shipping_address_collection: { 
        allowed_countries: ['FR'] 
      },
      metadata: {
        cart_ids: cartItems.map(i => i._id).join(','),
        userId: Number(req.body.userId),
        product_total: productTotal.toString(),
        shipping_cost: shipping.toString()
      },
      success_url: `${YOUR_DOMAIN}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cart`,
    };

    // Add shipping options only if shipping cost > 0
    if (shipping > 0) {
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shipping * 100),
              currency: 'EUR',
            },
            display_name: 'Livraison standard',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            }
          }
        }
      ];
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("✅ Stripe session created:", {
      sessionId: session.id,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal,
      shipping_options: session.shipping_options
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
      expand: ["line_items", "customer", "total_details"] 
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