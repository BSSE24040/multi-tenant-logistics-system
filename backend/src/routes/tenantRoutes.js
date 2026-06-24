const express = require('express');
const router = express.Router();
const { getAll, getOne, update, remove } = require('../controllers/tenantController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',       protect, getAll);
router.get('/:id',    protect, getOne);
router.put('/:id',    protect, hasPermission('manage_tenants'), update);
router.delete('/:id', protect, hasPermission('manage_tenants'), remove);

module.exports = router;