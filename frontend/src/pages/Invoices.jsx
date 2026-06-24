import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Invoices.css';

const STATUS_COLORS = {
  Unpaid:  { bg: 'rgb(254, 242, 242)', color: 'rgb(220, 38, 38)' },
  Paid:    { bg: 'rgb(240, 253, 244)', color: 'rgb(22, 163, 74)' },
  Overdue: { bg: 'rgb(254, 249, 195)', color: 'rgb(146, 64, 14)' },
};

export default function Invoices() {
  const { user } = getAuth();
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ orderId: '' });

  const fetchAll = async () => {
    try {
      const [invRes, ordRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/orders'),
      ]);
      setInvoices(invRes.data);
      setOrders(ordRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleGenerate = async () => {
    try {
      await api.post('/invoices', form);
      setMsg('Invoice generated successfully');
      setShowAdd(false);
      setForm({ orderId: '' });
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/invoices/${id}`, { status });
      setMsg('Invoice status updated');
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await api.delete(`/invoices/${id}`);
      setMsg('Invoice deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0);

  const totalUnpaid = invoices
    .filter(i => i.status !== 'Paid')
    .reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0);

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">🧾 Invoices</h1>
          <p className="sub">Generate and manage billing invoices</p>
        </div>
        {can(user.role, 'manage_invoices') && (
          <button className="addBtn" onClick={() => setShowAdd(true)}>
            + Generate Invoice
          </button>
        )}
      </div>

      {msg && <div className="msg">{msg}</div>}

      {!loading && (
        <div className="summaryGrid">
          <div className="summaryCard" style={{ borderLeft: '4px solid rgb(22, 163, 74)' }}>
            <p className="summaryLabel">Revenue Collected</p>
            <p className="summaryValue">Rs. {totalRevenue.toLocaleString()}</p>
            <p className="summaryCount">
              {invoices.filter(i => i.status === 'Paid').length} paid invoices
            </p>
          </div>
          <div className="summaryCard" style={{ borderLeft: '4px solid rgb(220, 38, 38)' }}>
            <p className="summaryLabel">Outstanding Amount</p>
            <p className="summaryValue">Rs. {totalUnpaid.toLocaleString()}</p>
            <p className="summaryCount">
              {invoices.filter(i => i.status !== 'Paid').length} unpaid invoices
            </p>
          </div>
          <div className="summaryCard" style={{ borderLeft: '4px solid rgb(37, 99, 235)' }}>
            <p className="summaryLabel">Total Invoices</p>
            <p className="summaryValue">{invoices.length}</p>
            <p className="summaryCount">all time</p>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">Invoice #</th>
                <th className="th">Customer</th>
                <th className="th">Order</th>
                <th className="th">Total Amount</th>
                <th className="th">Status</th>
                <th className="th">Issued Date</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="td" style={{ textAlign: 'center', color: 'rgb(100, 116, 139)' }}>
                    No invoices yet. Generate one from an order.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.invoice_id} className="tr">
                  <td className="td">
                    <b>INV-{String(inv.invoice_id).padStart(4, '0')}</b>
                  </td>
                  <td className="td">{inv.customer_name}</td>
                  <td className="td">#{inv.order_id}</td>
                  <td className="td">
                    <b>Rs. {parseFloat(inv.total_amount).toLocaleString()}</b>
                  </td>
                  <td className="td">
                    {can(user.role, 'manage_invoices') ? (
                      <select
                        className="statusSelect"
                        style={{ background: STATUS_COLORS[inv.status]?.bg, color: STATUS_COLORS[inv.status]?.color }}
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.invoice_id, e.target.value)}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    ) : (
                      <span className="statusSelect" style={{ background: STATUS_COLORS[inv.status]?.bg, color: STATUS_COLORS[inv.status]?.color }}>
                        {inv.status}
                      </span>
                    )}
                  </td>
                  <td className="td">
                    {new Date(inv.issued_date).toLocaleDateString()}
                  </td>
                  <td className="td">
                    {can(user.role, 'manage_invoices') && (
                      <button className="delBtn"
                        onClick={() => handleDelete(inv.invoice_id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && can(user.role, 'manage_invoices') && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Generate Invoice</h3>
            <p className="modalDesc">
              Select an order to auto-generate an invoice with the calculated total.
            </p>
            <div className="field">
              <label className="label">Select Order</label>
              <select className="input" value={form.orderId}
                onChange={(e) => setForm({ orderId: e.target.value })}>
                <option value="">Choose an order</option>
                {orders.map(o => (
                  <option key={o.order_id} value={o.order_id}>
                    #{o.order_id} — {o.customer_name} ({o.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleGenerate}>Generate</button>
              <button className="cancelBtn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}