const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/productController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',       protect, getAll);
router.post('/',      protect, hasPermission('manage_products'), create);
router.put('/:id',    protect, hasPermission('manage_products'), update);
router.delete('/:id', protect, hasPermission('manage_products'), remove);

module.exports = router;