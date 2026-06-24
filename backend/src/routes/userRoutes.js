const express = require('express');
const router = express.Router();
const {
  getUsers, getOne, addUser,
  editUser, removeUser, getRoles,
} = require('../controllers/userController');
const { protect, hasPermission } = require('../middlewares/authMiddleware');

router.get('/roles',   protect, getRoles);
router.get('/',        protect, getUsers);
router.get('/:id',     protect, getOne);
router.post('/',       protect, hasPermission('manage_users'), addUser);
router.put('/:id',     protect, hasPermission('manage_users'), editUser);
router.delete('/:id',  protect, hasPermission('manage_users'), removeUser);

module.exports = router;
