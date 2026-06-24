const {
  getAllTenants, getTenantById,
  updateTenant, deleteTenant
} = require('../models/tenantModel');

const getAll = async (req, res) => {
  try {
    const tenants = await getAllTenants();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const tenant = await getTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, contact_email, contact_phone } = req.body;
    const tenant = await updateTenant(
      req.params.id, name, contact_email, contact_phone
    );
    res.json({ message: 'Tenant updated', tenant });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteTenant(req.params.id);
    res.json({ message: 'Tenant deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, getOne, update, remove };