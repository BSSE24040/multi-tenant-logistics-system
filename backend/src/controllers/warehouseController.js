const {
  getWarehouses, createWarehouse,
  updateWarehouse, deleteWarehouse
} = require('../models/warehouseModel');

const getAll = async (req, res) => {
  try {
    const data = await getWarehouses(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, location } = req.body;
    const warehouse = await createWarehouse(req.user.tenantId, name, location);
    res.status(201).json({ message: 'Warehouse created', warehouse });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, location } = req.body;
    const warehouse = await updateWarehouse(req.params.id, name, location);
    res.json({ message: 'Warehouse updated', warehouse });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteWarehouse(req.params.id);
    res.json({ message: 'Warehouse deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };