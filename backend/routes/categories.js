// routes/categories.js
const router = require("express").Router();
const Category = require("../models/Category");
const { Op } = require('sequelize');
const { tokenVerificationAndAuthorization } = require("./tokenVerification");

// Helper to transform category data
const transformCategory = (category) => {
  if (!category) return category;
  const categoryData = category.toJSON ? category.toJSON() : category;
  if (categoryData.id !== undefined) {
    categoryData._id = String(categoryData.id);
  }
  return categoryData;
};

const transformCategories = (categories) => {
  if (Array.isArray(categories)) {
    return categories.map(transformCategory);
  }
  return transformCategory(categories);
};

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.status(200).json(transformCategories(categories));
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(transformCategory(category));
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create category (Admin only)
router.post("/", tokenVerificationAndAuthorization, async (req, res) => {
  try {
    const newCategory = await Category.create(req.body);
    res.status(201).json(transformCategory(newCategory));
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update category (Admin only)
router.put("/:id", tokenVerificationAndAuthorization, async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (updated === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const updatedCategory = await Category.findByPk(req.params.id);
    res.status(200).json(transformCategory(updatedCategory));
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete category (Admin only)
router.delete("/:id", tokenVerificationAndAuthorization, async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { id: req.params.id }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;