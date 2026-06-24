import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Vehicles.css';


const STATUS_COLORS = {
  Available:   { bg: 'rgb(240, 253, 244)', color: 'rgb(22, 163, 74)' },
  'In-Use':    { bg: 'rgb(219, 234, 254)', color: 'rgb(29, 78, 216)' },
  Maintenance: { bg: 'rgb(254, 249, 195)', color: 'rgb(146, 64, 14)' },
};

const VEHICLE_ICONS = {
  Truck: '🚛', Van: '🚐', Bike: '🏍️', Car: '🚗', Other: '🚚',
};

export default function Vehicles() {
  const { user } = getAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    vehicleNumber: '', type: 'Truck', capacity: '', status: 'Available'
  });

  const fetchAll = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/vehicles', form);
      setMsg('Vehicle added successfully');
      setShowAdd(false);
      setForm({ vehicleNumber: '', type: 'Truck', capacity: '', status: 'Available' });
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const openEdit = (v) => {
    setEditTarget(v.vehicle_id);
    setForm({
      vehicleNumber: v.vehicle_number,
      type: v.type,
      capacity: v.capacity,
      status: v.status,
    });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/vehicles/${editTarget}`, form);
      setMsg('Vehicle updated');
      setEditTarget(null);
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setMsg('Vehicle deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">🚛 Vehicles</h1>
          <p className="sub">Manage your fleet</p>
        </div>
{can(user.role, 'manage_vehicles') && (
  <button className="addBtn" onClick={() => setShowAdd(true)}>+ Add Vehicle</button>
)}      </div>

      {msg && <div className="msg">{msg}</div>}

      {loading ? <p>Loading...</p> : (
        <div className="grid">
          {vehicles.length === 0 && (
            <p style={{ color: 'rgb(100, 116, 139)' }}>No vehicles yet. Add one to get started.</p>
          )}
          {vehicles.map((v) => (
            <div key={v.vehicle_id} className="card">
              <div className="cardTop">
                <span className="vehicleIcon">
                  {VEHICLE_ICONS[v.type] || '🚚'}
                </span>
                <span className="statusBadge" style={{ ...(STATUS_COLORS[v.status] || {}) }}>
                  {v.status}
                </span>
              </div>
              <h3 className="vehicleNumber">{v.vehicle_number}</h3>
              <div className="cardDetails">
                <div className="detail">
                  <span className="detailLabel">Type</span>
                  <span className="detailValue">{v.type}</span>
                </div>
                <div className="detail">
                  <span className="detailLabel">Capacity</span>
                  <span className="detailValue">{v.capacity} tons</span>
                </div>
              </div>
            <div className="cardActions">
  {can(user.role, 'manage_vehicles') && (
    <button className="editBtn" onClick={() => openEdit(v)}>Edit</button>
  )}
  {can(user.role, 'manage_vehicles') && (
    <button className="delBtn" onClick={() => handleDelete(v.vehicle_id)}>Delete</button>
  )}
</div>
            </div>
          ))}
        </div>
      )}

      {(showAdd || editTarget) && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">
              {showAdd ? '+ Add Vehicle' : 'Edit Vehicle'}
            </h3>
            <div className="field">
              <label className="label">Vehicle Number</label>
              <input className="input" placeholder="e.g. LEA-1234"
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Type</label>
              <select className="input" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['Truck', 'Van', 'Bike', 'Car', 'Other'].map(t => (
                  <option key={t} value={t}>{VEHICLE_ICONS[t]} {t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Capacity (tons)</label>
              <input className="input" type="number" placeholder="e.g. 5"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Available', 'In-Use', 'Maintenance'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={showAdd ? handleAdd : handleEdit}>
                {showAdd ? 'Add Vehicle' : 'Save Changes'}
              </button>
              <button className="cancelBtn"
                onClick={() => { setShowAdd(false); setEditTarget(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}