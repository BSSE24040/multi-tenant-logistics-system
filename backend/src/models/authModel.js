const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.*, r.role_name
     FROM Users u
     JOIN Roles r ON u.role_id = r.role_id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
};

const createTenant = async (name, email, phone) => {
  const result = await pool.query(
    `INSERT INTO Tenants (name, contact_email, contact_phone)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, email, phone]
  );
  return result.rows[0];
};

const createUser = async (tenantId, roleId, name, email, hashedPassword) => {
  const result = await pool.query(
    `INSERT INTO Users (tenant_id, role_id, name, email, password)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tenantId, roleId, name, email, hashedPassword]
  );
  return result.rows[0];
};

const getRoleByName = async (roleName) => {
  const result = await pool.query(
    `SELECT * FROM Roles 
    WHERE role_name = $1`,
    [roleName]
  );
  return result.rows[0];
};

module.exports = { findUserByEmail, createTenant, createUser, getRoleByName };