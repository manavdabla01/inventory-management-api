const warehouseModel = require('../models/warehouseModel');

// GET /api/warehouses
async function getAllWarehouses(req, res) {
  try {
    const warehouses = await warehouseModel.getAllWarehouses();
    res.json(warehouses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching warehouses' });
  }
}

// GET /api/warehouses/:id
async function getWarehouseById(req, res) {
  try {
    const warehouse = await warehouseModel.getWarehouseById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.json(warehouse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching the warehouse' });
  }
}

// POST /api/warehouses
async function createWarehouse(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const newWarehouse = await warehouseModel.createWarehouse(req.body);
    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating the warehouse' });
  }
}

// PUT /api/warehouses/:id
async function updateWarehouse(req, res) {
  try {
    const existingWarehouse = await warehouseModel.getWarehouseById(req.params.id);

    if (!existingWarehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    if (!req.body.name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const updatedWarehouse = await warehouseModel.updateWarehouse(req.params.id, req.body);
    res.json(updatedWarehouse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while updating the warehouse' });
  }
}

// DELETE /api/warehouses/:id
async function deleteWarehouse(req, res) {
  try {
    const wasDeleted = await warehouseModel.deleteWarehouse(req.params.id);

    if (!wasDeleted) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while deleting the warehouse' });
  }
}

module.exports = {
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
};