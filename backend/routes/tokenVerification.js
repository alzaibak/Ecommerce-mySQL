// middleware/tokenVerification.js
const jsonWebToken = require("jsonwebtoken");


// Base verification
const tokenVerification = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "You are not authenticated" });

  const token = authHeader.split(" ")[1];

  jsonWebToken.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Wrong token" });

    req.user = user; // { id, email, isAdmin }
    next();
  });
};

// User OR admin (by id)
const tokenVerificationAndAuthorization = (req, res, next) => {
  tokenVerification(req, res, () => {
    if (req.user.id === Number(req.params.id) || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not allowed");
    }
  });
};

// Admin only
const tokenVerificationAndAdmin = (req, res, next) => {
  tokenVerification(req, res, () => {
    if (req.user.isAdmin) next();
    else res.status(403).json("You are not admin");
  });
};

module.exports = {
  tokenVerification,
  tokenVerificationAndAuthorization,
  tokenVerificationAndAdmin,
};
