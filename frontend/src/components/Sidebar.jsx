import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const navItems = [
  { path: '/dashboard',           label: 'Dashboard',     icon: '📊' },
  { path: '/tenants',             label: 'Tenants',       icon: '🏢' },
  { path: '/users',               label: 'Users',         icon: '👥' },
  { path: '/warehouses',          label: 'Warehouses',    icon: '🏭' },
  { path: '/products',            label: 'Products',      icon: '📦' },
  { path: '/inventory',           label: 'Inventory',     icon: '🗃️'  },
  { path: '/orders',              label: 'Orders',        icon: '🛒' },
  { path: '/shipments',           label: 'Shipments',     icon: '🚚' },
  { path: '/vehicles',            label: 'Vehicles',      icon: '🚛' },
  { path: '/drivers',             label: 'Drivers',       icon: '👨‍✈️' },
  { path: '/payments',            label: 'Payments',      icon: '💳' },
  { path: '/invoices',            label: 'Invoices',      icon: '🧾' },
  { path: '/analytics',           label: 'Analytics',     icon: '📈' },
];

export default function Sidebar({ isOpen }) {
  return (
    <div className="sidebar" style={{ left: isOpen ? '0' : '-240px' }}>
      <div className="sidebarHeader">
        <p className="sidebarTitle">Navigation</p>
      </div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              background: isActive ? 'rgb(37, 99, 235)' : 'transparent',
              color: isActive ? 'rgb(255, 255, 255)' : 'rgb(203, 213, 225)',
            })}
            className="navItem"
          >
            <span className="icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}