import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Drivers.css';

const STATUS_COLORS = {
  Available:  { bg: 'rgb(240, 253, 244)', color: 'rgb(22, 163, 74)' },
  'On-Duty':  { bg: 'rgb(219, 234, 254)', color: 'rgb(29, 78, 216)' },
  'Off-Duty': { bg: 'rgb(241, 245, 249)', color: 'rgb(71, 85, 105)' },
};

export default function Drivers() {
  const { user } = getAuth();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '', licenseNumber: '', phone: '', status: 'Available'
  });

  const fetchAll = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/drivers', form);
      setMsg('Driver added successfully');
      setShowAdd(false);
      setForm({ name: '', licenseNumber: '', phone: '', status: 'Available' });
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add driver');
    }
  };

  const openEdit = (d) => {
    setEditTarget(d.driver_id);
    setForm({
      name: d.name,
      licenseNumber: d.license_number,
      phone: d.phone,
      status: d.status,
    });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/drivers/${editTarget}`, form);
      setMsg('Driver updated');
      setEditTarget(null);
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await api.delete(`/drivers/${id}`);
      setMsg('Driver deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">👨‍✈️ Drivers</h1>
          <p className="sub">Manage your driver fleet</p>
        </div>
{can(user.role, 'manage_drivers') && (
  <button className="addBtn" onClick={() => setShowAdd(true)}>+ Add Driver</button>
)}      </div>

      {msg && <div className="msg">{msg}</div>}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">Driver</th>
                <th className="th">License No.</th>
                <th className="th">Phone</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 && (
                <tr>
                  <td colSpan="5" className="td" style={{ textAlign: 'center', color: 'rgb(100, 116, 139)' }}>
                    No drivers yet. Add one to get started.
                  </td>
                </tr>
              )}
              {drivers.map((d) => (
                <tr key={d.driver_id} className="tr">
                  <td className="td">
                    <div className="driverInfo">
                      <div className="avatar">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                      <span><b>{d.name}</b></span>
                    </div>
                  </td>
                  <td className="td">
                    <span className="licBadge">{d.license_number}</span>
                  </td>
                  <td className="td">{d.phone}</td>
                  <td className="td">
                    <span className="statusBadge" style={{ ...(STATUS_COLORS[d.status] || {}) }}>
                      {d.status}
                    </span>
                  </td>
                <td className="td">
  {can(user.role, 'manage_drivers') && (
    <button className="editBtn" onClick={() => openEdit(d)}>Edit</button>
  )}
  {can(user.role, 'manage_drivers') && (
    <button className="delBtn" onClick={() => handleDelete(d.driver_id)}>Delete</button>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAdd || editTarget) && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">
              {showAdd ? '+ Add Driver' : 'Edit Driver'}
            </h3>
            <div className="field">
              <label className="label">Full Name</label>
              <input className="input" placeholder="e.g. Ahmed Khan"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">License Number</label>
              <input className="input" placeholder="e.g. LHR-2024-001"
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Phone</label>
              <input className="input" placeholder="e.g. 03001234567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Status</label>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {['Available', 'On-Duty', 'Off-Duty'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={showAdd ? handleAdd : handleEdit}>
                {showAdd ? 'Add Driver' : 'Save Changes'}
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