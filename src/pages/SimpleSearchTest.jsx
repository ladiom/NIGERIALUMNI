import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

function SimpleSearchTest() {
  const [selectedState, setSelectedState] = useState('');
  const [schoolNames, setSchoolNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample states in Nigeria - focusing on Lagos for testing
  const states = ['', 'Lagos'];

  // When state changes, fetch schools
  useEffect(() => {
    if (selectedState) {
      fetchSchoolsByState(selectedState);
    } else {
      setSchoolNames([]);
    }
  }, [selectedState]);

  const fetchSchoolsByState = async (state) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching schools for state: ${state}`);
      
      // Direct query to Supabase
      const { data, error } = await supabase
        .from('schools')
        .select('name')
        .ilike('state', state);
        
      console.log('Query result:', data, 'Error:', error);
      
      if (error) {
        console.error('Error fetching schools:', error);
        setError(`Failed to fetch schools: ${error.message}`);
        setSchoolNames([]);
      } else {
        const uniqueNames = [...new Set(data.map(item => item.name))].sort();
        console.log(`Found ${uniqueNames.length} schools in ${state}`);
        setSchoolNames(uniqueNames);
      }
    } catch (err) {
      console.error('General error:', err);
      setError(`An error occurred: ${err.message}`);
      setSchoolNames([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Simple School Search Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="state-select">Select State:</label>
        <select
          id="state-select"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          {states.map(state => (
            <option key={state} value={state}>
              {state || 'Select State'}
            </option>
          ))}
        </select>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          Error: {error}
        </div>
      )}
      
      {loading && (
        <p>Loading schools...</p>
      )}
      
      {!loading && selectedState && schoolNames.length === 0 && (
        <p>No schools found for {selectedState}.</p>
      )}
      
      {!loading && selectedState && schoolNames.length > 0 && (
        <div>
          <p>Found {schoolNames.length} schools in {selectedState}:</p>
          <ul>
            {schoolNames.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3>Debug Information</h3>
        <p>Selected State: {selectedState || 'None'}</p>
        <p>School Names Count: {schoolNames.length}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

export default SimpleSearchTest;