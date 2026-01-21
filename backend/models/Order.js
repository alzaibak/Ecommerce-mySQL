const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    customerId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    paymentIntentId: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    orderNumber: {
        type: DataTypes.STRING(6),
        allowNull: false,
        unique: true
    },
    products: {
        type: DataTypes.JSON,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    address: {
        type: DataTypes.JSON,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'livred', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    }
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = Order;
