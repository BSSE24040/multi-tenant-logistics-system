import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Tenants.css';



export default function Tenants() {
  const { user } = getAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', contact_email: '', contact_phone: '' });
  const [msg, setMsg] = useState('');

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenants');
      setTenants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTenants(); }, []);

  const openEdit = (tenant) => {
    setEditTarget(tenant.tenant_id);
    setForm({
      name: tenant.name,
      contact_email: tenant.contact_email,
      contact_phone: tenant.contact_phone,
    });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/tenants/${editTarget}`, form);
      setMsg('Tenant updated successfully');
      setEditTarget(null);
      fetchTenants();
    } catch (err) {
      setMsg('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tenant? This will remove ALL their data.')) return;
    try {
      await api.delete(`/tenants/${id}`);
      setMsg('Tenant deleted');
      fetchTenants();
    } catch (err) {
      setMsg('Delete failed');
    }
  };

  return (
    <Layout>
      <div className="header">
        <h1 className="title">🏢 Tenants</h1>
        <p className="sub">All registered companies in the system</p>
      </div>

      {msg && <div className="msg">{msg}</div>}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">ID</th>
                <th className="th">Company Name</th>
                <th className="th">Email</th>
                <th className="th">Phone</th>
                <th className="th">Users</th>
                <th className="th">Created</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.tenant_id} className="tr">
                  <td className="td">{t.tenant_id}</td>
                  <td className="td"><b>{t.name}</b></td>
                  <td className="td">{t.contact_email}</td>
                  <td className="td">{t.contact_phone}</td>
                  <td className="td">{t.user_count}</td>
                  <td className="td">{new Date(t.created_at).toLocaleDateString()}</td>
                 <td className="td">
  {can(user.role, 'manage_tenants') && (
    <button className="editBtn" onClick={() => openEdit(t)}>Edit</button>
  )}
  {can(user.role, 'manage_tenants') && (
    <button className="delBtn" onClick={() => handleDelete(t.tenant_id)}>Delete</button>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Edit Tenant</h3>
            {['name', 'contact_email', 'contact_phone'].map((field) => (
              <div key={field} className="field">
                <label className="label">{field.replace('_', ' ')}</label>
                <input className="input" value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
              </div>
            ))}
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleUpdate}>Save</button>
              <button className="cancelBtn" onClick={() => setEditTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}