import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout, isAdmin, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="100NAIRA Platform Home" onClick={closeMobileMenu}>
          <img 
            src="/NAIRA100LOGO.JPG" 
            alt="100NAIRA Platform Logo" 
            className="logo-image"
          />
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/about" className="navbar-link" onClick={closeMobileMenu}>About</Link>
          {user ? (
            // User is signed in
            <>
              {isAdmin && <Link to="/admin" className="navbar-link" onClick={closeMobileMenu}>Admin</Link>}
              <Link to="/dashboard" className="navbar-link" onClick={closeMobileMenu}>Dashboard</Link>
              {userProfile?.alumni_id && (
                <Link to={`/alumni/${userProfile.alumni_id}`} className="navbar-link" onClick={closeMobileMenu}>My Profile</Link>
              )}
              <button onClick={handleLogout} className="navbar-link logout-button">Logout</button>
            </>
          ) : (
            // User is not signed in
            <>
              <Link to="/register-school" className="navbar-link" onClick={closeMobileMenu}>Register</Link>
              <Link to="/login" className="navbar-link login-button" onClick={closeMobileMenu}>Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;