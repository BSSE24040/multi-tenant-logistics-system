const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/warehouseController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',       protect, getAll);
router.post('/',      protect, hasPermission('manage_warehouses'), create);
router.put('/:id',    protect, hasPermission('manage_warehouses'), update);
router.delete('/:id', protect, hasPermission('manage_warehouses'), remove);

module.exports = router;