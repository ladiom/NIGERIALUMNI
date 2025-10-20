import React, { useState } from 'react';
import PhoneInput from '../components/PhoneInput';

const PhoneTest = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+234');

  const handlePhoneChange = (e) => {
    console.log('Phone changed:', e.target.value);
    setPhoneNumber(e.target.value);
    setCountryCode('+234'); // Default for now
  };

  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>
        Phone Input Test Page
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#555' }}>
          Test Phone Input Component
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Phone Number:
          </label>
          <PhoneInput
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="Enter phone number"
          />
        </div>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Current Values:</h3>
          <p><strong>Phone:</strong> {phoneNumber}</p>
          <p><strong>Country Code:</strong> {countryCode}</p>
        </div>
        
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Instructions:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Click the country code button (🇳🇬 +234) to open dropdown</li>
            <li>Search for countries in the search box</li>
            <li>Select a country to change the code</li>
            <li>Type in the phone number field</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PhoneTest;
