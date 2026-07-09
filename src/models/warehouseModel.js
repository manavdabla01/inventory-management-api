const pool = require('../config/db');

async function getAllWarehouses() {
  const [rows] = await pool.query('SELECT * FROM warehouses ORDER BY id DESC');
  return rows;
}

async function getWarehouseById(id) {
  const [rows] = await pool.query('SELECT * FROM warehouses WHERE id = ?', [id]);
  return rows[0];
}

async function createWarehouse(warehouseData) {
  const { name, location } = warehouseData;
  const [result] = await pool.query(
    'INSERT INTO warehouses (name, location) VALUES (?, ?)',
    [name, location || null]
  );
  return getWarehouseById(result.insertId);
}

async function updateWarehouse(id, warehouseData) {
  const { name, location } = warehouseData;
  await pool.query(
    'UPDATE warehouses SET name = ?, location = ? WHERE id = ?',
    [name, location || null, id]
  );
  return getWarehouseById(id);
}

async function deleteWarehouse(id) {
  const [result] = await pool.query('DELETE FROM warehouses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};