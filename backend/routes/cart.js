const router = require("express").Router();
const Cart = require("../models/Cart");
const CryptoJS = require("crypto-js");
const { tokenVerification, tokenVerificationAndAuthorization, tokenVerificationAndAdmin } = require("./tokenVerification");

// add new product to the cart
router.post("/", tokenVerification, async (req, res) => {
    try {
        const savedCart = await Cart.create(req.body);
        res.status(200).json(savedCart);
    } catch (err) {
        res.status(500).json(err);
    }
});

// changing cart
router.put("/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_PASSWORD).toString();
        }

        // update cart
        await Cart.update(req.body, {
            where: { id: req.params.id }
        });

        const updatedCart = await Cart.findByPk(req.params.id);
        res.status(200).json(updatedCart);
    } catch (error) {
        res.status(500).json(error);
    }
});

// cart deleting
router.delete("/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        await Cart.destroy({
            where: { id: req.params.id }
        });
        res.status(200).json("Your cart is deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get user cart
router.get("/find/:userId", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        const cartInfo = await Cart.findOne({
            where: { userId: req.params.userId }
        });
        res.status(200).json(cartInfo);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all carts for all users by admin only
router.get("/", tokenVerificationAndAdmin, async (req, res) => {
    try {
        const carts = await Cart.findAll();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
