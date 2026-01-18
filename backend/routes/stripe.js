const router = require("express").Router();
const express = require('express');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

const YOUR_DOMAIN = process.env.CLIENT_DOMAIN || 'http://localhost:3000';

let productsData; // Store products data for webhook

// Stripe payment API
router.post('/create-checkout-session', async (req, res) => {
    try {
        if (!req.body.cartItems || req.body.cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        console.log("Received cart items:", req.body.cartItems);
        productsData = JSON.stringify(req.body.cartItems);
        
        const customer = await stripe.customers.create({});

        const line_items = req.body.cartItems.map(item => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 1;
            
            if (price <= 0) {
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
    if (event.type === "checkout.session.completed") {
        // Create order on database
        try {
            const session = await stripe.checkout.sessions.retrieve(data.id, {
                expand: ['line_items', 'customer']
            });
            
            const items = JSON.parse(productsData);
            const amount = session.amount_total / 100;
            
            const newOrder = await Order.create({
                customerId: session.customer,
                paymentIntentId: session.payment_intent,
                products: items,
                amount: amount,
                address: session.shipping_details || null,
                status: 'pending'
            });
            console.log("Order created:", newOrder.id);
        } catch (err) {
            console.log("Error creating order:", err);
        }
    } else if (event.type === "payment_intent.succeeded") {
        // Fallback for payment_intent.succeeded
        try {
            const items = JSON.parse(productsData);
            const newOrder = await Order.create({
                customerId: data.customer,
                paymentIntentId: data.id,
                products: items,
                amount: data.amount / 100,
                address: data.shipping || null,
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
