const pool = require('../config/db');

async function getMovements(productId, warehouseId, type) {
  let sql = `
    SELECT
      m.id,
      m.product_id,
      p.sku,
      m.warehouse_id,
      w.name AS warehouse_name,
      m.type,
      m.quantity,
      m.reference,
      m.created_at
    FROM stock_movements m
    JOIN products p ON p.id = m.product_id
    JOIN warehouses w ON w.id = m.warehouse_id
    WHERE 1=1
  `;
  const values = [];

  if (productId) {
    sql += ' AND m.product_id = ?';
    values.push(productId);
  }

  if (warehouseId) {
    sql += ' AND m.warehouse_id = ?';
    values.push(warehouseId);
  }

  if (type) {
    sql += ' AND m.type = ?';
    values.push(type);
  }

  sql += ' ORDER BY m.created_at DESC LIMIT 200';

  const [rows] = await pool.query(sql, values);
  return rows;
}

module.exports = { getMovements };