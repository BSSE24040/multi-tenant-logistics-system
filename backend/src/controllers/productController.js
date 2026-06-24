const {
  getProducts, createProduct,
  updateProduct, deleteProduct
} = require('../models/productModel');

const getAll = async (req, res) => {
  try {
    const data = await getProducts(req.user.tenantId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { name, sku, unitPrice } = req.body;
    const product = await createProduct(req.user.tenantId, name, sku, unitPrice);
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { name, sku, unitPrice } = req.body;
    const product = await updateProduct(req.params.id, name, sku, unitPrice);
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAll, create, update, remove };