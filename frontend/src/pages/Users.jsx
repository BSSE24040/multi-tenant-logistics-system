import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Users.css';

export default function Users() {
  const { user } = getAuth();
       
         /*  use state variables*/
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [msg, setMsg] = useState('');

  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', roleId: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '', roleId: '', isActive: true });

  const fetchAll = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
      ]);
      setUsers(usersRes.data);/* setting the data */
      setRoles(rolesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []); /*runs once at start  */

  
  const handleAdd = async () => {
    try {
      await api.post('/users', addForm);
      setMsg('User created successfully');
      setShowAdd(false);
      setAddForm({ name: '', email: '', password: '', roleId: '' });
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create user');
    }
  };

  const openEdit = (u) => { 
    setEditTarget(u.user_id);
    setEditForm({
      name: u.name,
      email: u.email,
      roleId: roles.find(r => r.role_name === u.role_name)?.role_id || '',
      isActive: u.is_active,
    });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/users/${editTarget}`, editForm); /*api call for editing */
      setMsg('User updated successfully');
      setEditTarget(null);
      fetchAll();/* fetch the latest ones */
    } catch (err) {
      setMsg('Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`); /* API for deleting the user based on id*/
      setMsg('User deleted');
      fetchAll();
    } catch (err) {
      setMsg('Delete failed');
    }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">👥 Users</h1>
          <p className="sub">Manage users in your organization</p>
        </div>
        {can(user.role, 'manage_users') && (
          <button className="addBtn" onClick={() => setShowAdd(true)}>
            + Add User
          </button>
        )}
      </div>

      {msg && <div className="msg">{msg}</div>}     

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">Name</th>
                <th className="th">Email</th>
                <th className="th">Role</th>
                <th className="th">Status</th>
                <th className="th">Created</th>
                {can(user.role, 'manage_users') && (
                  <th className="th">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'rgb(100, 116, 139)' }}>
                    No users yet.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.user_id} className="tr">
                  <td className="td"><b>{u.name}</b></td>
                  <td className="td">{u.email}</td>
                  <td className="td">
                    <span
                      className="roleBadge"
                     style={{
  background: u.role_name === 'Admin' ? 'rgb(219, 234, 254)' : u.role_name === 'Manager' ? 'rgb(254, 249, 195)' : 'rgb(240, 253, 244)',
  color: u.role_name === 'Admin' ? 'rgb(29, 78, 216)' : u.role_name === 'Manager' ? 'rgb(146, 64, 14)' : 'rgb(21, 128, 61)',
}}
                    >
                      {u.role_name}
                    </span>
                  </td>
                  <td className="td">
                    <span
                      className="statusBadge"
                      style={{
  background: u.is_active ? 'rgb(240, 253, 244)' : 'rgb(254, 242, 242)',
  color: u.is_active ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
}}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="td">{new Date(u.created_at).toLocaleDateString()}</td>
                  {can(user.role, 'manage_users') && (
                    <td className="td">
                      <button className="editBtn" onClick={() => openEdit(u)}>Edit</button>
                      <button className="delBtn" onClick={() => handleDelete(u.user_id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && can(user.role, 'manage_users') && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Add New User</h3>
            {[
              { key: 'name',     label: 'Full Name', type: 'text'     },
              { key: 'email',    label: 'Email',     type: 'email'    },
              { key: 'password', label: 'Password',  type: 'password' },
            ].map(({ key, label, type }) => (
              <div key={key} className="field">
                <label className="label">{label}</label>
                <input
                  className="input"
                  type={type}
                  value={addForm[key]}
                  onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="field">
              <label className="label">Role</label>
              <select
                className="input"
                value={addForm.roleId}
                onChange={(e) => setAddForm({ ...addForm, roleId: e.target.value })}
              >
                <option value="">Select role</option>
                {roles
                  .filter(r => r.role_name !== 'Admin')
                  .map(r => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))
                }
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleAdd}>Create</button>
              <button className="cancelBtn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && can(user.role, 'manage_users') && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Edit User</h3>
            {[
              { key: 'name',  label: 'Full Name', type: 'text'  },
              { key: 'email', label: 'Email',     type: 'email' },
            ].map(({ key, label, type }) => (
              <div key={key} className="field">
                <label className="label">{label}</label>
                <input
                  className="input"
                  type={type}
                  value={editForm[key]}
                  onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="field">
              <label className="label">Role</label>
              <select
                className="input"
                value={editForm.roleId}
                onChange={(e) => setEditForm({ ...editForm, roleId: e.target.value })}
              >
                <option value="">Select role</option>
                {roles
                  .filter(r => r.role_name !== 'Admin')
                  .map(r => (
                    <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                  ))
                }
              </select>
            </div>
            <div className="field">
              <label className="label">Status</label>
              <select
                className="input"
                value={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleEdit}>Save</button>
              <button className="cancelBtn" onClick={() => setEditTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}