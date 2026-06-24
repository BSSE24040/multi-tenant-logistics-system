const pool = require('../config/db');

const getInvoices = async (tenantId) => {
  const result = await pool.query(
    `SELECT i.*, o.customer_name, o.status as order_status
     FROM Invoices i
     JOIN Orders o ON i.order_id = o.order_id
     WHERE i.tenant_id = $1
     ORDER BY i.issued_date DESC`,
    [tenantId]
  );
  return result.rows;
};

const createInvoice = async (tenantId, orderId) => {
  const total = await pool.query(
    `SELECT COALESCE(SUM(quantity * price), 0) as total
     FROM Order_Items WHERE order_id = $1`,
    [orderId]
  );
  const totalAmount = total.rows[0].total;

  const result = await pool.query(
    `INSERT INTO Invoices (tenant_id, order_id, total_amount, status)
     VALUES ($1, $2, $3, 'Unpaid') RETURNING *`,
    [tenantId, orderId, totalAmount]
  );
  return result.rows[0];
};

const updateInvoiceStatus = async (invoiceId, status) => {
  const result = await pool.query(
    `UPDATE Invoices SET status=$1 WHERE invoice_id=$2 RETURNING *`,
    [status, invoiceId]
  );
  return result.rows[0];
};

const deleteInvoice = async (invoiceId) => {
  await pool.query(`DELETE FROM Invoices WHERE invoice_id = $1`, [invoiceId]);
};

module.exports = {
  getInvoices, createInvoice,
  updateInvoiceStatus, deleteInvoice
};