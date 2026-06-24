const {
  getOrders, getOrderById,
  createOrder, updateOrderStatus, deleteOrder
} = require('../models/orderModel');

const getAll = async (req, res) => {
  try {
    const data = await getOrders(req.user.tenantId);
    res.json(data); //return the data 
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const data = await getOrderById(req.params.id); //get the order by id 
    if (!data) return res.status(404).json({ message: 'Order not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { customerName, items } = req.body; //get the required fields from the body 
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }
    const order = await createOrder(req.user.tenantId, customerName, items);
    res.status(201).json({ message: 'Order created', order });
  } catch (err) {
         //send the exact error message (insufficient stock)
    res.status(400).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body; //get status from body 
    const order = await updateOrderStatus(req.params.id, status);
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteOrder(req.params.id);
    res.json({ message: 'Order deleted' }); //return the message 
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, getOne, create, updateStatus, remove };