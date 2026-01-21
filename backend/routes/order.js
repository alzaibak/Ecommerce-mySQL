const router = require("express").Router();
const Order = require("../models/Order");
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const CryptoJS = require("crypto-js");
const { tokenVerificationAndAdmin, tokenVerificationAndAuthorization } = require("./tokenVerification");


// Get order by PaymentIntent ID (to show after confirmation)
router.get("/payment-intent/:paymentIntentId", async (req, res) => {
  console.log("Looking for paymentIntentId:", req.params.paymentIntentId);
  try {
    const { paymentIntentId } = req.params;

    const order = await Order.findOne({
      where: { paymentIntentId }
    });

    console.log("Order found:", order);

    return res.status(200).json(order || null);
  } catch (err) {
    console.error("Error fetching order by paymentIntentId:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Get all orders for one user
router.get("/find/:email", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        const orderInfo = await Order.findOne({
            where: { email: req.params.email }
        });
        res.status(200).json(orderInfo);
    } catch (err) {
        res.status(500).json(err);
    }
});


// add new order to the database
router.post("/", async (req, res) => {
    try {
        const savedOrder = await Order.create(req.body);
        res.status(200).json(savedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

// changing order by admin only
router.put("/:id", tokenVerificationAndAdmin, async (req, res) => {
    try {
        // update order
        const [updated] = await Order.update(req.body, {
            where: { id: req.params.id }
        });

        if (updated === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updatedOrder = await Order.findByPk(req.params.id);
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json(error);
    }
});

// order deleting by admin only
router.delete("/:id",tokenVerificationAndAdmin,  async (req, res) => {
    try {
        await Order.destroy({
            where: { id: req.params.id }
        });
        res.status(200).json("Your order is deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});


// Get all orders by admin only
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

// get monthly income by admin only
router.get("/income",tokenVerificationAndAdmin, async (req, res) => {
    const todayDate = new Date();
    const lastMonth = new Date(todayDate.setMonth(todayDate.getMonth() - 1));

    try {
        const income = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: lastMonth
                }
            },
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'totalQuantity']
            ],
            group: [sequelize.fn('MONTH', sequelize.col('createdAt'))]
        });
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
