import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Warehouses.css';


export default function Warehouses() {
  const { user } = getAuth();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', location: '' });
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/warehouses', form);
      setMsg('Warehouse created');
      setShowAdd(false);
      setForm({ name: '', location: '' });
      fetchAll();
    } catch (err) { setMsg('Failed to create warehouse'); }
  };

  const openEdit = (w) => {
    setEditTarget(w.warehouse_id);
    setForm({ name: w.name, location: w.location });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/warehouses/${editTarget}`, form);
      setMsg('Warehouse updated');
      setEditTarget(null);
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
      setMsg('Warehouse deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">🏭 Warehouses</h1>
          <p className="sub">Manage your storage locations</p>
        </div>
        {can(user.role, 'manage_warehouses') && (
  <button className="addBtn" onClick={() => setShowAdd(true)}>+ Add Warehouse</button>
)}
      </div>

      {msg && <div className="msg">{msg}</div>}

      {loading ? <p>Loading...</p> : (
        <div className="grid">
          {warehouses.length === 0 && (
            <p style={{ color: 'rgb(100, 116, 139)' }}>No warehouses yet. Add one to get started.</p>
          )}
          {warehouses.map((w) => (
            <div key={w.warehouse_id} className="card">
              <div className="cardIcon">🏭</div>
              <div className="cardBody">
                <h3 className="cardTitle">{w.name}</h3>
                <p className="cardSub">📍 {w.location}</p>
                <p className="cardSub">📦 {w.product_count} products stored</p>
              </div>
             <div className="cardActions">
  {can(user.role, 'manage_warehouses') && (
    <button className="editBtn" onClick={() => openEdit(w)}>Edit</button>
  )}
  {can(user.role, 'manage_warehouses') && (
    <button className="delBtn" onClick={() => handleDelete(w.warehouse_id)}>Delete</button>
  )}
</div>
            </div>
          ))}
        </div>
      )}

      {(showAdd || editTarget) && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">{showAdd ? 'Add Warehouse' : 'Edit Warehouse'}</h3>
            {[
              { key: 'name', label: 'Warehouse Name' },
              { key: 'location', label: 'Location' },
            ].map(({ key, label }) => (
              <div key={key} className="field">
                <label className="label">{label}</label>
                <input className="input" value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div className="modalBtns">
              <button className="saveBtn" onClick={showAdd ? handleAdd : handleEdit}>
                {showAdd ? 'Create' : 'Save'}
              </button>
              <button className="cancelBtn" onClick={() => { setShowAdd(false); setEditTarget(null); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}