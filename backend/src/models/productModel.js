const pool = require('../config/db');

const getProducts = async (tenantId) => {
  const result = await pool.query(
    `SELECT * FROM Products WHERE tenant_id = $1 ORDER BY product_id DESC`,
    [tenantId]
  );
  return result.rows;
};

const getProductById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM Products WHERE product_id = $1`, [id]
  );
  return result.rows[0];
};

const createProduct = async (tenantId, name, sku, unitPrice) => {
  const result = await pool.query(
    `INSERT INTO Products (tenant_id, name, sku, unit_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [tenantId, name, sku, unitPrice]
  );
  return result.rows[0];
};

const updateProduct = async (id, name, sku, unitPrice) => {
  const result = await pool.query(
    `UPDATE Products SET name=$1, sku=$2, unit_price=$3
     WHERE product_id=$4 RETURNING *`,
    [name, sku, unitPrice, id]
  );
  return result.rows[0];
};

const deleteProduct = async (id) => {
  await pool.query(`DELETE FROM Products WHERE product_id = $1`, [id]);
};

module.exports = {
  getProducts, getProductById,
  createProduct, updateProduct, deleteProduct
};