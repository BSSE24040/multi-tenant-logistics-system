const {
  getUsersByTenant, getUserById, createUser,
  updateUser, deleteUser, getAllRoles,
} = require('../models/userModel');
const { hashPassword } = require('../utils/hashPassword');

const getUsers = async (req, res) => {  //to get users
  try {
    const users = await getUsersByTenant(req.user.tenantId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOne = async (req, res) => { //to get user based on id
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addUser = async (req, res) => {  //to add a user 
  try {
    const { name, email, password, roleId } = req.body; //getting the required fields from body
    const hashed = await hashPassword(password);
    const user = await createUser(
      req.user.tenantId, roleId, name, email, hashed
    );
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email already exists' }); //print already exists 
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const editUser = async (req, res) => {
  try {
    const { name, email, roleId, isActive } = req.body;
    const user = await updateUser(req.params.id, name, email, roleId, isActive);
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const removeUser = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });  //error
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await getAllRoles();
    res.json(roles); //return response
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUsers, getOne, addUser, editUser, removeUser, getRoles };