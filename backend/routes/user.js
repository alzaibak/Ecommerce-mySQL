const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { tokenVerificationAndAuthorization, verifyAdmin } = require("./tokenVerification");

// Identification of users by using ID in the routes and updating his information
router.put("/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_PASSWORD).toString();
        }

        // update user information (username, email, password)
        await User.update(req.body, {
            where: { id: req.params.id }
        });

        const updatedUser = await User.findByPk(req.params.id);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json(error);
    }
});

// User account deleting (Admin only)
router.delete("/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        const deleted = await User.destroy({
            where: { id: req.params.id }
        });
        if (deleted === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json("User account is deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get one user information by Admin only
router.get("/find/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        const userInfo = await User.findByPk(req.params.id);
        if (userInfo && userInfo.isAdmin === true) {
            const { password, ...userData } = userInfo.toJSON();
            res.status(200).json(userData);
        } else {
            res.status(500).json("You are not admin");
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get all users information by Admin only
router.get("/", async (req, res) => {
    const newQuery = req.query.new;
    try {
        let users;
        if (newQuery) {
            users = await User.findAll({
                order: [['id', 'DESC']],
                limit: 5,
                attributes: { exclude: ['password'] }
            });
        } else {
            users = await User.findAll({
                attributes: { exclude: ['password'] }
            });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get user stats by Admin only (MySQL aggregate method)
router.get("/stats", async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const lastYearUsers = await User.findAll({
            where: {
                createdAt: {
                    [Op.gte]: lastYear
                }
            },
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalQuantity']
            ],
            group: [sequelize.fn('MONTH', sequelize.col('createdAt'))]
        });
        res.status(200).json(lastYearUsers);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;


