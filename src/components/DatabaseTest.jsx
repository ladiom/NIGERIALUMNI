import { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      
      // Test 1: Simple count query
      const { count: schoolCount, error: schoolError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });
      
      // Test 2: Simple data fetch
      const { data: sampleSchools, error: sampleError } = await supabase
        .from('schools')
        .select('id, name')
        .limit(3);
      
      // Test 3: Alumni count
      const { count: alumniCount, error: alumniError } = await supabase
        .from('alumni')
        .select('*', { count: 'exact', head: true });

      setTestResults({
        schoolCount: schoolCount || 0,
        schoolError: schoolError?.message || null,
        sampleSchools: sampleSchools || [],
        sampleError: sampleError?.message || null,
        alumniCount: alumniCount || 0,
        alumniError: alumniError?.message || null
      });

      if (schoolError || sampleError || alumniError) {
        setConnectionStatus('error');
      } else {
        setConnectionStatus('success');
      }
    } catch (error) {
      console.error('Database test error:', error);
      setConnectionStatus('error');
      setTestResults({ error: error.message });
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return '#ffa500';
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return 'Testing Database Connection...';
      case 'success': return 'Database Connected Successfully';
      case 'error': return 'Database Connection Failed';
      default: return 'Unknown Status';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#fff',
      border: `2px solid ${getStatusColor()}`,
      borderRadius: '8px',
      padding: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <div style={{ fontWeight: 'bold', color: getStatusColor(), marginBottom: '5px' }}>
        {getStatusText()}
      </div>
      
      {connectionStatus === 'success' && (
        <div>
          <div>Schools: {testResults.schoolCount}</div>
          <div>Alumni: {testResults.alumniCount}</div>
          <div>Sample: {testResults.sampleSchools.map(s => s.name).join(', ')}</div>
        </div>
      )}
      
      {connectionStatus === 'error' && (
        <div style={{ color: '#f44336' }}>
          <div>School Error: {testResults.schoolError || 'None'}</div>
          <div>Sample Error: {testResults.sampleError || 'None'}</div>
          <div>Alumni Error: {testResults.alumniError || 'None'}</div>
        </div>
      )}
      
      <button 
        onClick={testConnection}
        style={{
          marginTop: '5px',
          padding: '2px 6px',
          fontSize: '10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Retest
      </button>
    </div>
  );
}

export default DatabaseTest;
