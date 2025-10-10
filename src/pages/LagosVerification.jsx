import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

function LagosVerification() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Lagos State schools when component mounts
  useEffect(() => {
    fetchLagosSchools();
  }, []);

  const fetchLagosSchools = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching Lagos State schools...');
      
      // Using the same filtering logic we added to the Search component
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .or(`state.eq.Lagos,state.ilike.%lagos%`);
        
      console.log('Lagos schools query result:', data, 'Error:', error);
      
      if (error) {
        console.error('Error fetching Lagos schools:', error);
        setError(`Failed to fetch Lagos schools: ${error.message}`);
        setSchools([]);
      } else {
        console.log(`Found ${data.length} Lagos schools`);
        setSchools(data || []);
      }
    } catch (err) {
      console.error('General error:', err);
      setError(`An error occurred: ${err.message}`);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Lagos State Schools Verification</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p>This component directly tests the query that should fix the Lagos State school display issue.</p>
        <p>It uses the same filter logic we added to the main Search component:</p>
        <code>state.eq.Lagos,state.ilike.%lagos%</code>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          Error: {error}
        </div>
      )}
      
      {loading && (
        <p>Loading Lagos State schools...</p>
      )}
      
      {!loading && schools.length === 0 && !error && (
        <p>No Lagos State schools found. This indicates the fix is not working.</p>
      )}
      
      {!loading && schools.length > 0 && (
        <div>
          <h2>Found {schools.length} Lagos State Schools:</h2>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {schools.map((school, index) => (
              <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <strong>{school.name}</strong>
                <p>State: {school.state}</p>
                <p>Level: {school.level}</p>
                {school.lga && <p>LGA: {school.lga}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ marginTop: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
        <h3>Debug Information</h3>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? 'Yes' : 'No'}</p>
        <p>Schools Found: {schools.length}</p>
        <button 
          onClick={fetchLagosSchools} 
          disabled={loading}
          style={{ marginTop: '10px', padding: '8px 15px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}

export default LagosVerification;