const pool = require('../config/db');

async function getAllSuppliers() {
  const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
  return rows;
}

async function getSupplierById(id) {
  const [rows] = await pool.query('SELECT * FROM suppliers WHERE id = ?', [id]);
  return rows[0];
}

async function createSupplier(supplierData) {
  const { name, contact_email, phone } = supplierData;
  const [result] = await pool.query(
    'INSERT INTO suppliers (name, contact_email, phone) VALUES (?, ?, ?)',
    [name, contact_email || null, phone || null]
  );
  return getSupplierById(result.insertId);
}

async function updateSupplier(id, supplierData) {
  const { name, contact_email, phone } = supplierData;
  await pool.query(
    'UPDATE suppliers SET name = ?, contact_email = ?, phone = ? WHERE id = ?',
    [name, contact_email || null, phone || null, id]
  );
  return getSupplierById(id);
}

async function deleteSupplier(id) {
  const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};