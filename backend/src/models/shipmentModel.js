const pool = require('../config/db');

const getShipments = async (tenantId) => {
  const result = await pool.query(
    `SELECT s.*, o.customer_name, o.status as order_status,
            v.vehicle_number, v.type as vehicle_type,
            d.name as driver_name, d.phone as driver_phone
     FROM Shipments s
     JOIN Orders o ON s.order_id = o.order_id
     LEFT JOIN Vehicles v ON s.vehicle_id = v.vehicle_id
     LEFT JOIN Drivers d ON s.driver_id = d.driver_id
     WHERE o.tenant_id = $1
     ORDER BY s.shipment_id DESC`,
    [tenantId]
  );
  return result.rows;
};

const createShipment = async (orderId, vehicleId, driverId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO Shipments (order_id, vehicle_id, driver_id, status, dispatch_date)
       VALUES ($1, $2, $3, 'In-Transit', CURRENT_TIMESTAMP)
       RETURNING *`,
      [orderId, vehicleId, driverId]
    );

    if (vehicleId) {
      await client.query(
        `UPDATE Vehicles SET status = 'In-Use' WHERE vehicle_id = $1`,
        [vehicleId]
      );
    }

    if (driverId) {
      await client.query(
        `UPDATE Drivers SET status = 'On-Duty' WHERE driver_id = $1`,
        [driverId]
      );
    }

    await client.query(
      `UPDATE Orders SET status = 'In-Transit' WHERE order_id = $1`,
      [orderId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateShipmentStatus = async (shipmentId, status) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('--- updateShipmentStatus called ---');
    console.log('shipmentId:', shipmentId, 'status:', status);

    // Step 1 — get shipment
    const shipRes = await client.query(
      `SELECT * FROM Shipments WHERE shipment_id = $1`,
      [shipmentId]
    );

    console.log('shipment found:', shipRes.rows);

    if (shipRes.rows.length === 0) {
      throw new Error('Shipment not found');
    }

    const shipment = shipRes.rows[0];

    // Step 2 — update status
// Step 2 — update status
console.log('Running UPDATE query...');
const deliveryDate = status === 'Delivered' ? new Date() : null;
const updated = await client.query(
  `UPDATE Shipments
   SET status = $1,
       delivery_date = $2
   WHERE shipment_id = $3
   RETURNING *`,
  [status, deliveryDate, shipmentId]
);
console.log('UPDATE done:', updated.rows[0]);

    // Step 3 — if Delivered
    if (status === 'Delivered') {
      console.log('Status is Delivered — updating order, vehicle, driver...');

      await client.query(
        `UPDATE Orders SET status = 'Delivered' WHERE order_id = $1`,
        [shipment.order_id]
      );

      if (shipment.vehicle_id) {
        await client.query(
          `UPDATE Vehicles SET status = 'Available' WHERE vehicle_id = $1`,
          [shipment.vehicle_id]
        );
      }

      if (shipment.driver_id) {
        await client.query(
          `UPDATE Drivers SET status = 'Available' WHERE driver_id = $1`,
          [shipment.driver_id]
        );
      }
    }

    // Step 4 — if Cancelled
    if (status === 'Cancelled') {
      console.log('Status is Cancelled — restoring inventory...');

      if (shipment.vehicle_id) {
        await client.query(
          `UPDATE Vehicles SET status = 'Available' WHERE vehicle_id = $1`,
          [shipment.vehicle_id]
        );
      }

      if (shipment.driver_id) {
        await client.query(
          `UPDATE Drivers SET status = 'Available' WHERE driver_id = $1`,
          [shipment.driver_id]
        );
      }

      const items = await client.query(
        `SELECT oi.product_id, oi.quantity
         FROM Order_Items oi
         WHERE oi.order_id = $1`,
        [shipment.order_id]
      );

      console.log('Order items to restore:', items.rows);

      for (const item of items.rows) {
        const inv = await client.query(
          `SELECT warehouse_id FROM Inventory
           WHERE product_id = $1
           ORDER BY quantity DESC LIMIT 1`,
          [item.product_id]
        );

        if (inv.rows.length > 0) {
          const warehouseId = inv.rows[0].warehouse_id;

          await client.query(
            `UPDATE Inventory
             SET quantity = quantity + $1,
                 last_updated = CURRENT_TIMESTAMP
             WHERE product_id = $2 AND warehouse_id = $3`,
            [item.quantity, item.product_id, warehouseId]
          );

          await client.query(
            `INSERT INTO Stock_Movements
               (product_id, warehouse_id, quantity_change, movement_type, reference_id)
             VALUES ($1, $2, $3, 'IN', $4)`,
            [item.product_id, warehouseId, item.quantity, shipment.order_id]
          );
        }
      }

      await client.query(
        `UPDATE Orders SET status = 'Pending' WHERE order_id = $1`,
        [shipment.order_id]
      );
    }

    await client.query('COMMIT');
    console.log('COMMIT done successfully');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR in updateShipmentStatus:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

const deleteShipment = async (shipmentId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const shipRes = await client.query(
      `SELECT * FROM Shipments WHERE shipment_id = $1`,
      [shipmentId]
    );

    if (shipRes.rows.length > 0) {
      const shipment = shipRes.rows[0];

      if (shipment.vehicle_id) {
        await client.query(
          `UPDATE Vehicles SET status = 'Available' WHERE vehicle_id = $1`,
          [shipment.vehicle_id]
        );
      }

      if (shipment.driver_id) {
        await client.query(
          `UPDATE Drivers SET status = 'Available' WHERE driver_id = $1`,
          [shipment.driver_id]
        );
      }
    }

    await client.query(
      `DELETE FROM Shipments WHERE shipment_id = $1`,
      [shipmentId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getShipments, createShipment,
  updateShipmentStatus, deleteShipment
};