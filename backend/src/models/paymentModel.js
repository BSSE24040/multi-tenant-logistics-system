const pool = require('../config/db');

const getPayments = async (tenantId) => {
  const result = await pool.query(
    `SELECT p.*, o.customer_name, o.status as order_status
     FROM Payments p
     JOIN Orders o ON p.order_id = o.order_id
     WHERE p.tenant_id = $1
     ORDER BY p.payment_date DESC`,
    [tenantId]
  );
  return result.rows;
};

const createPayment = async (tenantId, orderId, amount, method, status) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO Payments (tenant_id, order_id, amount, method, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, orderId, amount, method, status]
    );

    // If paid → auto update invoice
    if (status === 'Paid') {
      await client.query(
        `UPDATE Invoices SET status = 'Paid'
         WHERE order_id = $1 AND tenant_id = $2`,
        [orderId, tenantId]
      );
    }

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updatePaymentStatus = async (paymentId, status) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE Payments SET status=$1
       WHERE payment_id=$2 RETURNING *`,
      [status, paymentId]
    );

    const payment = result.rows[0];

    // Auto update invoice status based on payment status
    if (status === 'Paid') {
      await client.query(
        `UPDATE Invoices SET status = 'Paid'
         WHERE order_id = $1`,
        [payment.order_id]
      );
    } else if (status === 'Pending' || status === 'Failed') {
      await client.query(
        `UPDATE Invoices SET status = 'Unpaid'
         WHERE order_id = $1`,
        [payment.order_id]
      );
    }

    await client.query('COMMIT');
    return payment;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deletePayment = async (paymentId) => {
  await pool.query(`DELETE FROM Payments WHERE payment_id = $1`, [paymentId]);
};

const getPaymentSummary = async (tenantId) => {
  const result = await pool.query(
    `SELECT
       COUNT(*) as total_payments,
       COALESCE(SUM(CASE WHEN status = 'Paid'    THEN amount ELSE 0 END), 0) as total_collected,
       COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as total_pending,
       COUNT(CASE WHEN status = 'Paid'    THEN 1 END) as paid_count,
       COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count
     FROM Payments WHERE tenant_id = $1`,
    [tenantId]
  );
  return result.rows[0];
};

module.exports = {
  getPayments, createPayment,
  updatePaymentStatus, deletePayment, getPaymentSummary
};