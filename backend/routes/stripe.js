const router = require("express").Router();
const express = require('express');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

const YOUR_DOMAIN = process.env.CLIENT_DOMAIN || 'http://localhost:8080';

let productsData; // Store products data for webhook

// Stripe payment API
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, total } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const shipping = total > 100 ? 0 : 9.99;

    const line_items = cartItems.map(item => {
      // Make sure price is a valid number
      const price = Number(String(item.price).replace(',', '.'));
      const quantity = parseInt(item.quantity) || 1;

      if (!price || price <= 0) {
        throw new Error(`Invalid price for item: ${item.title}`);
      }

      return {
        price_data: {
          currency: 'EUR',
          product_data: {
            name: `${item.title || 'Product'}${item.color ? ` - ${item.color}` : ''}${item.size ? ` - ${item.size}` : ''}`,
            description: (item.desc || item.description || '').substring(0, 200),
            images: item.img ? [item.img] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: quantity,
      };
    });

    // Add shipping as a separate line item
    if (shipping > 0) {
      line_items.push({
        price_data: {
          currency: 'EUR',
          product_data: { name: 'Frais de livraison' },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: { allowed_countries: ['FR'] },
      line_items,
      mode: 'payment',
      metadata: {
        cart_ids: cartItems.map(i => i._id).join(','), // only store IDs
        cart_quantity: cartItems.length.toString(),
        },
      success_url: `${YOUR_DOMAIN}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${YOUR_DOMAIN}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: err.message });
  }
});


const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  if (event.type === "checkout.session.completed") {
    try {
      const session = await stripe.checkout.sessions.retrieve(data.id, { expand: ['customer'] });
      const items = JSON.parse(session.metadata.cart || '[]');

      await Order.create({
        customerId: session.customer?.id || null,
        paymentIntentId: session.payment_intent,
        products: items,
        amount: session.amount_total / 100,
        address: session.shipping_details || null,
        status: 'paid', // mark as paid
      });

      console.log("Order created for session:", session.id);
    } catch (err) {
      console.error("Error creating order:", err);
    }
  }

  res.json({ received: true });
});


// Get checkout session details
router.get('/checkout-session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json(session);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
