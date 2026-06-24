import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';

import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Products.css';

export default function Products() {

  const { user } = getAuth();


  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', sku: '', unitPrice: '' });
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await api.post('/products', form);
      setMsg('Product created');
      setShowAdd(false);
      setForm({ name: '', sku: '', unitPrice: '' });
      fetchAll();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to create product');
    }
  };

  const openEdit = (p) => {
    setEditTarget(p.product_id);
    setForm({ name: p.name, sku: p.sku, unitPrice: p.unit_price });
  };

  const handleEdit = async () => {
    try {
      await api.put(`/products/${editTarget}`, form);
      setMsg('Product updated');
      setEditTarget(null);
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setMsg('Product deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">📦 Products</h1>
          <p className="sub">Manage your product catalog</p>
        </div>
      {can(user.role, 'manage_products') && (
  <button className="addBtn" onClick={() => setShowAdd(true)}>+ Add Product</button>
)}
      </div>

      {msg && <div className="msg">{msg}</div>}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">ID</th>
                <th className="th">Product Name</th>
                <th className="th">SKU</th>
                <th className="th">Unit Price</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.product_id} className="tr">
                  <td className="td">{p.product_id}</td>
                  <td className="td"><b>{p.name}</b></td>
                  <td className="td"><span className="sku">{p.sku}</span></td>
                  <td className="td">Rs. {parseFloat(p.unit_price).toLocaleString()}</td>
                  <td className="td">
  {can(user.role, 'manage_products') && (
    <button className="editBtn" onClick={() => openEdit(p)}>Edit</button>
  )}
  {can(user.role, 'manage_products') && (
    <button className="delBtn" onClick={() => handleDelete(p.product_id)}>Delete</button>
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
            <h3 className="modalTitle">{showAdd ? 'Add Product' : 'Edit Product'}</h3>
            {[
              { key: 'name', label: 'Product Name', type: 'text' },
              { key: 'sku', label: 'SKU', type: 'text' },
              { key: 'unitPrice', label: 'Unit Price (Rs.)', type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key} className="field">
                <label className="label">{label}</label>
                <input className="input" type={type} value={form[key]}
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