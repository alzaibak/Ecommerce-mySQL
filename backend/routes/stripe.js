// routes/stripe.js - Updated to clean image URLs
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/Product");

const YOUR_DOMAIN = process.env.CLIENT_DOMAIN || 'http://localhost:8080';

// Helper function to clean URLs
const cleanImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Remove whitespace and newlines
  let cleaned = url.trim();
  
  // Remove any trailing newlines or carriage returns
  cleaned = cleaned.replace(/\r?\n|\r/g, '');
  
  // Validate URL format
  try {
    new URL(cleaned);
    return cleaned;
  } catch (error) {
    console.warn('Invalid image URL:', url, '-> using placeholder');
    return null;
  }
};

// Create Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, total, email, userId } = req.body;

    // Validate cart
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty or invalid' });
    }

    // Determine shipping cost
    const shipping = total > 100 ? 0 : 9.99;
    const grandTotal = total + shipping;

    console.log("💰 Processing cart items:", cartItems);

    // Build Stripe line items
    const line_items = await Promise.all(cartItems.map(async (item) => {
      const price = item.discountPrice && item.discountPrice < item.price 
        ? item.discountPrice 
        : item.price;
      const quantity = Number(item.quantity) || 1;

      if (!price || price <= 0) throw new Error(`Invalid price for item ${item.title}`);
      if (!quantity || quantity <= 0) throw new Error(`Invalid quantity for item ${item.title}`);

      // Build product name with attributes
      const attributes = item.attributes || {};
      const attributeText = Object.entries(attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      const productName = attributeText 
        ? `${item.title} (${attributeText})`
        : item.title;

      // Check stock if product exists in database
      if (item.id) {
        const product = await Product.findByPk(item.id);
        if (product && item.variantKey) {
          const stock = product.getStock(attributes);
          if (stock < quantity) {
            throw new Error(`Insufficient stock for ${item.title}. Available: ${stock}`);
          }
        }
      }

      // Clean image URL
      const images = [];
      const cleanedImageUrl = cleanImageUrl(item.img);
      if (cleanedImageUrl) {
        images.push(cleanedImageUrl);
      }

      return {
        price_data: {
          currency: 'EUR',
          product_data: {
            name: productName,
            images: images.length > 0 ? images : [],
            metadata: {
              productId: item.id,
              variantKey: item.variantKey || '',
            }
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      };
    }));

    // Prepare products for metadata
    const productsForMetadata = cartItems.map(item => ({
      productId: item.id,
      variantKey: item.variantKey || null,
      title: item.title,
      price: item.discountPrice && item.discountPrice < item.price ? item.discountPrice : item.price,
      quantity: item.quantity,
      img: cleanImageUrl(item.img) || null,
      attributes: item.attributes || {}
    }));

    // Validate YOUR_DOMAIN
    const domain = cleanImageUrl(YOUR_DOMAIN) || 'http://localhost:8080';
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      return res.status(400).json({ message: 'Invalid CLIENT_DOMAIN configuration' });
    }

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: email,
      shipping_address_collection: { 
        allowed_countries: ['FR'] 
      },
      metadata: {
        cartItems: JSON.stringify(productsForMetadata),
        userId: userId || 0,
        product_total: total.toString(),
        shipping_cost: shipping.toString(),
        grand_total: grandTotal.toString()
      },
      success_url: `${domain}/successPayment?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cart`,
    };

    // Add shipping options if needed
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

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url });

  } catch (err) {
    console.error('Stripe session creation error:', err);
    res.status(500).json({ 
      message: err.message.includes('stock') ? err.message : 'Internal Server Error' 
    });
  }
});

// Keep the retrieve session endpoint as is
router.get("/checkout-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) return res.status(400).json({ message: "Session ID is required" });

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