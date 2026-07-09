const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.getStock);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/movements', inventoryController.getMovements);
router.post('/stock-in', inventoryController.stockIn);
router.post('/stock-out', inventoryController.stockOut);

module.exports = router;