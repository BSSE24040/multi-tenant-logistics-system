import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Shipments.css';

const STATUS_COLORS = {
  'In-Transit': { bg: 'rgb(219, 234, 254)', color: 'rgb(29, 78, 216)' },
  Delivered:    { bg: 'rgb(240, 253, 244)', color: 'rgb(22, 163, 74)' },
  Cancelled:    { bg: 'rgb(254, 242, 242)', color: 'rgb(220, 38, 38)' },
};

export default function Shipments() {
  const { user } = getAuth();
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ orderId: '', vehicleId: '', driverId: '' });

  const fetchAll = async () => {
    try {
      const [sh, or, ve, dr] = await Promise.all([
        api.get('/shipments'),
        api.get('/orders'),
        api.get('/vehicles'),
        api.get('/drivers'),
      ]);
      setShipments(sh.data);
      setOrders(or.data.filter(o => o.status === 'Pending'));
      setVehicles(ve.data.filter(v => v.status === 'Available'));
      setDrivers(dr.data.filter(d => d.status === 'Available'));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    try {
      await api.post('/shipments', form);
      setMsg('✅ Shipment created successfully');
      setShowAdd(false);
      setForm({ orderId: '', vehicleId: '', driverId: '' });
      fetchAll();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Failed to create shipment'}`);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/shipments/${id}`, { status });
      setMsg('✅ Shipment status updated');
      fetchAll();
    } catch (err) {
      console.error('FULL ERROR:', err.response);
      setMsg(`❌ ${err.response?.data?.message || err.message || 'Update failed'}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    try {
      await api.delete(`/shipments/${id}`);
      setMsg('✅ Shipment deleted');
      fetchAll();
    } catch (err) {
      setMsg(`❌ ${err.response?.data?.message || 'Delete failed'}`);
    }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">🚚 Shipments</h1>
          <p className="sub">Track and manage deliveries</p>
        </div>
        {can(user.role, 'manage_shipments') && (
          <button className="addBtn" onClick={() => setShowAdd(true)}>
            + New Shipment
          </button>
        )}
      </div>

      {msg && (
        <div className="msg" style={{
          background: msg.startsWith('❌') ? 'rgb(254, 242, 242)' : 'rgb(240, 253, 244)',
          border: `1px solid ${msg.startsWith('❌') ? 'rgb(254, 202, 202)' : 'rgb(134, 239, 172)'}`,
          color: msg.startsWith('❌') ? 'rgb(220, 38, 38)' : 'rgb(22, 163, 74)',
        }}>
          {msg}
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">ID</th>
                <th className="th">Customer</th>
                <th className="th">Vehicle</th>
                <th className="th">Driver</th>
                <th className="th">Status</th>
                <th className="th">Dispatch</th>
                <th className="th">Delivered</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 && (
                <tr>
                  <td colSpan="8" className="td" style={{ textAlign: 'center', color: 'rgb(100, 116, 139)' }}>
                    No shipments yet.
                  </td>
                </tr>
              )}
              {shipments.map((s) => (
                <tr key={s.shipment_id} className="tr">
                  <td className="td"><b>#{s.shipment_id}</b></td>
                  <td className="td">{s.customer_name}</td>
                  <td className="td">
                    {s.vehicle_number || '—'} {s.vehicle_type ? `(${s.vehicle_type})` : ''}
                  </td>
                  <td className="td">{s.driver_name || '—'}</td>
                  <td className="td">
                    {can(user.role, 'manage_shipments') ? (
                      <select
                        className="statusBadge"
                        style={{
                          ...(STATUS_COLORS[s.status] || {}),
                        }}
                        value={s.status}
                        onChange={(e) => handleStatusChange(s.shipment_id, e.target.value)}
                      >
                        <option value="In-Transit">In-Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className="statusBadge" style={{
                        ...(STATUS_COLORS[s.status] || {}),
                      }}>
                        {s.status}
                      </span>
                    )}
                  </td>
                  <td className="td">
                    {s.dispatch_date
                      ? new Date(s.dispatch_date).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="td">
                    {s.delivery_date
                      ? new Date(s.delivery_date).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="td">
                    {can(user.role, 'manage_shipments') && (
                      <button className="delBtn"
                        onClick={() => handleDelete(s.shipment_id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && can(user.role, 'manage_shipments') && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Create Shipment</h3>
            <div className="field">
              <label className="label">Order (Pending only)</label>
              <select className="input" value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
                <option value="">Select order</option>
                {orders.map(o => (
                  <option key={o.order_id} value={o.order_id}>
                    #{o.order_id} — {o.customer_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Vehicle (Available only)</label>
              <select className="input" value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle</option>
                {vehicles.map(v => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.vehicle_number} — {v.type}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Driver (Available only)</label>
              <select className="input" value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Select driver</option>
                {drivers.map(d => (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.name} — {d.phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleCreate}>Create</button>
              <button className="cancelBtn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}