const pool = require('../config/db');

const getAllTenants = async () => {
  const result = await pool.query(
    `SELECT t.*, COUNT(u.user_id) as user_count 
     FROM Tenants t
     LEFT JOIN Users u ON t.tenant_id = u.tenant_id
     GROUP BY t.tenant_id
     ORDER BY t.created_at DESC`
  );
  return result.rows;
};

const getTenantById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM Tenants WHERE tenant_id = $1`, [id]
  );
  return result.rows[0];
};

const updateTenant = async (id, name, email, phone) => {
  const result = await pool.query(
    `UPDATE Tenants SET name=$1, contact_email=$2, contact_phone=$3
     WHERE tenant_id=$4 RETURNING *`,
    [name, email, phone, id]
  );
  return result.rows[0];
};

const deleteTenant = async (id) => {
  await pool.query(`DELETE FROM Tenants WHERE tenant_id = $1`, [id]);
};

module.exports = { getAllTenants, getTenantById, updateTenant, deleteTenant };