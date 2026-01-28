const router = require("express").Router();
const Product = require("../models/Product");
const { Op, Sequelize } = require('sequelize');
const { tokenVerificationAndAuthorization, tokenVerificationAndAdmin } = require("./tokenVerification");

// Helper function to transform product data
const transformProduct = (product) => {
  if (!product) return product;
  
  const productData = product.toJSON ? product.toJSON() : product;
  
  // Map id to _id for frontend compatibility
  if (productData.id !== undefined) {
    productData._id = String(productData.id);
  }
  
  // Map description to desc for frontend compatibility
  if (productData.description !== undefined) {
    productData.desc = productData.description;
  }
  
  // Ensure price is a number
  if (productData.price !== undefined) {
    productData.price = typeof productData.price === 'string' 
      ? parseFloat(productData.price) 
      : Number(productData.price) || 0;
  }
  
  // Handle DiscountPrice (with capital D from model) to discountPrice (for frontend)
  if (productData.DiscountPrice !== undefined && productData.DiscountPrice !== null) {
    productData.discountPrice = typeof productData.DiscountPrice === 'string' 
      ? parseFloat(productData.DiscountPrice) 
      : Number(productData.DiscountPrice);
  } else {
    productData.discountPrice = null;
  }
  
  // Ensure stockByVariant is an object
  if (!productData.stockByVariant || typeof productData.stockByVariant === 'string') {
    try {
      productData.stockByVariant = productData.stockByVariant 
        ? JSON.parse(productData.stockByVariant)
        : {};
    } catch (e) {
      productData.stockByVariant = {};
    }
  }
  
  // Ensure attributes is an object
  if (!productData.attributes || typeof productData.attributes === 'string') {
    try {
      productData.attributes = productData.attributes 
        ? JSON.parse(productData.attributes)
        : {};
    } catch (e) {
      productData.attributes = {};
    }
  }
  
  // Remove the capital D version to avoid confusion
  delete productData.DiscountPrice;
  
  return productData;
};

const transformProducts = (products) => {
  if (Array.isArray(products)) {
    return products.map(transformProduct);
  }
  return transformProduct(products);
};

// Create new product (Admin only)
router.post("/", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Map desc to description for database
    if (productData.desc) {
      productData.description = productData.desc;
      delete productData.desc;
    }
    
    // Map discountPrice to DiscountPrice for database (with capital D)
    if (productData.discountPrice !== undefined) {
      productData.DiscountPrice = productData.discountPrice;
      delete productData.discountPrice;
    }
    
    // Ensure attributes and stockByVariant are stored as JSON strings
    if (productData.attributes && typeof productData.attributes !== 'string') {
      productData.attributes = JSON.stringify(productData.attributes);
    }
    
    if (productData.stockByVariant && typeof productData.stockByVariant !== 'string') {
      productData.stockByVariant = JSON.stringify(productData.stockByVariant);
    }
    
    const newAddedProduct = await Product.create(productData);
    res.status(200).json(transformProduct(newAddedProduct));
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Error creating product', error: err.message });
  }
});

// Update product (Admin only)
router.put("/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const productData = { ...req.body };
    
    // Map desc to description for database
    if (productData.desc) {
      productData.description = productData.desc;
      delete productData.desc;
    }
    
    // Map discountPrice to DiscountPrice for database
    if (productData.discountPrice !== undefined) {
      productData.DiscountPrice = productData.discountPrice;
      delete productData.discountPrice;
    }
    
    // Ensure attributes and stockByVariant are stored as JSON strings
    if (productData.attributes && typeof productData.attributes !== 'string') {
      productData.attributes = JSON.stringify(productData.attributes);
    }
    
    if (productData.stockByVariant && typeof productData.stockByVariant !== 'string') {
      productData.stockByVariant = JSON.stringify(productData.stockByVariant);
    }
    
    await Product.update(productData, {
      where: { id: req.params.id }
    });

    const updatedProduct = await Product.findByPk(req.params.id);
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(transformProduct(updatedProduct));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product (Admin only)
router.delete("/:id", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });
    if (deleted === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Get one product by ID
router.get("/find/:id", async (req, res) => {
  try {
    const productInfo = await Product.findByPk(req.params.id);
    if (!productInfo) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(transformProduct(productInfo));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

// Get all products with filters
router.get("/", async (req, res) => {
  const queryNew = req.query.new;
  const queryCategory = req.query.category;
  const queryFeatured = req.query.featured;
  const queryLimit = req.query.limit;
  const queryPage = req.query.page;
  const querySearch = req.query.search;

  try {
    let where = {};
    let order = [['createdAt', 'DESC']];
    let limit = queryLimit ? parseInt(queryLimit) : null;
    let offset = queryPage && queryLimit ? (parseInt(queryPage) - 1) * parseInt(queryLimit) : null;

    // Apply category filter
    if (queryCategory && queryCategory !== 'all') {
      where.categoryId = queryCategory;
    }

    // Apply featured filter
    if (queryFeatured) {
      where.featured = true;
    }

    // Apply search filter
    if (querySearch) {
      where.title = {
        [Op.like]: `%${querySearch}%`
      };
    }

    // For new products, we already order by createdAt DESC
    if (queryNew) {
      // Return 6 products for home page by default
      limit = limit || 6;
    }

    const allProducts = await Product.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      order,
      limit,
      offset,
    });

    res.status(200).json(transformProducts(allProducts));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// Update product attributes
router.put("/:id/attributes", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { attributes } = req.body;
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Convert attributes to JSON string for storage
    const attributesJson = typeof attributes === 'string' ? attributes : JSON.stringify(attributes);
    await product.update({ attributes: attributesJson });
    
    res.status(200).json(transformProduct(product));
  } catch (error) {
    console.error('Error updating attributes:', error);
    res.status(500).json({ message: 'Error updating attributes', error: error.message });
  }
});

// Update stock by variant
router.put("/:id/stock-by-variant", tokenVerificationAndAdmin, async (req, res) => {
  try {
    const { stockByVariant } = req.body;
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Convert stockByVariant to JSON string for storage
    const stockJson = typeof stockByVariant === 'string' ? stockByVariant : JSON.stringify(stockByVariant);
    await product.update({ stockByVariant: stockJson });
    
    // Check if product is still in stock
    if (stockByVariant) {
      const totalStock = Object.values(stockByVariant).reduce((a, b) => a + b, 0);
      await product.update({ inStock: totalStock > 0 });
    }
    
    res.status(200).json(transformProduct(product));
  } catch (error) {
    console.error('Error updating variant stock:', error);
    res.status(500).json({ message: 'Error updating variant stock', error: error.message });
  }
});

module.exports = router;