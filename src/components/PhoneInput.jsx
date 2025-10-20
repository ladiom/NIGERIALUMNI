import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './PhoneInput.css';

// Simple country data for testing
const countries = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', format: 'xxxx xxx xxxx' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(xxx) xxx-xxxx' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: 'xxxx xxx xxx' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(xxx) xxx-xxxx' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', format: 'xxx xxx xxx' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: 'xxx xxxxxxx' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: 'x xx xx xx xx' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', format: 'xxx xxx xxxx' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', format: 'xxx xxx xxx' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', format: 'xx-xxxx-xxxx' }
];

const PhoneInput = ({ 
  value = '', 
  onChange, 
  placeholder = 'Enter phone number', 
  disabled = false,
  error = null,
  className = '',
  name = 'phoneNumber'
}) => {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Nigeria
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Filter countries based on search term
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSearchTerm('');
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5, // Add small gap, use viewport coordinates
        left: rect.left
      });
    }
  };

  // Simple dropdown state management
  const toggleDropdown = () => {
    if (!showDropdown) {
      updateDropdownPosition();
    }
    setShowDropdown(prev => !prev);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearchTerm('');
    
    // Notify parent component with proper event structure
    if (onChange) {
      const fullPhoneNumber = `${country.dialCode}${phoneNumber}`;
      onChange({
        target: {
          name: name,
          value: fullPhoneNumber
        }
      });
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    
    // Notify parent component with proper event structure
    if (onChange) {
      const fullPhoneNumber = `${selectedCountry.dialCode}${value}`;
    onChange({
      target: {
          name: name,
          value: fullPhoneNumber
        }
      });
    }
  };

  // Create dropdown portal
  const dropdownPortal = showDropdown && createPortal(
    <div 
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: '300px',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        maxHeight: '300px',
        overflow: 'auto'
      }}
    >
      <div style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
        <input
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {filteredCountries.length > 0 ? (
          filteredCountries.map((country) => (
            <button
              key={country.code}
              type="button"
              onClick={() => handleCountrySelect(country)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                background: selectedCountry.code === country.code ? '#e3f2fd' : 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.target.style.background = selectedCountry.code === country.code ? '#e3f2fd' : 'none'}
            >
              <span style={{ fontSize: '16px' }}>{country.flag}</span>
              <span style={{ flex: 1, fontWeight: '500' }}>{country.name}</span>
              <span style={{ color: '#6c757d', fontSize: '12px' }}>{country.dialCode}</span>
            </button>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No countries found
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div className={`phone-input-container ${className}`}>
      <div className="phone-input-wrapper">
        {/* Country Selector */}
        <div className="country-selector" style={{ position: 'relative' }}>
          <button
            ref={buttonRef}
            type="button"
            className="country-button"
            id={`${name}-country-selector`}
            aria-label="Select country"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleDropdown();
            }}
            disabled={disabled}
          >
            <span className="country-flag">{selectedCountry.flag}</span>
            <span className="country-code">{selectedCountry.dialCode}</span>
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          id={name}
          name={name}
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className="phone-number-input"
          disabled={disabled}
          aria-label="Phone number"
        />
      </div>
      
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
      
      {/* Render dropdown portal */}
      {dropdownPortal}
    </div>
  );
};

export default PhoneInput;