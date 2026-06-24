const pool = require('../config/db');

const getWarehouses = async (tenantId) => {
  const result = await pool.query(
    `SELECT w.*, COUNT(i.inventory_id) as product_count
     FROM Warehouses w
     LEFT JOIN Inventory i ON w.warehouse_id = i.warehouse_id
     WHERE w.tenant_id = $1
     GROUP BY w.warehouse_id
     ORDER BY w.warehouse_id DESC`,
    [tenantId]
  );
  return result.rows;
};

const getWarehouseById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM Warehouses WHERE warehouse_id = $1`, [id]
  );
  return result.rows[0];
};

const createWarehouse = async (tenantId, name, location) => {
  const result = await pool.query(
    `INSERT INTO Warehouses (tenant_id, name, location)
     VALUES ($1, $2, $3) RETURNING *`,
    [tenantId, name, location]
  );
  return result.rows[0];
};

const updateWarehouse = async (id, name, location) => {
  const result = await pool.query(
    `UPDATE Warehouses SET name=$1, location=$2
     WHERE warehouse_id=$3 RETURNING *`,
    [name, location, id]
  );
  return result.rows[0];
};

const deleteWarehouse = async (id) => {
  await pool.query(`DELETE FROM Warehouses WHERE warehouse_id = $1`, [id]);
};

module.exports = {
  getWarehouses, getWarehouseById,
  createWarehouse, updateWarehouse, deleteWarehouse
};