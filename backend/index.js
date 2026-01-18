// express, mysql server import 
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
const stripe = require("./routes/stripe");
const contact = require("./routes/contact");
const category = require("./routes/category");

dotenv.config();

// MySQL database connection and sync
sequelize
    .authenticate()
    .then(() => {
        console.log("MySQL Database connection established successfully.");
        // Sync all models with database
        return sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    })
    .then(() => {
        console.log("Database synchronized successfully.");
    })
    .catch((err) => {
        console.error("Unable to connect to the database:", err);
    });

// Allow Localhost access to fetch data by react 
app.use(cors());

// Routes linking and using
app.use(express.json());
app.use("/api/auth", authenticationUser);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/stripe", stripe);
app.use("/api/", contact);
app.use("/api/categories", category);

// Server connection
app.listen(process.env.PORT || 5000, () => {
    console.log("Server connected on port", process.env.PORT || 5000);
});
