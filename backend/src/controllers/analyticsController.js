const {
  getOverview, getOrdersByStatus,
  getRevenueByMethod, getShipmentsByStatus
} = require('../models/analyticsModel');

const overview = async (req, res) => {
  try {
    const data = await getOverview(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const ordersByStatus = async (req, res) => {
  try {
    const data = await getOrdersByStatus(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const revenueByMethod = async (req, res) => {
  try {
    const data = await getRevenueByMethod(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const shipmentsByStatus = async (req, res) => {
  try {
    const data = await getShipmentsByStatus(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  overview, ordersByStatus,
  revenueByMethod, shipmentsByStatus
};