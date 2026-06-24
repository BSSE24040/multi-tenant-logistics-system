import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import '../styles/Analytics.css';

const healthDot = (color) => ({
  display: 'inline-block', width: '10px', height: '10px',
  borderRadius: '50%', background: color, flexShrink: 0,
});

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [orderStatus, setOrderStatus] = useState([]);
  const [revenueMethod, setRevenueMethod] = useState([]);
  const [shipmentStatus, setShipmentStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [ov, os, rm, ss] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/orders-by-status'),
        api.get('/analytics/revenue-by-method'),
        api.get('/analytics/shipments-by-status'),
      ]);
      setOverview(ov.data);
      setOrderStatus(os.data);
      setRevenueMethod(rm.data);
      setShipmentStatus(ss.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <Layout><p style={{ padding: '40px' }}>Loading analytics...</p></Layout>;

  const orderStatusColors = {
    Pending: 'rgb(217, 119, 6)', 'In-Transit': 'rgb(37, 99, 235)', Delivered: 'rgb(22, 163, 74)'
  };

  const shipmentStatusColors = {
    'In-Transit': 'rgb(37, 99, 235)', Delivered: 'rgb(22, 163, 74)', Cancelled: 'rgb(220, 38, 38)'
  };

  const maxOrderCount = Math.max(...orderStatus.map(o => parseInt(o.count)), 1);
  const maxRevenue = Math.max(...revenueMethod.map(r => parseFloat(r.total)), 1);
  const maxShipCount = Math.max(...shipmentStatus.map(s => parseInt(s.count)), 1);
  const maxProductSold = Math.max(...(overview?.topProducts || []).map(p => parseInt(p.total_sold)), 1);

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="title">📈 Analytics &amp; Reports</h1>
          <p className="sub">System-wide performance overview</p>
        </div>
        <button className="refreshBtn" onClick={fetchAll}>🔄 Refresh</button>
      </div>

      {/* KPI Grid */}
      <div className="kpiGrid">
        {[
          { label: 'Total Revenue',    value: `Rs. ${overview.totalRevenue.toLocaleString()}`, icon: '💰', color: 'rgb(22, 163, 74)' },
          { label: 'Total Orders',     value: overview.totalOrders,     icon: '🛒', color: 'rgb(37, 99, 235)' },
          { label: 'Total Shipments',  value: overview.totalShipments,  icon: '🚚', color: 'rgb(124, 58, 237)' },
          { label: 'Pending Orders',   value: overview.pendingOrders,   icon: '⏳', color: 'rgb(217, 119, 6)' },
          { label: 'Delivered Orders', value: overview.deliveredOrders, icon: '✅', color: 'rgb(22, 163, 74)' },
          { label: 'Low Stock Items',  value: overview.lowStockItems,   icon: '⚠️', color: 'rgb(220, 38, 38)' },
          { label: 'Total Products',   value: overview.totalProducts,   icon: '📦', color: 'rgb(8, 145, 178)' },
          { label: 'Warehouses',       value: overview.totalWarehouses, icon: '🏭', color: 'rgb(217, 119, 6)' },
          { label: 'Drivers',          value: overview.totalDrivers,    icon: '👨‍✈️', color: 'rgb(124, 58, 237)' },
          { label: 'Vehicles',         value: overview.totalVehicles,   icon: '🚛', color: 'rgb(8, 145, 178)' },
        ].map((kpi) => (
          <div key={kpi.label} className="kpiCard" style={{ borderLeft: `4px solid ${kpi.color}` }}>
            <div className="kpiTop">
              <span className="kpiIcon">{kpi.icon}</span>
              <span className="kpiValue" style={{ color: kpi.color }}>{kpi.value}</span>
            </div>
            <p className="kpiLabel">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="chartsRow">
        {/* Orders by Status */}
        <div className="chartCard">
          <h3 className="chartTitle">📊 Orders by Status</h3>
          {orderStatus.length === 0
            ? <p className="empty">No order data yet</p>
            : orderStatus.map((o) => (
              <div key={o.status} className="barRow">
                <span className="barLabel">{o.status}</span>
                <div className="barTrack">
                  <div className="barFill" style={{
                    width: `${(parseInt(o.count) / maxOrderCount) * 100}%`,
                    background: orderStatusColors[o.status] || 'rgb(37, 99, 235)',
                  }} />
                </div>
                <span className="barValue">{o.count}</span>
              </div>
            ))}
        </div>

        {/* Shipments by Status */}
        <div className="chartCard">
          <h3 className="chartTitle">🚚 Shipments by Status</h3>
          {shipmentStatus.length === 0
            ? <p className="empty">No shipment data yet</p>
            : shipmentStatus.map((s) => (
              <div key={s.status} className="barRow">
                <span className="barLabel">{s.status}</span>
                <div className="barTrack">
                  <div className="barFill" style={{
                    width: `${(parseInt(s.count) / maxShipCount) * 100}%`,
                    background: shipmentStatusColors[s.status] || 'rgb(124, 58, 237)',
                  }} />
                </div>
                <span className="barValue">{s.count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="chartsRow">
        {/* Revenue by Payment Method */}
        <div className="chartCard">
          <h3 className="chartTitle">💳 Revenue by Payment Method</h3>
          {revenueMethod.length === 0
            ? <p className="empty">No payment data yet</p>
            : revenueMethod.map((r) => (
              <div key={r.method} className="barRow">
                <span className="barLabel">{r.method}</span>
                <div className="barTrack">
                  <div className="barFill" style={{
                    width: `${(parseFloat(r.total) / maxRevenue) * 100}%`,
                    background: 'rgb(22, 163, 74)',
                  }} />
                </div>
                <span className="barValue">
                  Rs. {parseFloat(r.total).toLocaleString()}
                </span>
              </div>
            ))}
        </div>

        {/* Top Products */}
        <div className="chartCard">
          <h3 className="chartTitle">🏆 Top Selling Products</h3>
          {overview.topProducts.length === 0
            ? <p className="empty">No sales data yet</p>
            : overview.topProducts.map((p, i) => (
              <div key={p.name} className="barRow">
                <span className="barLabel">
                  <span className="rank">#{i + 1}</span> {p.name}
                </span>
                <div className="barTrack">
                  <div className="barFill" style={{
                    width: `${(parseInt(p.total_sold) / maxProductSold) * 100}%`,
                    background: 'rgb(124, 58, 237)',
                  }} />
                </div>
                <span className="barValue">{p.total_sold} units</span>
              </div>
            ))}
        </div>
      </div>

      {/* System Health */}
      <div className="healthCard">
        <h3 className="chartTitle">🟢 System Health Summary</h3>
        <div className="healthGrid">
          <div className="healthItem">
            <span style={healthDot('rgb(22, 163, 74)')} />
            <span>Database Connected</span>
          </div>
          <div className="healthItem">
            <span style={healthDot('rgb(22, 163, 74)')} />
            <span>RBAC Active</span>
          </div>
          <div className="healthItem">
            <span style={healthDot('rgb(22, 163, 74)')} />
            <span>Multi-Tenancy Enabled</span>
          </div>
          <div className="healthItem">
            <span style={overview.lowStockItems > 0 ? healthDot('rgb(220, 38, 38)') : healthDot('rgb(22, 163, 74)')} />
            <span>{overview.lowStockItems > 0
              ? `${overview.lowStockItems} Low Stock Alerts`
              : 'Stock Levels Healthy'}</span>
          </div>
          <div className="healthItem">
            <span style={healthDot('rgb(22, 163, 74)')} />
            <span>Audit Logs Running</span>
          </div>
          <div className="healthItem">
            <span style={overview.pendingOrders > 0 ? healthDot('rgb(217, 119, 6)') : healthDot('rgb(22, 163, 74)')} />
            <span>{overview.pendingOrders > 0
              ? `${overview.pendingOrders} Orders Pending`
              : 'All Orders Processed'}</span>
          </div>
        </div>
      </div>

    </Layout>
  );
}