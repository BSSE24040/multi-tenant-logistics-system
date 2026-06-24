const express = require('express');
const router = express.Router();
const {
  getAll, setStock, adjustStock, getMovements,
  lowStock, transfer, removeInventory, removeMovement
} = require('../controllers/inventoryController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/',                protect, getAll);
router.get('/movements',       protect, getMovements);
router.get('/lowstock',        protect, lowStock);
router.post('/set',            protect, hasPermission('manage_inventory'), setStock);
router.post('/adjust',         protect, hasPermission('manage_inventory'), adjustStock);
router.post('/transfer',       protect, hasPermission('manage_inventory'), transfer);
router.delete('/item/:id',     protect, hasPermission('manage_inventory'), removeInventory);
router.delete('/movement/:id', protect, hasPermission('manage_inventory'), removeMovement);

module.exports = router;