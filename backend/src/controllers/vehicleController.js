const {
  getVehicles, createVehicle, updateVehicle, deleteVehicle
} = require('../models/vehicleModel');

const getAll = async (req, res) => {
  try {
    const data = await getVehicles(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { vehicleNumber, type, capacity, status } = req.body;
    const vehicle = await createVehicle(
      req.user.tenantId, vehicleNumber, type, capacity, status
    );
    res.status(201).json({ message: 'Vehicle created', vehicle });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Vehicle number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { vehicleNumber, type, capacity, status } = req.body;
    const vehicle = await updateVehicle(
      req.params.id, vehicleNumber, type, capacity, status
    );
    res.json({ message: 'Vehicle updated', vehicle });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteVehicle(req.params.id);
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };