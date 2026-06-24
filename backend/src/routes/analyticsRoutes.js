const express = require('express');
const router = express.Router();
const {
  overview, ordersByStatus,
  revenueByMethod, shipmentsByStatus
} = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/overview',           protect, overview);
router.get('/orders-by-status',   protect, ordersByStatus);
router.get('/revenue-by-method',  protect, revenueByMethod);
router.get('/shipments-by-status',protect, shipmentsByStatus);

module.exports = router;