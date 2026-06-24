const pool = require('../config/db');

const getOrders = async (tenantId) => {
  const result = await pool.query(
    `SELECT o.*,
            COUNT(oi.order_item_id) as item_count,
            SUM(oi.quantity * oi.price) as total_amount
     FROM Orders o
     LEFT JOIN Order_Items oi 
     ON o.order_id = oi.order_id
     WHERE o.tenant_id = $1
     GROUP BY o.order_id
     ORDER BY o.order_date DESC`,
    [tenantId]
  );
  return result.rows;  //returning the rows(orders)
};

const getOrderById = async (orderId) => {
  const order = await pool.query(
    `SELECT * FROM Orders 
    WHERE order_id = $1`, [orderId]
  );

  const items = await pool.query(
    `SELECT oi.*, p.name as product_name, p.sku
     FROM Order_Items oi
     JOIN Products p 
     ON oi.product_id = p.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );
  return { ...order.rows[0], items: items.rows };
};
const createOrder = async (tenantId, customerName, items) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // first  Check inventory for every item
    for (const item of items) {
      const inv = await client.query(
        `SELECT i.quantity, i.warehouse_id, p.name
         FROM Inventory i
         JOIN Products p 
         ON i.product_id = p.product_id
         WHERE i.product_id = $1 AND p.tenant_id = $2
         ORDER BY i.quantity DESC
         LIMIT 1`,
        [item.productId, tenantId]
      );

      if (inv.rows.length === 0) {
        throw new Error(`Product not found in any warehouse`);
      }

      const available = inv.rows[0].quantity;   //get the quantity
      const productName = inv.rows[0].product_name || 'Product';

      if (available < item.quantity) {  //if quantity is less then required print error 
        throw new Error(
          `Insufficient stock for "${inv.rows[0].name}". Available: ${available}, Requested: ${item.quantity}`
        );
      }
    }

    //create the order
    const orderRes = await client.query(
      `INSERT INTO Orders (tenant_id, customer_name, status)
       VALUES ($1, $2, 'Pending') RETURNING *`,
      [tenantId, customerName]
    );
    const order = orderRes.rows[0];

    // insert order items + deduct inventory + log movements
    for (const item of items) {
      // Insert order item
      await client.query(
        `INSERT INTO Order_Items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [order.order_id, item.productId, item.quantity, item.price]
      );

      //get warehouse with most stock for this product
      const inv = await client.query(
        `SELECT warehouse_id FROM Inventory
         WHERE product_id = $1
         ORDER BY quantity DESC LIMIT 1`,
        [item.productId]
      );

      const warehouseId = inv.rows[0].warehouse_id;

      // Deduct from inventory
      await client.query(
        `UPDATE Inventory
         SET quantity = quantity - $1,
             last_updated = CURRENT_TIMESTAMP
         WHERE product_id = $2 AND warehouse_id = $3`,
        [item.quantity, item.productId, warehouseId]
      );

      //log stock movement
      await client.query(
        `INSERT INTO Stock_Movements
           (product_id, warehouse_id, quantity_change, movement_type, reference_id)
         VALUES ($1, $2, $3, 'OUT', $4)`,
        [item.productId, warehouseId, -item.quantity, order.order_id]
      );
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK'); //dont change anything 
    throw err;
  } finally {
    client.release();
  }
};

const updateOrderStatus = async (orderId, status) => {  //updating the order status
  const result = await pool.query(
    `UPDATE Orders SET status=$1 
    WHERE order_id=$2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];   
};

const deleteOrder = async (orderId) => {  //for deleting the order
  const client = await pool.connect();

  try {
    await client.query('BEGIN');  //start of the transaction 

    // Get all order items
    const itemsRes = await client.query(
      `SELECT oi.*, p.name
       FROM Order_Items oi
       JOIN Products p
       ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    const items = itemsRes.rows;

    //restore inventory for each item
    for (const item of items) {

      //find warehouse used in OUT movement
      const movementRes = await client.query(
        `SELECT warehouse_id
         FROM Stock_Movements
         WHERE product_id = $1
           AND reference_id = $2
           AND movement_type = 'OUT'
         ORDER BY timestamp DESC
         LIMIT 1`,
        [item.product_id, orderId]
      );

      if (movementRes.rows.length > 0) {   
        const warehouseId = movementRes.rows[0].warehouse_id; //warehouse that was used for out movement

        //add stock back
        await client.query(
          `UPDATE Inventory
           SET quantity = quantity + $1,
               last_updated = CURRENT_TIMESTAMP
           WHERE product_id = $2
             AND warehouse_id = $3`,
          [item.quantity, item.product_id, warehouseId]
        );

        //log IN movement
        await client.query(
          `INSERT INTO Stock_Movements
             (product_id, warehouse_id, quantity_change, movement_type, reference_id)
           VALUES ($1, $2, $3, 'IN', $4)`,
          [item.product_id, warehouseId, item.quantity, orderId]
        );
      }
    }

    // Delete order items first
    await client.query(
      `DELETE FROM Order_Items
       WHERE order_id = $1`,
      [orderId]
    );

    // Delete order
    await client.query(
      `DELETE FROM Orders
       WHERE order_id = $1`,
      [orderId]
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
  getOrders, getOrderById,
  createOrder, updateOrderStatus, deleteOrder
};