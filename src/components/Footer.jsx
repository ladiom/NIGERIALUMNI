import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <img 
                src="/partner-logos/AlaumniNairaLogo3Oct.jpg" 
                alt="NAIRA-100 Logo" 
                className="footer-logo-image"
              />
            </div>
            <p>National Alumni Institutions Revival Alliance (NAIRA) - Connecting alumni to their alma maters and supporting educational development across Nigeria.</p>
          </div>
          
          <div className="footer-navigation">
            <h4>Navigation</h4>
            <div className="footer-links">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/partners" className="footer-link">Partners</Link>
              <Link to="/register-school" className="footer-link">Register School</Link>
              <Link to="/login" className="footer-link">Login</Link>
            </div>
          </div>
          
          <div className="footer-contact">
            <h4>Contact Information</h4>
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>No 5 Adeoyo Hospital Road Ringroad<br />00000 Ibadan, Nigeria</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+234 9055552524</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>operations@kajopo.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NAIRA-100 - National Alumni Institutions Revival Alliance. All rights reserved.</p>
          <p className="kajopo-branding">Product of <strong>Kajopo Solutions</strong></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;