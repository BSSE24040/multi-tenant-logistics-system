import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Tenants    from './pages/Tenants';
import Users      from './pages/Users';
import Warehouses from './pages/Warehouses';
import Products   from './pages/Products';
import Inventory  from './pages/Inventory';
import Orders     from './pages/Orders';
import Shipments  from './pages/Shipments';
import Vehicles   from './pages/Vehicles';
import Drivers    from './pages/Drivers';
import Payments   from './pages/Payments';
import Invoices   from './pages/Invoices';
import Analytics  from './pages/Analytics';
import { isLoggedIn } from './utils/auth';

const PrivateRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Navigate to="/login" />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tenants"    element={<PrivateRoute><Tenants /></PrivateRoute>} />
        <Route path="/users"      element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/warehouses" element={<PrivateRoute><Warehouses /></PrivateRoute>} />
        <Route path="/products"   element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/inventory"  element={<PrivateRoute><Inventory /></PrivateRoute>} />
        <Route path="/orders"     element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/shipments"  element={<PrivateRoute><Shipments /></PrivateRoute>} />
        <Route path="/vehicles"   element={<PrivateRoute><Vehicles /></PrivateRoute>} />
        <Route path="/drivers"    element={<PrivateRoute><Drivers /></PrivateRoute>} />
        <Route path="/payments"   element={<PrivateRoute><Payments /></PrivateRoute>} />
        <Route path="/invoices"   element={<PrivateRoute><Invoices /></PrivateRoute>} />
        <Route path="/analytics"  element={<PrivateRoute><Analytics /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}