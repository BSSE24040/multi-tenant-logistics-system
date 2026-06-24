const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'MLSCCS API is running' });
});

const authRoutes      = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const tenantRoutes    = require('./routes/tenantRoutes');
const userRoutes      = require('./routes/userRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const productRoutes   = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes     = require('./routes/orderRoutes');
const shipmentRoutes  = require('./routes/shipmentRoutes');
const vehicleRoutes   = require('./routes/vehicleRoutes');
const driverRoutes    = require('./routes/driverRoutes');
const paymentRoutes   = require('./routes/paymentRoutes');
const invoiceRoutes   = require('./routes/invoiceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth',       authRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/tenants',    tenantRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/shipments',  shipmentRoutes);
app.use('/api/vehicles',   vehicleRoutes);
app.use('/api/drivers',    driverRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/invoices',   invoiceRoutes);
app.use('/api/analytics',  analyticsRoutes);

module.exports = app;