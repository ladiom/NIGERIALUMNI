import { useState, useEffect } from 'react';
import './EmailPromptModal.css';

function EmailPromptModal({ isOpen, onClose, onSubmit, defaultEmail }) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail || '');
      setError('');
    }
  }, [isOpen, defaultEmail]);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    onSubmit(email);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h3>Enter Your Email</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <label htmlFor="reg-email">Email Address</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
          />
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Send Link</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailPromptModal;