import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Payments.css';

const STATUS_COLORS = {
  Paid:    { bg: 'rgb(240, 253, 244)', color: 'rgb(22, 163, 74)' },
  Pending: { bg: 'rgb(254, 249, 195)', color: 'rgb(146, 64, 14)' },
  Failed:  { bg: 'rgb(254, 242, 242)', color: 'rgb(220, 38, 38)' },
};

const METHOD_ICONS = {
  Cash: '💵', 'Bank Transfer': '🏦',
  'Credit Card': '💳', Cheque: '📄', Online: '🌐',
};

export default function Payments() {
  const { user } = getAuth();
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    orderId: '', amount: '', method: 'Cash', status: 'Paid'
  });

  const fetchAll = async () => {
    try {
      const [payRes, ordRes, sumRes] = await Promise.all([
        api.get('/payments'),
        api.get('/orders'),
        api.get('/payments/summary'),
      ]);
      setPayments(payRes.data);
      setOrders(ordRes.data);
      setSummary(sumRes.data);
      console.log('ORDERS:', ordRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/payments', form);
      setMsg('Payment recorded successfully');
      setShowAdd(false);
      setForm({ orderId: '', amount: '', method: 'Cash', status: 'Paid' });
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/payments/${id}`, { status });
      setMsg('Payment status updated');
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try {
      await api.delete(`/payments/${id}`);
      setMsg('Payment deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">💳 Payments</h1>
          <p className="sub">Track all payment transactions</p>
        </div>
        {can(user.role, 'create_payments') && (
          <button className="addBtn" onClick={() => setShowAdd(true)}>
            + Record Payment
          </button>
        )}
      </div>

      {msg && <div className="msg">{msg}</div>}

      {!loading && (
        <div className="summaryGrid">
          <div className="summaryCard" style={{ borderLeft: '4px solid rgb(22, 163, 74)' }}>
            <p className="summaryLabel">Total Collected</p>
            <p className="summaryValue">
              Rs. {parseFloat(summary.total_collected || 0).toLocaleString()}
            </p>
            <p className="summaryCount">{summary.paid_count || 0} payments</p>
          </div>
          <div className="summaryCard" style={{ borderLeft: '4px solid rgb(217, 119, 6)' }}>
            <p className="summaryLabel">Pending Amount</p>
            <p className="summaryValue">
              Rs. {parseFloat(summary.total_pending || 0).toLocaleString()}
            </p>
            <p className="summaryCount">{summary.pending_count || 0} payments</p>
          </div>
          <div className="summaryCard" style={{ borderLeft: '4px solid rgb(37, 99, 235)' }}>
            <p className="summaryLabel">Total Transactions</p>
            <p className="summaryValue">{summary.total_payments || 0}</p>
            <p className="summaryCount">all time</p>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">ID</th>
                <th className="th">Customer</th>
                <th className="th">Amount</th>
                <th className="th">Method</th>
                <th className="th">Status</th>
                <th className="th">Date</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="td" style={{ textAlign: 'center', color: 'rgb(100, 116, 139)' }}>
                    No payments recorded yet.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.payment_id} className="tr">
                  <td className="td"><b>#{p.payment_id}</b></td>
                  <td className="td">{p.customer_name}</td>
                  <td className="td">
                    <b>Rs. {parseFloat(p.amount).toLocaleString()}</b>
                  </td>
                  <td className="td">
                    {METHOD_ICONS[p.method] || '💰'} {p.method}
                  </td>
                  <td className="td">
                    {can(user.role, 'manage_payments') ? (
                      <select
                        className="statusSelect"
                        style={{ ...(STATUS_COLORS[p.status] || {}) }}
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.payment_id, e.target.value)}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                      </select>
                    ) : (
                      <span className="statusSelect" style={{ ...(STATUS_COLORS[p.status] || {}) }}>
                        {p.status}
                      </span>
                    )}
                  </td>
                  <td className="td">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                  <td className="td">
                    {can(user.role, 'manage_payments') && (
                      <button className="delBtn"
                        onClick={() => handleDelete(p.payment_id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && can(user.role, 'create_payments') && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Record Payment</h3>
            <div className="field">
              <label className="label">Order</label>
              <select className="input" value={form.orderId}
  onChange={async (e) => {
    const selectedOrderId = e.target.value;
    setForm({ ...form, orderId: selectedOrderId, amount: '' });

    if (selectedOrderId) {
      try {
        // Fetch order details to get total
        const res = await api.get(`/orders/${selectedOrderId}`);
        const items = res.data.items || [];
        const total = items.reduce((sum, item) => {
          return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
        }, 0);
        setForm(prev => ({ ...prev, orderId: selectedOrderId, amount: total.toFixed(2) }));
      } catch (err) {
        console.error('Failed to fetch order total:', err);
      }
    }
  }}>
  <option value="">Select order</option>
  {orders.map(o => (  
    <option key={o.order_id} value={o.order_id}>
      #{o.order_id} — {o.customer_name}
    </option>
  ))}
</select>
            </div>
           <div className="field">
  <label className="label">Amount </label>
  <input
    className="input"
    style={{ background: form.amount ? 'rgb(240, 253, 244)' : 'rgb(255, 255, 255)' }}
    type="number"
    placeholder="Select an order first"
    value={form.amount}
    onChange={(e) => setForm({ ...form, amount: e.target.value })}
  />
</div>
            <div className="field">
              <label className="label">Payment Method</label>
              <select className="input" value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {['Cash', 'Bank Transfer', 'Credit Card', 'Cheque', 'Online'].map(m => (
                  <option key={m} value={m}>{METHOD_ICONS[m]} {m}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Paid', 'Pending', 'Failed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleAdd}>Record</button>
              <button className="cancelBtn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}