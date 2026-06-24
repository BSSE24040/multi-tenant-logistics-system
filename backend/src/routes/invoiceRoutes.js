const express = require('express');
const router = express.Router();
const {
  getAll, create, updateStatus, remove
} = require('../controllers/invoiceController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',       protect, getAll);
router.post('/',      protect, hasPermission('manage_invoices'), create);
router.patch('/:id',  protect, hasPermission('manage_invoices'), updateStatus);
router.delete('/:id', protect, hasPermission('manage_invoices'), remove);

module.exports = router;