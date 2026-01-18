const router = require("express").Router();
const Product = require("../models/Product");
const { Op, Sequelize } = require('sequelize');
const CryptoJS = require("crypto-js");
const { tokenVerificationAndAuthorization } = require("./tokenVerification");

// Helper function to transform product data (id -> _id for frontend compatibility)
const transformProduct = (product) => {
  if (!product) return product;
  const productData = product.toJSON ? product.toJSON() : product;
  if (productData.id !== undefined) {
    productData._id = String(productData.id);
  }
  // Map description to desc for frontend compatibility
  if (productData.description !== undefined) {
    productData.desc = productData.description;
  }
  // Ensure price is a number (MySQL DECIMAL can be returned as string)
  if (productData.price !== undefined) {
    productData.price = typeof productData.price === 'string' 
      ? parseFloat(productData.price) 
      : Number(productData.price) || 0;
  }
  // Transform size and color from string to array if needed
  if (productData.size && typeof productData.size === 'string') {
    try {
      // Try to parse as JSON first
      productData.size = JSON.parse(productData.size);
    } catch {
      // If not JSON, treat as comma-separated or single value
      productData.size = productData.size.includes(',') 
        ? productData.size.split(',').map(s => s.trim())
        : [productData.size];
    }
  }
  if (productData.color && typeof productData.color === 'string') {
    try {
      // Try to parse as JSON first
      productData.color = JSON.parse(productData.color);
    } catch {
      // If not JSON, treat as comma-separated or single value
      productData.color = productData.color.includes(',') 
        ? productData.color.split(',').map(c => c.trim())
        : [productData.color];
    }
  }
  return productData;
};

const transformProducts = (products) => {
  if (Array.isArray(products)) {
    return products.map(transformProduct);
  }
  return transformProduct(products);
};

// Create new product and add it to the database (Admin only)
router.post("/", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        // Map desc to description for database
        const productData = { ...req.body };
        if (productData.desc) {
            productData.description = productData.desc;
            delete productData.desc;
        }
        const newAddedProduct = await Product.create(productData);
        res.status(200).json(transformProduct(newAddedProduct));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Identification admin ID at the routes and updating product (Admin only)
router.put("/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        // Map desc to description for database
        const productData = { ...req.body };
        if (productData.desc) {
            productData.description = productData.desc;
            delete productData.desc;
        }

        // update product information
        await Product.update(productData, {
            where: { id: req.params.id }
        });

        const updatedProduct = await Product.findByPk(req.params.id);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(transformProduct(updatedProduct));
    } catch (error) {
        res.status(500).json(error);
    }
});

// product deleting by admin (Admin only)
router.delete("/:id", tokenVerificationAndAuthorization, async (req, res) => {
    try {
        const deleted = await Product.destroy({
            where: { id: req.params.id }
        });
        if (deleted === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json("Your product is deleted");
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get one product information by everyone
router.get("/find/:id", async (req, res) => {
    try {
        const productInfo = await Product.findByPk(req.params.id);
        if (!productInfo) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(transformProduct(productInfo));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get all products by everyone
router.get("/", async (req, res) => {
    const queryNew = req.query.new;
    const queryCategory = req.query.category;

    try {
        let allProducts;

        if (queryNew) {
            allProducts = await Product.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5
            });
        } else if (queryCategory) {
            // For JSON column, use JSON_CONTAINS in MySQL or filter in JavaScript
            try {
                allProducts = await Product.findAll({
                    where: Sequelize.where(
                        Sequelize.fn('JSON_CONTAINS', Sequelize.col('categories'), JSON.stringify(queryCategory)),
                        1
                    )
                });
            } catch (err) {
                // Fallback: get all and filter in JavaScript
                const all = await Product.findAll();
                allProducts = all.filter(product => {
                    if (!product.categories) return false;
                    const cats = Array.isArray(product.categories) 
                        ? product.categories 
                        : JSON.parse(product.categories || "[]");
                    return cats.includes(queryCategory);
                });
            }
        } else {
            allProducts = await Product.findAll();
        }

        res.status(200).json(transformProducts(allProducts));
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
