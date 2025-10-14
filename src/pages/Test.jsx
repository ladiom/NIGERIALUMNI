import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

function Test() {
  const [status, setStatus] = useState('Loading...');
  const [supabaseVersion, setSupabaseVersion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Testing React...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStatus('Testing Supabase connection...');
        const { data, error } = await supabase.rpc('version');
        
        if (error) {
          setError(`Supabase error: ${error.message}`);
          setStatus('Connection failed');
        } else {
          setSupabaseVersion(data);
          setStatus('Connection successful!');
        }
      } catch (err) {
        setError(`Unexpected error: ${err.message}`);
        setStatus('Test failed');
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Component</h1>
      <p>Status: {status}</p>
      {supabaseVersion && <p>Supabase Version: {supabaseVersion}</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p>React is {(React ? 'working' : 'not working')}</p>
      <p>Hooks are available: {(useState && useEffect ? 'Yes' : 'No')}</p>
      <p>Environment Variables:</p>
      <ul>
        <li>SUPABASE_URL set: {!!import.meta.env.VITE_SUPABASE_URL ? 'Yes' : 'No'}</li>
        <li>SUPABASE_ANON_KEY set: {!!import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
}

export default Test;