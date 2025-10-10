import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <img 
                src="/NAIRA100LOGO.JPG" 
                alt="Nigeria Alumni Network Logo" 
                className="footer-logo-image"
              />
            </div>
            <p>Connecting alumni to their alma maters and supporting educational development.</p>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Contact</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Nigeria Alumni Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;