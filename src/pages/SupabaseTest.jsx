import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

const SupabaseTest = () => {
  const [status, setStatus] = useState('Loading...');
  const [error, setError] = useState(null);
  const [schools, setSchools] = useState([]);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      urlPrefix: import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL.substring(0, 15) : 'Not set'
    });

    // Test basic connection
    testSupabase();
  }, []);

  const testSupabase = async () => {
    try {
      setStatus('Testing Supabase connection...');
      setError(null);

      // Try a simple request
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .limit(5);

      if (error) {
        setStatus('Connection failed');
        setError(`Error: ${error.message}`);
        console.error('Supabase error:', error);
      } else {
        setStatus('Connected successfully!');
        setSchools(data);
        console.log('Found schools:', data);
      }
    } catch (err) {
      setStatus('Connection exception');
      setError(`Exception: ${err.message}`);
      console.error('Supabase exception:', err);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Supabase Browser Test</h1>
      
      {/* Environment Variables Info */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(envVars, null, 2)}</pre>
      </div>

      {/* Connection Status */}
      <div className={`mb-6 p-4 rounded-lg ${status.includes('success') ? 'bg-green-100' : 'bg-red-100'}`}>
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        <p className={`mb-2 ${status.includes('success') ? 'text-green-700' : 'text-red-700'}`}>{status}</p>
        {error && (
          <div className="text-sm text-red-800 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {schools.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Found {schools.length} Schools</h2>
          <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto whitespace-pre-wrap">
            {JSON.stringify(schools, null, 2)}
          </pre>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h3 className="font-medium mb-2">Debug Tips</h3>
        <p>If connection fails in browser but works in Node.js:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Check if your Supabase project has correct CORS settings</li>
          <li>Verify that RLS policies allow anonymous access</li>
          <li>Look for browser console errors for more details</li>
        </ul>
      </div>
    </div>
  );
};

export default SupabaseTest;