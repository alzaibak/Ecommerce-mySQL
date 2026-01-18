// routes/auth.js
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.SECRET_PASSWORD
      ).toString(),
    });

    const { password, ...userData } = newUser.toJSON();
    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

/* =========================
   SHARED LOGIN LOGIC
========================= */
const loginHandler = async (req, res, adminOnly = false) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (adminOnly && !user.isAdmin) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const decrypted = CryptoJS.AES.decrypt(
      user.password,
      process.env.SECRET_PASSWORD
    );

    const originalPassword = decrypted.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3d" }
    );

    const { password, ...userData } = user.toJSON();

    res.status(200).json({
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   CLIENT LOGIN
========================= */
router.post("/login", (req, res) => {
  loginHandler(req, res, false);
});

/* =========================
   ADMIN LOGIN
========================= */
router.post("/admin/login", (req, res) => {
  loginHandler(req, res, true);
});

module.exports = router;
