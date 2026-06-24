const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middlewares/authMiddleware');

router.get('/stats', protect, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const [orders, products, warehouses, shipments, payments, drivers] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM Orders WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*) FROM Products WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*) FROM Warehouses WHERE tenant_id = $1', [tenantId]),
      pool.query(`SELECT COUNT(*) FROM Shipments s JOIN Orders o ON s.order_id = o.order_id WHERE o.tenant_id = $1`, [tenantId]),
      pool.query('SELECT COUNT(*) FROM Payments WHERE tenant_id = $1', [tenantId]),
      pool.query('SELECT COUNT(*) FROM Drivers WHERE tenant_id = $1', [tenantId]),
    ]);

    res.json({
      orders:     parseInt(orders.rows[0].count),
      products:   parseInt(products.rows[0].count),
      warehouses: parseInt(warehouses.rows[0].count),
      shipments:  parseInt(shipments.rows[0].count),
      payments:   parseInt(payments.rows[0].count),
      drivers:    parseInt(drivers.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;