const categoryModel = require('../models/categoryModel');

// GET /api/categories
async function getAllCategories(req, res) {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching categories' });
  }
}

// GET /api/categories/:id
async function getCategoryById(req, res) {
  try {
    const category = await categoryModel.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching the category' });
  }
}

// POST /api/categories
async function createCategory(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const newCategory = await categoryModel.createCategory(name);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    res.status(500).json({ error: 'Something went wrong while creating the category' });
  }
}

// PUT /api/categories/:id
async function updateCategory(req, res) {
  try {
    const existingCategory = await categoryModel.getCategoryById(req.params.id);

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const updatedCategory = await categoryModel.updateCategory(req.params.id, name);
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while updating the category' });
  }
}

// DELETE /api/categories/:id
async function deleteCategory(req, res) {
  try {
    const wasDeleted = await categoryModel.deleteCategory(req.params.id);

    if (!wasDeleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while deleting the category' });
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};