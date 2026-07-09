const productModel = require('../models/productModel');

// GET /api/products
async function getAllProducts(req, res) {
  try {
    const products = await productModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching products' });
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const product = await productModel.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching the product' });
  }
}

// POST /api/products
async function createProduct(req, res) {
  try {
    const { sku, name } = req.body;

    if (!sku || !name) {
      return res.status(400).json({ error: 'sku and name are required' });
    }

    const newProduct = await productModel.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);

    // MySQL throws this specific error code when the sku already exists
    // (because of the UNIQUE constraint in the schema)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }

    res.status(500).json({ error: 'Something went wrong while creating the product' });
  }
}

// PUT /api/products/:id
async function updateProduct(req, res) {
  try {
    const existingProduct = await productModel.getProductById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await productModel.updateProduct(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while updating the product' });
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res) {
  try {
    const wasDeleted = await productModel.deleteProduct(req.params.id);

    if (!wasDeleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while deleting the product' });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
