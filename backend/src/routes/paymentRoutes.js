const express = require('express');
const router = express.Router();
const {
  getAll, create, updateStatus, remove, getSummary
} = require('../controllers/paymentController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

// SUMMARY MUST BE FIRST before any /:id routes
router.get('/summary', protect, getSummary);
router.get('/',        protect, getAll);
router.post('/',       protect, hasPermission('create_payments'), create);
router.patch('/:id',   protect, hasPermission('manage_payments'), updateStatus);
router.delete('/:id',  protect, hasPermission('manage_payments'), remove);

module.exports = router;