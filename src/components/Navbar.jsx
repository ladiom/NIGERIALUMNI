import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="100NAIRA Platform Home">
          <img 
            src="/NAIRA100LOGO.JPG" 
            alt="100NAIRA Platform Logo" 
            className="logo-image"
          />
        </Link>
        <div className="navbar-links">
          <Link to="/about" className="navbar-link">About</Link>
          {user ? (
            // User is signed in
            <>
              {isAdmin && <Link to="/admin" className="navbar-link">Admin</Link>}
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <button onClick={handleLogout} className="navbar-link logout-button">Logout</button>
            </>
          ) : (
            // User is not signed in
            <>
              <Link to="/register-school" className="navbar-link">Register School</Link>
              <Link to="/login" className="navbar-link login-button">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;