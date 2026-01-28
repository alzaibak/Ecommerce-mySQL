const express = require("express");
const app = express();
const sequelize = require("./config/database");
const dotenv = require("dotenv");
const cors = require("cors");

// Routes import
const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const authenticationUser = require("./routes/authentication");
const stripeRoute = require("./routes/stripe");
const stripeWebhook = require("./routes/stripeWebhook");
const contact = require("./routes/contact");
const categoryRoutes = require('./routes/categories'); 
// In your main server file

// ⚠️ Stripe webhook must be first
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Normal middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authenticationUser);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/stripe", stripeRoute);
app.use("/api/contact", contact);
app.use("/api/contact", contact);


// Database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("MySQL Database connection established successfully.");
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log("Database synchronized successfully."))
  .catch((err) => console.error("DB connection error:", err));

// Server start
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port", process.env.PORT || 5000);
});
