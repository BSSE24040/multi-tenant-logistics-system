import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div>
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} />
      <div
        className="layoutContent"
        style={{ marginLeft: sidebarOpen ? '240px' : '0' }}
      >
        {children}
      </div>
    </div>
  );
}