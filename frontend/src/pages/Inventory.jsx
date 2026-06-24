import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import '../styles/Inventory.css';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inventory');
  const [showSet, setShowSet] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [setForm, setSetForm] = useState({ warehouseId: '', productId: '', quantity: '' });
  const [adjForm, setAdjForm] = useState({ warehouseId: '', productId: '', quantityChange: '', movementType: 'IN' });
  const [showTransfer, setShowTransfer] = useState(false);
const [transferForm, setTransferForm] = useState({
  fromWarehouseId: '', toWarehouseId: '', productId: '', quantity: ''
});
  const [msg, setMsg] = useState('');

  const fetchAll = async () => {
    try {
      const [inv, wh, pr, ls, mv] = await Promise.all([
        api.get('/inventory'),
        api.get('/warehouses'),
        api.get('/products'),
        api.get('/inventory/lowstock'),
        api.get('/inventory/movements'),
      ]);
      setInventory(inv.data);
      setWarehouses(wh.data);
      setProducts(pr.data);
      setLowStock(ls.data);
      setMovements(mv.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSetStock = async () => {
    try {
      await api.post('/inventory/set', setForm);
      setMsg('Stock set successfully');
      setShowSet(false);
      setSetForm({ warehouseId: '', productId: '', quantity: '' });
      fetchAll();
    } catch (err) { setMsg('Failed to set stock'); }
  };

  const handleAdjust = async () => {
    try {
      await api.post('/inventory/adjust', adjForm);
      setMsg('Stock adjusted successfully');
      setShowAdjust(false);
      setAdjForm({ warehouseId: '', productId: '', quantityChange: '', movementType: 'IN' });
      fetchAll();
    } catch (err) { setMsg('Failed to adjust stock'); }
  };

  const handleTransfer = async () => {
  try {
    await api.post('/inventory/transfer', transferForm);
    setMsg('✅ Stock transferred successfully');
    setShowTransfer(false);
    setTransferForm({ fromWarehouseId: '', toWarehouseId: '', productId: '', quantity: '' });
    fetchAll();
  } catch (err) {
    setMsg(`❌ ${err.response?.data?.message || 'Transfer failed'}`);
  }
};

const handleDeleteInventory = async (inventoryId) => {
  if (!window.confirm('Remove this product from this warehouse?')) return;
  try {
    await api.delete(`/inventory/item/${inventoryId}`);
    setMsg('✅ Inventory record deleted');
    fetchAll();
  } catch (err) {
    setMsg(`❌ ${err.response?.data?.message || 'Delete failed'}`);
  }
};

const handleDeleteMovement = async (movementId) => {
  if (!window.confirm('Delete this stock movement record?')) return;
  try {
    await api.delete(`/inventory/movement/${movementId}`);
    setMsg('✅ Movement record deleted');
    fetchAll();
  } catch (err) {
    setMsg(`❌ ${err.response?.data?.message || 'Delete failed'}`);
  }
};

  const tabs = ['inventory', 'lowstock', 'movements'];

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">🗃️ Inventory</h1>
          <p className="sub">Track stock levels and movements</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="addBtn" onClick={() => setShowSet(true)}>+ Set Stock</button>
          <button className="addBtn" style={{ background: 'rgb(22, 163, 74)' }} onClick={() => setShowAdjust(true)}>± Adjust Stock</button>
        <button className="tranBtn" onClick={() => setShowTransfer(true)}>⇄ Transfer Stock</button>
        </div>
      </div>

      {msg && <div className="msg">{msg}</div>}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button key={t} className={`tab${tab === t ? ' activeTab' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'inventory' ? '📦 Stock' : t === 'lowstock' ? '⚠️ Low Stock' : '📋 Movements'}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {tab === 'inventory' && (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr className="thead">
                    <th className="th">Product</th>
                    <th className="th">SKU</th>
                    <th className="th">Warehouse</th>
                    <th className="th">Quantity</th>
                    <th className="th">Last Updated</th>
                    <th className="th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((i) => (
                    <tr key={i.inventory_id} className="tr">
                      <td className="td"><b>{i.product_name}</b></td>
                      <td className="td"><span className="sku">{i.sku}</span></td>
                      <td className="td">{i.warehouse_name}</td>
                      <td className="td">
                        <span className="qtyBadge" style={{
                          background: i.quantity <= 10 ? 'rgb(254, 242, 242)' : 'rgb(240, 253, 244)',
                          color: i.quantity <= 10 ? 'rgb(220, 38, 38)' : 'rgb(22, 163, 74)',
                        }}>{i.quantity}</span>
                      </td>
                      <td className="td">{new Date(i.last_updated).toLocaleString()}</td>
                        <td className="td"><button className="deleteBtn" onClick={() => handleDeleteInventory(i.inventory_id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'lowstock' && (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr className="thead">
                    <th className="th">Product</th>
                    <th className="th">SKU</th>
                    <th className="th">Warehouse</th>
                    <th className="th">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.length === 0
                    ? <tr><td colSpan="4" className="td" style={{ color: 'rgb(22, 163, 74)', textAlign: 'center' }}>✅ No low stock items</td></tr>
                    : lowStock.map((i) => (
                      <tr key={i.inventory_id} className="tr">
                        <td className="td"><b>{i.product_name}</b></td>
                        <td className="td">{i.sku}</td>
                        <td className="td">{i.warehouse_name}</td>
                        <td className="td"><span className="qtyBadge" style={{ background: 'rgb(254, 242, 242)', color: 'rgb(220, 38, 38)' }}>{i.quantity} ⚠️</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'movements' && (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr className="thead">
                    <th className="th">Product</th>
                    <th className="th">Warehouse</th>
                    <th className="th">Type</th>
                    <th className="th">Quantity Change</th>
                    <th className="th">Timestamp</th>
                    <th className="th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.movement_id} className="tr">
                      <td className="td"><b>{m.product_name}</b></td>
                      <td className="td">{m.warehouse_name}</td>
                      <td className="td">
                        <span className="typeBadge" style={{
                          background: m.movement_type === 'IN' ? 'rgb(240, 253, 244)' : m.movement_type === 'OUT' ? 'rgb(254, 242, 242)' : 'rgb(254, 249, 195)',
                          color: m.movement_type === 'IN' ? 'rgb(22, 163, 74)' : m.movement_type === 'OUT' ? 'rgb(220, 38, 38)' : 'rgb(146, 64, 14)',
                        }}>{m.movement_type}</span>
                      </td>
                      <td className="td">{m.quantity_change > 0 ? '+' : ''}{m.quantity_change}</td>
                      <td className="td">{new Date(m.timestamp).toLocaleString()}</td>
                      <td className="td">
              <button
                className="deleteBtn"
                onClick={() =>
                  handleDeleteMovement(m.movement_id)
                }
              >
                Delete
              </button>
            </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Set Stock Modal */}
      {showSet && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Set Stock Level</h3>
            <div className="field">
              <label className="label">Warehouse</label>
              <select className="input" value={setForm.warehouseId}
                onChange={(e) => setSetForm({ ...setForm, warehouseId: e.target.value })}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Product</label>
              <select className="input" value={setForm.productId}
                onChange={(e) => setSetForm({ ...setForm, productId: e.target.value })}>
                <option value="">Select product</option>
                {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Quantity</label>
              <input className="input" type="number" value={setForm.quantity}
                onChange={(e) => setSetForm({ ...setForm, quantity: e.target.value })} />
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleSetStock}>Set Stock</button>
              <button className="cancelBtn" onClick={() => setShowSet(false)}>Cancel</button>

            </div>
          </div>
        </div>
      )}

      {/*adjust Stock Modal */}
      {showAdjust && (
        <div className="overlay">
          <div className="modal">
            <h3 className="modalTitle">Adjust Stock</h3>
            <div className="field">
              <label className="label">Warehouse</label>
              <select className="input" value={adjForm.warehouseId}
                onChange={(e) => setAdjForm({ ...adjForm, warehouseId: e.target.value })}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Product</label>
              <select className="input" value={adjForm.productId}
                onChange={(e) => setAdjForm({ ...adjForm, productId: e.target.value })}>
                <option value="">Select product</option>
                {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Movement Type</label>
              <select className="input" value={adjForm.movementType}
                onChange={(e) => setAdjForm({ ...adjForm, movementType: e.target.value })}>
                <option value="IN">IN (Stock arriving)</option>
                <option value="OUT">OUT (Stock leaving)</option>
                <option value="TRANSFER">TRANSFER</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Quantity Change (use negative for OUT)</label>
              <input className="input" type="number" value={adjForm.quantityChange}
                onChange={(e) => setAdjForm({ ...adjForm, quantityChange: e.target.value })} />
            </div>
            <div className="modalBtns">
              <button className="saveBtn" onClick={handleAdjust}>Adjust</button>
              <button className="cancelBtn" onClick={() => setShowAdjust(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
     
      {showTransfer  && (
  <div className="overlay">
    <div className="modal">
      <h3 className="modalTitle">⇄ Transfer Stock</h3>

      <p className="transferSub">
        Move stock from one warehouse to another
      </p>

      <div className="field">
        <label className="label">From Warehouse</label>

        <select
          className="input"
          value={transferForm.fromWarehouseId}
          onChange={(e) =>
            setTransferForm({
              ...transferForm,
              fromWarehouseId: e.target.value,
            })
          }
        >
          <option value="">Select source warehouse</option>

          {warehouses.map((w) => (
            <option
              key={w.warehouse_id}
              value={w.warehouse_id}
            >
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label">To Warehouse</label>

        <select
          className="input"
          value={transferForm.toWarehouseId}
          onChange={(e) =>
            setTransferForm({
              ...transferForm,
              toWarehouseId: e.target.value,
            })
          }
        >
          <option value="">
            Select destination warehouse
          </option>

          {warehouses
            .filter(
              (w) =>
                w.warehouse_id !==
                parseInt(transferForm.fromWarehouseId)
            )
            .map((w) => (
              <option
                key={w.warehouse_id}
                value={w.warehouse_id}
              >
                {w.name}
              </option>
            ))}
        </select>
      </div>

      <div className="field">
        <label className="label">Product</label>

        <select
          className="input"
          value={transferForm.productId}
          onChange={(e) =>
            setTransferForm({
              ...transferForm,
              productId: e.target.value,
            })
          }
        >
          <option value="">Select product</option>

          {products.map((p) => (
            <option
              key={p.product_id}
              value={p.product_id}
            >
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label">
          Quantity to Transfer
        </label>

        <input
          className="input"
          type="number"
          min="1"
          placeholder="e.g. 10"
          value={transferForm.quantity}
          onChange={(e) =>
            setTransferForm({
              ...transferForm,
              quantity: e.target.value,
            })
          }
        />
      </div>

      <div className="modalBtns">
        <button
          className="transferBtn"
          onClick={handleTransfer}
        >
          Transfer
        </button>

        <button
          className="cancelBtn"
          onClick={() => setShowTransfer(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      
    </Layout>
  );
}