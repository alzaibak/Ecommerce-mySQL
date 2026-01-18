# MySQL Backend API

This is an Express.js backend converted from MongoDB to MySQL using Sequelize ORM.

## Setup Instructions

### 1. Install Dependencies
```bash
cd mysql-backend
npm install
```

### 2. Configure Environment
Copy the `.env.example` to `.env` and fill in your MySQL credentials:
```bash
cp .env.example .env
```

### 3. Create MySQL Database
Create a database in MySQL:
```sql
CREATE DATABASE your_database_name;
```

### 4. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Key Differences from MongoDB Version

| MongoDB (Mongoose) | MySQL (Sequelize) |
|-------------------|-------------------|
| `Model.findById(id)` | `Model.findByPk(id)` |
| `Model.findOne({field: value})` | `Model.findOne({ where: { field: value } })` |
| `Model.find()` | `Model.findAll()` |
| `Model.findByIdAndUpdate(id, data)` | `Model.update(data, { where: { id } })` |
| `Model.findByIdAndDelete(id)` | `Model.destroy({ where: { id } })` |
| `new Model(data).save()` | `Model.create(data)` |
| `$match`, `$project`, `$group` | Sequelize `fn()`, `col()`, `group` |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/find/:id` - Get user by ID
- `GET /api/users/stats` - Get user statistics
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/find/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `GET /api/cart/find/:userId` - Get user's cart
- `GET /api/cart` - Get all carts (admin)
- `POST /api/cart` - Create cart
- `PUT /api/cart/:id` - Update cart
- `DELETE /api/cart/:id` - Delete cart

### Orders
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/find/:userId` - Get user's orders
- `GET /api/orders/income` - Get monthly income
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Stripe
- `POST /api/stripe/create-checkout-session` - Create checkout
- `POST /api/stripe/webhook` - Stripe webhook
- `GET /api/stripe/checkout-session/:sessionId` - Get session

### Contact
- `POST /api/contact` - Send contact email

## Database Schema

Tables are automatically created by Sequelize when you run the server:
- `users` - User accounts
- `products` - Product catalog
- `carts` - Shopping carts
- `orders` - Customer orders
