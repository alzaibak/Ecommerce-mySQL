const router = require("express").Router();
const express = require('express');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

const YOUR_DOMAIN = process.env.CLIENT_DOMAIN || 'http://localhost:3000';

let productsData; // Store products data for webhook

// Stripe payment API
router.post('/create-checkout-session', async (req, res) => {
    try {
        productsData = JSON.stringify(req.body.cartItems);
        
        const customer = await stripe.customers.create({});

        const line_items = req.body.cartItems.map(item => {
            return {
                price_data: {
                    currency: 'EUR',
                    product_data: {
                        name: `${item.title} , ${item.color} , ${item.size}`,
                        description: item.dec,
                        images: [item.img],
                    },
                    unit_amount: item.price * 100,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            shipping_address_collection: { allowed_countries: ['FR'] },
            line_items,
            phone_number_collection: {
                enabled: true,
            },
            customer: customer.id,
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/cart`,
        });

        res.send({ url: session.url });
    } catch (error) {
        res.status(500).json(error);
    }
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    const data = event.data.object;

    // Handle the event
    if (event.type === "payment_intent.succeeded") {
        // Create order on database
        try {
            const items = JSON.parse(productsData);
            const newOrder = await Order.create({
                customerId: data.customer,
                paymentIntentId: data.payment_intent,
                products: items,
                amount: data.amount / 100,
                address: data.shipping,
                status: 'pending'
            });
            console.log("Order created:", newOrder.id);
        } catch (err) {
            console.log("Error creating order:", err);
        }
    }

    res.status(200).json({ received: true });
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
