const pool = require('../config/db');

const getOverview = async (tenantId) => {
  const [
    orders, revenue, shipments,
    products, warehouses, drivers,
    vehicles, pendingOrders, deliveredOrders,
    lowStock, topProducts
  ] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) FROM Orders WHERE tenant_id=$1`,
      [tenantId]
    ),
    pool.query(
      `SELECT COALESCE(SUM(amount),0) as total
       FROM Payments WHERE tenant_id=$1 AND status='Paid'`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Shipments s
       JOIN Orders o ON s.order_id=o.order_id
       WHERE o.tenant_id=$1`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Products WHERE tenant_id=$1`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Warehouses WHERE tenant_id=$1`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Drivers WHERE tenant_id=$1`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Vehicles WHERE tenant_id=$1`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Orders
       WHERE tenant_id=$1 AND status='Pending'`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Orders
       WHERE tenant_id=$1 AND status='Delivered'`,
      [tenantId]
    ),
    pool.query(
      `SELECT COUNT(*) FROM Inventory i
       JOIN Products p ON i.product_id=p.product_id
       WHERE p.tenant_id=$1 AND i.quantity<=10`,
      [tenantId]
    ),
    pool.query(
      `SELECT p.name, SUM(oi.quantity) as total_sold
       FROM Order_Items oi
       JOIN Products p ON oi.product_id=p.product_id
       WHERE p.tenant_id=$1
       GROUP BY p.name
       ORDER BY total_sold DESC LIMIT 5`,
      [tenantId]
    ),
  ]);

  return {
    totalOrders:      parseInt(orders.rows[0].count),
    totalRevenue:     parseFloat(revenue.rows[0].total),
    totalShipments:   parseInt(shipments.rows[0].count),
    totalProducts:    parseInt(products.rows[0].count),
    totalWarehouses:  parseInt(warehouses.rows[0].count),
    totalDrivers:     parseInt(drivers.rows[0].count),
    totalVehicles:    parseInt(vehicles.rows[0].count),
    pendingOrders:    parseInt(pendingOrders.rows[0].count),
    deliveredOrders:  parseInt(deliveredOrders.rows[0].count),
    lowStockItems:    parseInt(lowStock.rows[0].count),
    topProducts:      topProducts.rows,
  };
};

const getOrdersByStatus = async (tenantId) => {
  const result = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM Orders WHERE tenant_id=$1
     GROUP BY status`,
    [tenantId]
  );
  return result.rows;
};

const getRevenueByMethod = async (tenantId) => {
  const result = await pool.query(
    `SELECT method, COALESCE(SUM(amount),0) as total
     FROM Payments
     WHERE tenant_id=$1 AND status='Paid'
     GROUP BY method`,
    [tenantId]
  );
  return result.rows;
};

const getShipmentsByStatus = async (tenantId) => {
  const result = await pool.query(
    `SELECT s.status, COUNT(*) as count
     FROM Shipments s
     JOIN Orders o ON s.order_id=o.order_id
     WHERE o.tenant_id=$1
     GROUP BY s.status`,
    [tenantId]
  );
  return result.rows;
};

module.exports = {
  getOverview, getOrdersByStatus,
  getRevenueByMethod, getShipmentsByStatus
};