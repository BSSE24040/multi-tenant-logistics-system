const {
  getInvoices, createInvoice,
  updateInvoiceStatus, deleteInvoice
} = require('../models/invoiceModel');

const getAll = async (req, res) => {
  try {
    const data = await getInvoices(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });
    const invoice = await createInvoice(req.user.tenantId, orderId);
    res.status(201).json({ message: 'Invoice generated', invoice });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: 'Status is required' });
    const invoice = await updateInvoiceStatus(req.params.id, status);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice status updated', invoice });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteInvoice(req.params.id);
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, updateStatus, remove };