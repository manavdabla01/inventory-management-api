const pool = require('../config/db');

async function getAllCategories() {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY id DESC');
  return rows;
}

async function getCategoryById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
  return rows[0];
}

async function createCategory(name) {
  const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return getCategoryById(result.insertId);
}

async function updateCategory(id, name) {
  await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return getCategoryById(id);
}

async function deleteCategory(id) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
 

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}