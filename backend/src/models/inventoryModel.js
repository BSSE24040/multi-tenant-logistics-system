const pool = require('../config/db');

const getInventory = async (tenantId) => {    
  const result = await pool.query(
    `SELECT i.*, p.name as product_name, p.sku, p.unit_price,
            w.name as warehouse_name
     FROM Inventory i
     JOIN Products p ON i.product_id = p.product_id
     JOIN Warehouses w ON i.warehouse_id = w.warehouse_id
     WHERE p.tenant_id = $1
     ORDER BY i.last_updated DESC`,
    [tenantId]
  );
  return result.rows;
};

const upsertInventory = async (warehouseId, productId, quantity) => {  //inserting into the inventory
  const result = await pool.query(
    `INSERT INTO Inventory (warehouse_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (warehouse_id, product_id) 
     DO UPDATE SET quantity = $3, last_updated = CURRENT_TIMESTAMP
     RETURNING *`,
    [warehouseId, productId, quantity]
  );
  return result.rows[0];
};
   
const updateInventoryQuantity = async (warehouseId, productId, quantityChange, movementType) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

              //update inventory
    const inv = await client.query(
      `UPDATE Inventory SET
         quantity = quantity + $1,
         last_updated = CURRENT_TIMESTAMP
       WHERE warehouse_id = $2 AND product_id = $3
       RETURNING *`,
      [quantityChange, warehouseId, productId]
    );

              //logging stock movement
    await client.query(
      `INSERT INTO Stock_Movements
         (product_id, warehouse_id, quantity_change, movement_type)
       VALUES ($1, $2, $3, $4)`,
      [productId, warehouseId, quantityChange, movementType]
    );

    await client.query('COMMIT');  //save all changes
    return inv.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');  //if there is a error then no changes
    throw err;
  } finally {
    client.release();
  }
};

//to transfer stock from one to an other 
const transferStock = async (fromWarehouseId, toWarehouseId, productId, quantity) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    //checking source warehouse has enough stock
    const source = await client.query(
      `SELECT quantity FROM Inventory
       WHERE warehouse_id = $1 AND product_id = $2`,
      [fromWarehouseId, productId]
    );

    if (source.rows.length === 0) {  //if length is zero 
      throw new Error('Product not found in source warehouse');  //throw error 
    }

    if (source.rows[0].quantity < quantity) { //if the quantity is less then required
      throw new Error(
        `Insufficient stock in source warehouse. Available: ${source.rows[0].quantity}, Requested: ${quantity}`
      ); //throw error
    }

              //deduct from source warehouse
    await client.query(
      `UPDATE Inventory
       SET quantity = quantity - $1,
           last_updated = CURRENT_TIMESTAMP
       WHERE warehouse_id = $2 AND product_id = $3`,
      [quantity, fromWarehouseId, productId]
    );

               //add to destination warehouse (upsert)
    await client.query(
      `INSERT INTO Inventory (warehouse_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (warehouse_id, product_id)
       DO UPDATE SET
         quantity = Inventory.quantity + $3,
         last_updated = CURRENT_TIMESTAMP`,
      [toWarehouseId, productId, quantity]
    );

              //log OUT movement for source
    await client.query(
      `INSERT INTO Stock_Movements
         (product_id, warehouse_id, quantity_change, movement_type)
       VALUES ($1, $2, $3, 'TRANSFER')`,
      [productId, fromWarehouseId, -quantity]
    );

           //log IN movement for destination
    await client.query(
      `INSERT INTO Stock_Movements
         (product_id, warehouse_id, quantity_change, movement_type)
       VALUES ($1, $2, $3, 'TRANSFER')`,
      [productId, toWarehouseId, quantity]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();   //client back to the pool 
  }
};

const deleteInventory = async (inventoryId) => {  //to delete from inventory 
  await pool.query(
    `DELETE FROM Inventory 
    WHERE inventory_id = $1`,
    [inventoryId]
  );
};

const deleteStockMovement = async (movementId) => {  //deleting stock movement 
  await pool.query(
    `DELETE FROM Stock_Movements 
    WHERE movement_id = $1`,
    [movementId]
  );
};

const getStockMovements = async (tenantId) => {
  const result = await pool.query(
    `SELECT sm.*, p.name as product_name, w.name as warehouse_name
     FROM Stock_Movements sm
     JOIN Products p 
     ON sm.product_id = p.product_id
     JOIN Warehouses w 
     ON sm.warehouse_id = w.warehouse_id
     WHERE p.tenant_id = $1
     ORDER BY sm.timestamp DESC
     LIMIT 50`,
    [tenantId]
  );
  return result.rows;
};

const getLowStock = async (tenantId, threshold = 10) => {  //to get the lowstock movements 
  const result = await pool.query(
    `SELECT i.*, p.name as product_name, p.sku, w.name as warehouse_name
     FROM Inventory i
     JOIN Products p ON i.product_id = p.product_id
     JOIN Warehouses w ON i.warehouse_id = w.warehouse_id
     WHERE p.tenant_id = $1 AND i.quantity <= $2
     ORDER BY i.quantity ASC`,
    [tenantId, threshold]
  );
  return result.rows;
};

module.exports = {
  getInventory, upsertInventory,
  updateInventoryQuantity, getStockMovements,
  getLowStock, transferStock,
  deleteInventory, deleteStockMovement
};