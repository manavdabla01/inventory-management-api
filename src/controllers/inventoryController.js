const pool = require('../config/db');
const inventoryModel = require('../models/inventoryModel');
const movementModel = require('../models/movementModel');

// GET /api/inventory
async function getStock(req, res) {
  try {
    const { productId, warehouseId } = req.query;
    const stock = await inventoryModel.getStockLevels(productId, warehouseId);
    res.json(stock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching stock levels' });
  }
}

// GET /api/inventory/low-stock
async function getLowStock(req, res) {
  try {
    const lowStockItems = await inventoryModel.getLowStockItems();
    res.json(lowStockItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching low stock items' });
  }
}

// GET /api/inventory/movements
async function getMovements(req, res) {
  try {
    const { productId, warehouseId, type } = req.query;
    const movements = await movementModel.getMovements(productId, warehouseId, type);
    res.json(movements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching stock movements' });
  }
}

// POST /api/inventory/stock-in
// Adding stock touches two tables: it raises the quantity in "inventory"
// AND writes a record in "stock_movements" so there's a history of what
// happened. We wrap both queries in a transaction so they either both
// succeed, or - if anything goes wrong - neither one does.
async function stockIn(req, res) {
  const { productId, warehouseId, quantity, reference } = req.body;

  if (!productId || !warehouseId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'productId, warehouseId and a positive quantity are required' });
  }

  // Borrow a single connection from the pool. We need to run several
  // queries as ONE transaction, so they all have to go through the
  // same connection (the pool itself can't do that for us).
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // If a row already exists for this product+warehouse pair, add to its
    // quantity. Otherwise create a new row. This works because of the
    // UNIQUE KEY on (product_id, warehouse_id) defined in schema.sql.
    await connection.query(
      `INSERT INTO inventory (product_id, warehouse_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [productId, warehouseId, quantity, quantity]
    );

    await connection.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, type, quantity, reference)
       VALUES (?, ?, 'IN', ?, ?)`,
      [productId, warehouseId, quantity, reference || null]
    );

    // Both queries worked, so make the changes permanent
    await connection.commit();

    res.json({ message: 'Stock added successfully' });
  } catch (error) {
    // Something failed - undo anything the transaction already did
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while adding stock' });
  } finally {
    // Always give the connection back to the pool, whether we succeeded or not
    connection.release();
  }
}

// POST /api/inventory/stock-out
// Removing stock needs one extra safety check compared to stock-in:
// we have to make sure there's actually enough stock before we subtract.
// And because two requests could come in at almost the same time, we use
// "FOR UPDATE" to lock the row while we check it, so nobody else can
// read or change it until we're done with our transaction.
async function stockOut(req, res) {
  const { productId, warehouseId, quantity, reference } = req.body;

  if (!productId || !warehouseId || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'productId, warehouseId and a positive quantity are required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // FOR UPDATE locks this row until we commit or rollback. Without it,
    // two simultaneous requests could both see "50 in stock" and both
    // approve an order for 40 units - leaving us with -30 in reality.
    const [rows] = await connection.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND warehouse_id = ? FOR UPDATE',
      [productId, warehouseId]
    );

    const currentQuantity = rows.length > 0 ? rows[0].quantity : 0;

    if (currentQuantity < quantity) {
      // Not enough stock - undo the transaction and tell the client why
      await connection.rollback();
      return res.status(409).json({
        error: `Not enough stock. Available: ${currentQuantity}, requested: ${quantity}`
      });
    }

    await connection.query(
      'UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?',
      [quantity, productId, warehouseId]
    );

    await connection.query(
      `INSERT INTO stock_movements (product_id, warehouse_id, type, quantity, reference)
       VALUES (?, ?, 'OUT', ?, ?)`,
      [productId, warehouseId, quantity, reference || null]
    );

    await connection.commit();

    res.json({ message: 'Stock removed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while removing stock' });
  } finally {
    connection.release();
  }
}

module.exports = {
  getStock,
  getLowStock,
  getMovements,
  stockIn,
  stockOut
};
