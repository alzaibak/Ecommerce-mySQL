// routes/orders.js - Full file including OrderItems
const router = require("express").Router();
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const { tokenVerification, tokenVerificationAndAdmin } = require("./tokenVerification");

// ---------------------------
// Helper: always include items with products
// ---------------------------
const includeItemsWithProduct = [
  {
    model: OrderItem,
    as: "items",
    include: [Product]
  }
];

// ---------------------------
// ORDERS ROUTES
// ---------------------------

// Get order by PaymentIntent ID
router.get("/payment-intent/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const order = await Order.findOne({
      where: { paymentIntentId },
      include: includeItemsWithProduct
    });
    res.status(200).json(order || null);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Get all orders for logged-in user
router.get("/user/orders", tokenVerification, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      include: includeItemsWithProduct
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get order by ID
router.get("/:id", tokenVerification, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: includeItemsWithProduct
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.id !== order.userId && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (admin only)
router.get("/", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [["createdAt", "DESC"]],
      include: includeItemsWithProduct
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order by ID (admin only)
router.put("/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const [updated] = await Order.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: "Order not found" });

    const updatedOrder = await Order.findByPk(req.params.id, { include: includeItemsWithProduct });
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete order by ID (admin only)
router.delete("/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly income (admin only)
router.get("/income", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const income = await Order.findAll({
      where: { createdAt: { [Op.gte]: lastMonth } },
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("createdAt")), "month"],
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"]
      ],
      group: [sequelize.fn("MONTH", sequelize.col("createdAt"))]
    });

    res.status(200).json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------------------
// ORDER ITEMS ROUTES
// ---------------------------

// Get all order items for a specific order (user must own order or be admin)
router.get("/items/order/:orderId", tokenVerification, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.id !== order.userId && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    const items = await OrderItem.findAll({
      where: { orderId: req.params.orderId },
      include: [{ model: Product, attributes: ["id", "title", "img", "price"] }]
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order items" });
  }
});

// Get order item by ID
router.get("/items/:id", tokenVerification, async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id, {
      include: [
        { model: Order, attributes: ["id", "userId", "orderNumber"] },
        { model: Product, attributes: ["id", "title", "img", "price"] }
      ]
    });

    if (!item) return res.status(404).json({ message: "Order item not found" });

    if (item.Order.userId !== req.user.id && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order item" });
  }
});

// Update order item (admin only)
router.put("/items/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const [updated] = await OrderItem.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ message: "Order item not found" });

    const updatedItem = await OrderItem.findByPk(req.params.id);
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order item" });
  }
});

// Delete order item (admin only)
router.delete("/items/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const deleted = await OrderItem.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Order item not found" });

    res.json({ message: "Order item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete order item" });
  }
});

// Get order items by product ID (admin only)
router.get("/items/product/:productId", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const items = await OrderItem.findAll({
      where: { productId: req.params.productId },
      include: [{ model: Order, attributes: ["id", "orderNumber", "status", "createdAt"] }],
      order: [["createdAt", "DESC"]]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product order items" });
  }
});

router.post('/:orderId/items', tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Verify order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create order item
    const orderItem = await OrderItem.create({
      orderId,
      ...req.body
    });

    // Recalculate order totals
    const items = await OrderItem.findAll({ where: { orderId } });
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const total = subtotal + parseFloat(order.shipping || 0);

    await order.update({ subtotal, total });

    // Return updated order with items
    const updatedOrder = await Order.findByPk(orderId, {
      include: includeItemsWithProduct
    });

    res.status(201).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add these routes to your existing orders.js file

// Get orders with filtering (admin only)
router.get("/", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate, userId } = req.query;
    const where = {};

    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: includeItemsWithProduct
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new order (admin only)
router.post("/", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order number if not provided
    if (!orderData.orderNumber) {
      orderData.orderNumber = 'ORD' + Date.now().toString().slice(-8);
    }
    
    const order = await Order.create(orderData);
    
    if (orderData.items && Array.isArray(orderData.items)) {
      const orderItems = orderData.items.map(item => ({
        ...item,
        orderId: order.id
      }));
      await OrderItem.bulkCreate(orderItems);
    }
    
    const newOrder = await Order.findByPk(order.id, {
      include: includeItemsWithProduct
    });
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add item to existing order (admin only)
router.post("/:orderId/items", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const itemData = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const orderItem = await OrderItem.create({
      orderId: parseInt(orderId),
      ...itemData
    });
    
    // Recalculate order totals
    const items = await OrderItem.findAll({ where: { orderId } });
    const subtotal = items.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0);
    
    await order.update({
      subtotal,
      total: subtotal + parseFloat(order.shipping || 0)
    });
    
    const updatedOrder = await Order.findByPk(orderId, {
      include: includeItemsWithProduct
    });
    
    res.status(201).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Batch update order items
router.post("/:orderId/items/batch", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Delete existing items and create new ones
    await OrderItem.destroy({ where: { orderId } });
    
    const orderItems = items.map(item => ({
      ...item,
      orderId: parseInt(orderId)
    }));
    
    await OrderItem.bulkCreate(orderItems);
    
    // Recalculate totals
    const subtotal = items.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0);
    
    await order.update({
      subtotal,
      total: subtotal + parseFloat(order.shipping || 0)
    });
    
    const updatedOrder = await Order.findByPk(orderId, {
      include: includeItemsWithProduct
    });
    
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status with note
router.put("/:id/status", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const updateData = { status };
    if (note) {
      updateData.adminNote = note;
    }
    
    await order.update(updateData);
    
    const updatedOrder = await Order.findByPk(id, {
      include: includeItemsWithProduct
    });
    
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order statistics
router.get("/stats", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total');
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const deliveredOrders = await Order.count({ where: { status: 'delivered' } });
    
    res.status(200).json({
      totalOrders,
      totalRevenue: totalRevenue || 0,
      pendingOrders,
      deliveredOrders,
      avgOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export orders to CSV
router.get("/export/csv", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }
    
    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [{
        model: OrderItem,
        as: "items"
      }]
    });
    
    // Convert to CSV format
    const csvData = orders.map(order => ({
      'Order ID': order.id,
      'Order Number': order.orderNumber,
      'User ID': order.userId,
      'Status': order.status,
      'Subtotal': order.subtotal,
      'Shipping': order.shipping,
      'Total': order.total,
      'Items Count': order.items.length,
      'Created At': order.createdAt,
      'Updated At': order.updatedAt
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    
    // Simple CSV string generation
    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    res.send(csvString);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
