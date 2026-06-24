const pool = require('../config/db');

const getDrivers = async (tenantId) => {
  const result = await pool.query(
    `SELECT * FROM Drivers WHERE tenant_id = $1 ORDER BY driver_id DESC`,
    [tenantId]
  );
  return result.rows;
};

const createDriver = async (tenantId, name, licenseNumber, phone, status) => {
  const result = await pool.query(
    `INSERT INTO Drivers (tenant_id, name, license_number, phone, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tenantId, name, licenseNumber, phone, status]
  );
  return result.rows[0];
};

const updateDriver = async (id, name, licenseNumber, phone, status) => {
  const result = await pool.query(
    `UPDATE Drivers SET name=$1, license_number=$2, phone=$3, status=$4
     WHERE driver_id=$5 RETURNING *`,
    [name, licenseNumber, phone, status, id]
  );
  return result.rows[0];
};

const deleteDriver = async (id) => {
  await pool.query(`DELETE FROM Drivers WHERE driver_id = $1`, [id]);
};

module.exports = { getDrivers, createDriver, updateDriver, deleteDriver };