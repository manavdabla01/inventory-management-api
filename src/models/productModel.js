// This file talks to the "products" table directly.

const pool = require('../config/db');

async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  // rows is an array - if nothing matched, it's empty, so we return undefined
  return rows[0];
}

async function createProduct(productData) {
  const { sku, name, description, category_id, supplier_id, unit_price, reorder_level } = productData;

  const [result] = await pool.query(
    `INSERT INTO products (sku, name, description, category_id, supplier_id, unit_price, reorder_level)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      sku,
      name,
      description || null,
      category_id || null,
      supplier_id || null,
      unit_price || 0,
      reorder_level || 10
    ]
  );

  // result.insertId is the auto-generated id of the row we just created
  return getProductById(result.insertId);
}

async function updateProduct(id, productData) {
  // We only want to update the fields the client actually sent.
  const fieldsToUpdate = [];
  const values = [];

  const possibleFields = ['sku', 'name', 'description', 'category_id', 'supplier_id', 'unit_price', 'reorder_level'];

  for (const field of possibleFields) {
    if (productData[field] !== undefined) {
      fieldsToUpdate.push(`${field} = ?`);
      values.push(productData[field]);
    }
  }

  if (fieldsToUpdate.length === 0) {
    // Nothing to update, just return the product as-is
    return getProductById(id);
  }

  values.push(id); // for the WHERE clause at the end

  await pool.query(
    `UPDATE products SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
    values
  );

  return getProductById(id);
}

async function deleteProduct(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  // affectedRows tells us if a row actually got deleted
  return result.affectedRows > 0;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
