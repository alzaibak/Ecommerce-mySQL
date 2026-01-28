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

module.exports = router;
