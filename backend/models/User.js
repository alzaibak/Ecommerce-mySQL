const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        // REMOVE unique: true
    },
    lastName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        // REMOVE unique: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true // keep email unique
    },
    subscribe: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    password: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

module.exports = User;
