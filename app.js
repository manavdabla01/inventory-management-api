const express = require('express');

const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const warehouseRoutes = require('./src/routes/warehouseRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const authRoutes = require('./src/routes/authRoutes');
const requireAuth = require('./src/middleware/authMiddleware.js');
const app = express();

app.use(express.json());

// Simple route to check the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use('/api/products', requireAuth, productRoutes);
app.use('/api/categories', requireAuth, categoryRoutes);
app.use('/api/suppliers', requireAuth, supplierRoutes);
app.use('/api/warehouses', requireAuth, warehouseRoutes);
app.use('/api/inventory', requireAuth, inventoryRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
 
module.exports = app;