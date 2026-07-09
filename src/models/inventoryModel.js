const pool = require('../config/db');


async function getStockLevels(productId, warehouseId) {
  let sql = `
    SELECT
      i.id,
      i.product_id,
      p.sku,
      p.name AS product_name,
      i.warehouse_id,
      w.name AS warehouse_name,
      i.quantity
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    JOIN warehouses w ON w.id = i.warehouse_id
    WHERE 1=1
  `;
  const values = [];

  if (productId) {
    sql += ' AND i.product_id = ?';
    values.push(productId);
  }

  if (warehouseId) {
    sql += ' AND i.warehouse_id = ?';
    values.push(warehouseId);
  }

  const [rows] = await pool.query(sql, values);
  return rows;
}


async function getLowStockItems() {
  const [rows] = await pool.query(`
    SELECT
      p.id AS product_id,
      p.sku,
      p.name,
      w.id AS warehouse_id,
      w.name AS warehouse_name,
      i.quantity,
      p.reorder_level
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    JOIN warehouses w ON w.id = i.warehouse_id
    WHERE i.quantity <= p.reorder_level
    ORDER BY i.quantity ASC
  `);
  return rows;
}

module.exports = {
  getStockLevels,
  getLowStockItems
};