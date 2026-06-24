const pool = require('../config/db');

const getUsersByTenant = async (tenantId) => {  //getting users by tenant 
  const result = await pool.query(
    `SELECT u.user_id, u.name, u.email, u.is_active, u.created_at,
            r.role_name
     FROM Users u
     JOIN Roles r ON u.role_id = r.role_id
     WHERE u.tenant_id = $1
     ORDER BY u.created_at DESC`,
    [tenantId]
  );
  return result.rows;
};

const getUserById = async (userId) => {  //getting user by id 
  const result = await pool.query(
    `SELECT u.*, r.role_name FROM Users u
     JOIN Roles r ON u.role_id = r.role_id
     WHERE u.user_id = $1`,
    [userId]
  );
  return result.rows[0];
};

const createUser = async (tenantId, roleId, name, email, hashedPassword) => { //for creating a new user
  const result = await pool.query(
    `INSERT INTO Users (tenant_id, role_id, name, email, password)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tenantId, roleId, name, email, hashedPassword]
  );
  return result.rows[0];
};

const updateUser = async (userId, name, email, roleId, isActive) => {  //to update a user
  const result = await pool.query(
    `UPDATE Users SET name=$1, email=$2, role_id=$3, is_active=$4
     WHERE user_id=$5 RETURNING *`,
    [name, email, roleId, isActive, userId]
  );
  return result.rows[0];
};

const deleteUser = async (userId) => {
  await pool.query(`DELETE FROM Users WHERE user_id = $1`, [userId]); //deleting a user
};

const getAllRoles = async () => {
  const result = await pool.query(`SELECT * FROM Roles ORDER BY role_id`);
  return result.rows;  //returning the rows
};

module.exports = {
  getUsersByTenant, getUserById, createUser,
  updateUser, deleteUser, getAllRoles,
};