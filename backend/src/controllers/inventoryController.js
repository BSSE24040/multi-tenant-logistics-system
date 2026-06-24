const {
  getInventory, upsertInventory,
  updateInventoryQuantity, getStockMovements,
  getLowStock, transferStock,
  deleteInventory, deleteStockMovement
} = require('../models/inventoryModel'); 

const getAll = async (req, res) => {
  try {
    const data = await getInventory(req.user.tenantId);
    res.json(data); //returing the result
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const setStock = async (req, res) => { //for setting the stock
  try {
    const { warehouseId, productId, quantity } = req.body;
    const inv = await upsertInventory(warehouseId, productId, quantity); //call the function in model
    res.status(201).json({ message: 'Stock set', inventory: inv });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const adjustStock = async (req, res) => {
  try {
    const { warehouseId, productId, quantityChange, movementType } = req.body;
    const inv = await updateInventoryQuantity(
      warehouseId, productId, quantityChange, movementType
    );
    res.json({ message: 'Stock adjusted', inventory: inv });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMovements = async (req, res) => {
  try {
    const data = await getStockMovements(req.user.tenantId); //movements based on tenant id
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const lowStock = async (req, res) => {
  try {
    const data = await getLowStock(req.user.tenantId); //get lowstock
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const transfer = async (req, res) => {
  try {
    const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;
    if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (fromWarehouseId === toWarehouseId) { //if both are same then throw an error
      return res.status(400).json({ message: 'Source and destination must be different' });
    }
    await transferStock(fromWarehouseId, toWarehouseId, productId, quantity);
    res.json({ message: 'Stock transferred successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const removeInventory = async (req, res) => { //to delete an inventory entry 
  try {
    await deleteInventory(req.params.id);
    res.json({ message: 'Inventory record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const removeMovement = async (req, res) => {  //to delete a movement 
  try {
    await deleteStockMovement(req.params.id);
    res.json({ message: 'Stock movement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAll, setStock, adjustStock, getMovements,
  lowStock, transfer, removeInventory, removeMovement
};