const router = require("express").Router();
const Order = require("../models/Order");
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { tokenVerificationAndAdmin, tokenVerification } = require("./tokenVerification");

// ---------------------------
// Get order by PaymentIntent ID
// ---------------------------
router.get("/payment-intent/:paymentIntentId", async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const order = await Order.findOne({ where: { paymentIntentId } });
    return res.status(200).json(order || null);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// ---------------------------
// Create a new order
// ---------------------------
router.post("/", async (req, res) => {
  try {
    const savedOrder = await Order.create(req.body);
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------
// Get all orders for logged-in user
// ---------------------------
router.get("/user/orders", tokenVerification, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ---------------------------
// Get order by ID (user or admin)
// ---------------------------
router.get("/:id", tokenVerification, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.user.id !== order.userId && !req.user.isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    res.json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------
// Get all orders (admin only)
// ---------------------------
router.get("/", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------
// Update order by ID (admin only)
// ---------------------------
router.put("/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const [updated] = await Order.update(req.body, { where: { id: req.params.id } });
    if (updated === 0) return res.status(404).json({ message: "Order not found" });

    const updatedOrder = await Order.findByPk(req.params.id);
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------
// Delete order by ID (admin only)
// ---------------------------
router.delete("/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    await Order.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ---------------------------
// Get monthly income (admin only)
// ---------------------------
router.get("/income", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));

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
    res.status(500).json(err);
  }
});

module.exports = router;
