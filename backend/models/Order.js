const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Use the configured instance

const Order = sequelize.define('Order', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  orderNumber: { 
    type: DataTypes.STRING(10), 
    unique: true 
  },
  paymentIntentId: { 
    type: DataTypes.STRING 
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    ),
    defaultValue: 'pending'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  shipping: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  total: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: true
  },
  address: {
    type: DataTypes.JSON,
    allowNull: true
  },
  adminNote: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;
