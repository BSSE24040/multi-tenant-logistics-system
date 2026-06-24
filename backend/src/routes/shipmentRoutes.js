const express = require('express');
const router = express.Router();
const { getAll, create, updateStatus, remove } = require('../controllers/shipmentController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',       protect, getAll);
router.post('/',      protect, hasPermission('manage_shipments'), create);
router.patch('/:id',  protect, hasPermission('manage_shipments'), updateStatus);
router.delete('/:id', protect, hasPermission('manage_shipments'), remove);

module.exports = router;