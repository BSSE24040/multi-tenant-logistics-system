const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/vehicleController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',       protect, getAll);
router.post('/',      protect, hasPermission('manage_vehicles'), create);
router.put('/:id',    protect, hasPermission('manage_vehicles'), update);
router.delete('/:id', protect, hasPermission('manage_vehicles'), remove);

module.exports = router;