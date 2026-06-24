const {
  getShipments, createShipment,
  updateShipmentStatus, deleteShipment
} = require('../models/shipmentModel');

const getAll = async (req, res) => {
  try {
    const data = await getShipments(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { orderId, vehicleId, driverId } = req.body;
    const shipment = await createShipment(orderId, vehicleId, driverId);
    res.status(201).json({ message: 'Shipment created', shipment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const shipment = await updateShipmentStatus(req.params.id, status);
    res.json({ message: 'Shipment status updated', shipment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteShipment(req.params.id);
    res.json({ message: 'Shipment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, updateStatus, remove };