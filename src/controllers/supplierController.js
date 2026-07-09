const supplierModel = require('../models/supplierModel');

// GET /api/suppliers
async function getAllSuppliers(req, res) {
  try {
    const suppliers = await supplierModel.getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching suppliers' });
  }
}

// GET /api/suppliers/:id
async function getSupplierById(req, res) {
  try {
    const supplier = await supplierModel.getSupplierById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while fetching the supplier' });
  }
}

// POST /api/suppliers
async function createSupplier(req, res) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const newSupplier = await supplierModel.createSupplier(req.body);
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating the supplier' });
  }
}

// PUT /api/suppliers/:id
async function updateSupplier(req, res) {
  try {
    const existingSupplier = await supplierModel.getSupplierById(req.params.id);

    if (!existingSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    if (!req.body.name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const updatedSupplier = await supplierModel.updateSupplier(req.params.id, req.body);
    res.json(updatedSupplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while updating the supplier' });
  }
}

// DELETE /api/suppliers/:id
async function deleteSupplier(req, res) {
  try {
    const wasDeleted = await supplierModel.deleteSupplier(req.params.id);

    if (!wasDeleted) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while deleting the supplier' });
  }
}

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};