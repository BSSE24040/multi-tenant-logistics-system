const {
  getDrivers, createDriver, updateDriver, deleteDriver
} = require('../models/driverModel');

const getAll = async (req, res) => {
  try {
    const data = await getDrivers(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, licenseNumber, phone, status } = req.body;
    const driver = await createDriver(
      req.user.tenantId, name, licenseNumber, phone, status
    );
    res.status(201).json({ message: 'Driver created', driver });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'License number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, licenseNumber, phone, status } = req.body;
    const driver = await updateDriver(
      req.params.id, name, licenseNumber, phone, status
    );
    res.json({ message: 'Driver updated', driver });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteDriver(req.params.id);
    res.json({ message: 'Driver deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };