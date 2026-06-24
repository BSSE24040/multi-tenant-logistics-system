import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { can } from '../utils/rbac';
import { getAuth } from '../utils/auth';
import '../styles/Orders.css';

const STATUS_COLORS = {
  Pending:    { bg: 'rgb(254, 249, 195)', color: 'rgb(146, 64, 14)' },
  'In-Transit': { bg: 'rgb(219, 234, 254)', color: 'rgb(29, 78, 216)' },
  Delivered:  { bg: 'rgb(240, 253, 244)', color: 'rgb(22, 163, 74)' },
};

export default function Orders() {
  const { user } = getAuth();

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({ customerName: '', items: [{ productId: '', quantity: 1, price: '' }] });

  const fetchAll = async () => {
    try {
      const [ordRes, proRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
      ]);
      setOrders(ordRes.data);
      setProducts(proRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { productId: '', quantity: 1, price: '' }] });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    if (field === 'productId') {
      const product = products.find(p => p.product_id === parseInt(value));
      if (product) items[index].price = product.unit_price;
    }
    setForm({ ...form, items });
  };

const orderTotal = form.items.reduce((sum, item) => {
  return sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
}, 0);

  const handleCreate = async () => {
    try {
      await api.post('/orders', form);
      setMsg('✅ Order created successfully ');
      setShowAdd(false);
      setForm({ customerName: '', items: [{ productId: '', quantity: 1, price: '' }] });
      fetchAll();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create order';
      setMsg(`❌ ${errorMsg}`);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}`, { status });
      setMsg('Order status updated');
      fetchAll();
    } catch (err) { setMsg('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await api.delete(`/orders/${id}`);
      setMsg('Order deleted');
      fetchAll();
    } catch (err) { setMsg('Delete failed'); }
  };

  const viewOrder = async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      setSelectedOrder(res.data);
    } catch (err) { console.error(err); }
  };

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">🛒 Orders</h1>
          <p className="sub">Manage customer orders</p>
        </div>
        {can(user.role, 'create_orders') && (
          <button className="addBtn" onClick={() => setShowAdd(true)}>+ New Order</button>
        )}
      </div>



      {msg && <div className="msg">{msg}</div>}

      {loading ? <p>Loading...</p> : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr className="thead">
                <th className="th">Order ID</th>
                <th className="th">Customer</th>
                <th className="th">Items</th>
                <th className="th">Total</th>
                <th className="th">Status</th>
                <th className="th">Date</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.order_id} className="tr">
                  <td className="td"><b>#{o.order_id}</b></td>
                  <td className="td">{o.customer_name}</td>
                  <td className="td">{o.item_count} items</td>
                  <td className="td">
                    Rs. {o.total_amount ? parseFloat(o.total_amount).toLocaleString() : '0'}
                  </td>
                  <td className="td">
                    <select
                      className="statusBadge"
                      style={{ background: STATUS_COLORS[o.status]?.bg, color: STATUS_COLORS[o.status]?.color }}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="td">{new Date(o.order_date).toLocaleDateString()}</td>
                  <td className="td">
                    <button className="viewBtn" onClick={() => viewOrder(o.order_id)}>View</button>
                    <button className="delBtn" onClick={() => handleDelete(o.order_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {showAdd && (
        <div className="overlay">
          <div className="modal" style={{ width: '560px', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 className="modalTitle">Create New Order</h3>
            <div className="field">
              <label className="label">Customer Name</label>
              <input className="input" value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>

            <p className="sectionLabel">Order Items</p>
            {form.items.map((item, index) => (
              <div key={index} className="itemRow">
                <select className="input" style={{ flex: 2 }} value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', e.target.value)}>
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>{p.name}</option>
                  ))}
                </select>
                <input className="input" style={{ flex: 1 }} type="number"
                  placeholder="Qty" min="1" value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                <input className="input" style={{ flex: 1 }} type="number"
                  placeholder="Price" value={item.price}
                  onChange={(e) => updateItem(index, 'price', e.target.value)} />
                {form.items.length > 1 && (
                  <button className="removeBtn" onClick={() => removeItem(index)}>✕</button>
                )}
              </div>
            ))}
            <button className="addItemBtn" onClick={addItem}>+ Add Item</button>

<div className="orderTotalBox">
  <span className="orderTotalLabel">
    Order Total
  </span>

  <span className="orderTotalValue">
    Rs. {orderTotal.toLocaleString()}
  </span>
</div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleCreate}>Create Order</button>
              <button className="cancelBtn" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="overlay">
          <div className="modal" style={{ width: '520px' }}>
            <h3 className="modalTitle">Order #{selectedOrder.order_id}</h3>
            <p style={{ marginBottom: '8px', fontSize: '14px' }}>
              <b>Customer:</b> {selectedOrder.customer_name}
            </p>
            <p style={{ marginBottom: '16px', fontSize: '14px' }}>
              <b>Status:</b> {selectedOrder.status}
            </p>
            <p className="sectionLabel">Items</p>
            <table className="table" style={{ marginBottom: '20px' }}>
              <thead>
                <tr className="thead">
                  <th className="th">Product</th>
                  <th className="th">Qty</th>
                  <th className="th">Price</th>
                  <th className="th">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item) => (
                  <tr key={item.order_item_id} className="tr">
                    <td className="td">{item.product_name}</td>
                    <td className="td">{item.quantity}</td>
                    <td className="td">Rs. {parseFloat(item.price).toLocaleString()}</td>
                    <td className="td">Rs. {(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="saveBtn" style={{ width: '100%' }}
              onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
}