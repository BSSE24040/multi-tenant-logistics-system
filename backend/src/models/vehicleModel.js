const pool = require('../config/db');

const getVehicles = async (tenantId) => {
  const result = await pool.query(
    `SELECT * FROM Vehicles WHERE tenant_id = $1 ORDER BY vehicle_id DESC`,
    [tenantId]
  );
  return result.rows;
};

const createVehicle = async (tenantId, vehicleNumber, type, capacity, status) => {
  const result = await pool.query(
    `INSERT INTO Vehicles (tenant_id, vehicle_number, type, capacity, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tenantId, vehicleNumber, type, capacity, status]
  );
  return result.rows[0];
};

const updateVehicle = async (id, vehicleNumber, type, capacity, status) => {
  const result = await pool.query(
    `UPDATE Vehicles SET vehicle_number=$1, type=$2, capacity=$3, status=$4
     WHERE vehicle_id=$5 RETURNING *`,
    [vehicleNumber, type, capacity, status, id]
  );
  return result.rows[0];
};

const deleteVehicle = async (id) => {
  await pool.query(`DELETE FROM Vehicles WHERE vehicle_id = $1`, [id]);
};

module.exports = { getVehicles, createVehicle, updateVehicle, deleteVehicle };