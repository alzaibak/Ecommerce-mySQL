// models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    img: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    DiscountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        }
      },
    inStock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    stockByVariant: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    }
  },
  {
    tableName: 'products',
    timestamps: true,
    hooks: {
      beforeSave(product) {
        const stock = product.stockByVariant || {};
        const hasStock = Object.values(stock).some(qty => qty > 0);
        product.inStock = hasStock;
      }
    }
  }
);

/**
 * Generate a variant key from attributes
 */
Product.prototype.getVariantKey = function (attrs) {
  if (!attrs || Object.keys(attrs).length === 0) {
    return '';
  }

  const keys = Object.keys(attrs);
  if (keys.length === 1) {
    return attrs[keys[0]];
  }

  return keys
    .sort()
    .map(key => attrs[key])
    .join('_');
};

/**
 * Get stock for a specific variant
 */
Product.prototype.getStock = function (attrs) {
  if (!attrs || Object.keys(attrs).length === 0) {
    const stock = this.stockByVariant || {};
    return Object.values(stock).reduce((sum, qty) => sum + qty, 0);
  }

  const key = this.getVariantKey(attrs);
  if (!key) return 0;

  return this.stockByVariant[key] || 0;
};

/**
 * Check if variant is in stock
 */
Product.prototype.isVariantInStock = function (attrs) {
  return this.getStock(attrs) > 0;
};

/**
 * Get all available variants with their stock
 */
Product.prototype.getAvailableVariants = function () {
  const stockByVariant = this.stockByVariant || {};
  const variants = [];

  for (const [variantKey, stock] of Object.entries(stockByVariant)) {
    variants.push({
      variantKey,
      stock,
      isAvailable: stock > 0
    });
  }

  return variants;
};

/**
 * Reduce stock for a variant
 */
Product.prototype.decreaseStock = async function (attrs, quantity = 1) {
  if (!attrs || Object.keys(attrs).length === 0) {
    throw new Error('No attributes specified for variant');
  }

  const key = this.getVariantKey(attrs);
  if (!key) {
    throw new Error('Could not determine variant key');
  }

  const currentStock = this.stockByVariant[key] || 0;

  if (currentStock < quantity) {
    throw new Error(
      `Not enough stock for variant ${key}. Available: ${currentStock}, Requested: ${quantity}`
    );
  }

  this.stockByVariant[key] = currentStock - quantity;
  await this.save();

  return this.stockByVariant[key];
};

/**
 * Add stock for a variant
 */
Product.prototype.increaseStock = async function (attrs, quantity = 1) {
  if (!attrs || Object.keys(attrs).length === 0) {
    throw new Error('No attributes specified for variant');
  }

  const key = this.getVariantKey(attrs);
  if (!key) {
    throw new Error('Could not determine variant key');
  }

  const currentStock = this.stockByVariant[key] || 0;
  this.stockByVariant[key] = currentStock + quantity;

  await this.save();
  return this.stockByVariant[key];
};

module.exports = Product;
