const express = require('express');
const router = express.Router();
const {
  getAll, getOne, create, updateStatus, remove
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/',           protect, getAll);
router.get('/:id',        protect, getOne);
router.post('/',          protect, create);
router.patch('/:id',      protect, updateStatus);
router.delete('/:id',     protect, remove);

module.exports = router;