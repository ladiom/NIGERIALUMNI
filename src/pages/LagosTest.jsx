import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

function LagosTest() {
  const [lagosSchools, setLagosSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLagosSchools = async () => {
      try {
        console.log('Fetching Lagos schools directly...');
        
        // Simple query to get all Lagos schools
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .ilike('state', 'Lagos');
          
        console.log('Lagos schools query result:', data, 'Error:', error);
        
        if (error) {
          console.error('Error fetching Lagos schools:', error);
          setError(error.message);
          setLagosSchools([]);
        } else {
          console.log(`Found ${data.length} Lagos schools`);
          setLagosSchools(data);
        }
      } catch (err) {
        console.error('General error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLagosSchools();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Lagos State Schools Test</h1>
      
      {loading && <p>Loading Lagos schools...</p>}
      
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}
      
      {!loading && lagosSchools.length === 0 && (
        <p>No Lagos schools found in the database.</p>
      )}
      
      {!loading && lagosSchools.length > 0 && (
        <div>
          <p>Found {lagosSchools.length} schools in Lagos State:</p>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {lagosSchools.map(school => (
              <li 
                key={school.id} 
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <strong>{school.name}</strong>
                <p>State: {school.state}</p>
                <p>Level: {school.level}</p>
                <p>School Code: {school.school_code}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LagosTest;