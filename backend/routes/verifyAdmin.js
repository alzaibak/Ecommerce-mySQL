const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json("No token provided");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json("Invalid token");

    if (!user.isAdmin) {
      return res.status(403).json("Admins only");
    }

    req.user = user;
    next();
  });
};
