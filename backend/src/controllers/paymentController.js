const {
  getPayments, createPayment,
  updatePaymentStatus, deletePayment, getPaymentSummary
} = require('../models/paymentModel');

const getAll = async (req, res) => {
  try {
    const data = await getPayments(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { orderId, amount, method, status } = req.body;
    if (!orderId || !amount || !method || !status) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const payment = await createPayment(
      req.user.tenantId, orderId, amount, method, status
    );
    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    const payment = await updatePaymentStatus(req.params.id, status);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment status updated', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deletePayment(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSummary = async (req, res) => {
  try {
    const data = await getPaymentSummary(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, updateStatus, remove, getSummary };