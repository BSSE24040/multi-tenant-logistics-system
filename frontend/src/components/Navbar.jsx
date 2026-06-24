import { getAuth, clearAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar({ toggleSidebar }) {
  const { user } = getAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="navbar">
      <button className="menuBtn" onClick={toggleSidebar}>☰</button>
      <div className="brand">MLSCCS</div>
      <div className="right">
        <div className="userInfo">
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="userName">{user?.name}</div>
            <div className="userRole">{user?.role}</div>
          </div>
        </div>
        <button className="logoutBtn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}