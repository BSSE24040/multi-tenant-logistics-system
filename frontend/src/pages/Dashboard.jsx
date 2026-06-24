import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { getAuth } from '../utils/auth';
import api from '../utils/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user } = getAuth();
  const [stats, setStats] = useState({
    orders: 0, products: 0, warehouses: 0,
    shipments: 0, payments: 0, drivers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Stats fetch failed:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="header">
        <div>
          <h1 className="welcome">Welcome back, {user?.name} 👋</h1>
          <p className="sub">Here's what's happening in your system today</p>
        </div>
        <div className="badge">{user?.role}</div>
      </div>

      <div className="grid">
          <StatCard title="Total Orders"     value={stats.orders}     icon="🛒" color="rgb(37, 99, 235)" />
          <StatCard title="Products"         value={stats.products}   icon="📦" color="rgb(22, 163, 74)" />
          <StatCard title="Warehouses"       value={stats.warehouses} icon="🏭" color="rgb(217, 119, 6)" />
          <StatCard title="Shipments"        value={stats.shipments}  icon="🚚" color="rgb(124, 58, 237)" />
          <StatCard title="Payments"         value={stats.payments}   icon="💳" color="rgb(220, 38, 38)" />
          <StatCard title="Drivers"          value={stats.drivers}    icon="👨‍✈️" color="rgb(8, 145, 178)" />
</div>

      <div className="infoBox">
        <h3 className="infoTitle">🚀 System Status</h3>
        <p className="infoText">All modules are operational. Use the sidebar to navigate between modules.</p>
      </div>
    </Layout>
  );
}