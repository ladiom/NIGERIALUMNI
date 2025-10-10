import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const DebugSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [queryDetails, setQueryDetails] = useState('');
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('lagos');
  const [searchField, setSearchField] = useState('state'); // 'state' or 'name'

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  // Handle manual search
  const handleSearch = async () => {
    addLog(`Starting manual search for ${searchTerm} in ${searchField}...`);
    try {
      setLoading(true);
      setError(null);
      
      // Use a dynamic query based on selected field
      const query = `SELECT * FROM schools WHERE ${searchField} ILIKE %${searchTerm}%`;
      setQueryDetails(`Executing query: ${query}`);
      addLog(`Executing query: ${query}`);
      
      addLog(`Attempting to call supabase.from("schools").select("*").ilike("${searchField}", "%${searchTerm}%")`);
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .ilike(searchField, `%${searchTerm}%`);
      
      addLog('Query complete');
      addLog(`Query data count: ${data ? data.length : 0}`);
      addLog(`Query error: ${JSON.stringify(error)}`);
      
      if (error) {
        addLog(`Search failed: ${error.message}`, 'error');
        throw error;
      }
      
      setSchools(data);
      addLog(`Found ${data.length} schools matching "${searchTerm}" in ${searchField}`, 'success');
    } catch (err) {
      addLog(`Search exception: ${err.message}`, 'error');
      setError(`Search error: ${err.message}`);
    } finally {
      setLoading(false);
      addLog('Search operation complete');
    }
  };

  // Connection test effect
  useEffect(() => {
    addLog('DebugSchools component mounted');
    addLog(`VITE_SUPABASE_URL is set: ${!!import.meta.env.VITE_SUPABASE_URL}`);
    addLog(`VITE_SUPABASE_ANON_KEY is set: ${!!import.meta.env.VITE_SUPABASE_ANON_KEY}`);
    addLog(`URL value starts with: ${import.meta.env.VITE_SUPABASE_URL ? import.meta.env.VITE_SUPABASE_URL.substring(0, 15) : 'Not set'}`);
    
    const testConnection = async () => {
      addLog('Starting connection test...');
      try {
        // Check if we can connect to Supabase
        addLog('Attempting to call supabase.rpc("version")');
        const { data, error } = await supabase.rpc('version');
        
        addLog('RPC call complete');
        addLog(`RPC data: ${JSON.stringify(data)}`);
        addLog(`RPC error: ${JSON.stringify(error)}`);
        
        if (error) {
          addLog(`Connection failed: ${error.message}`, 'error');
          setConnectionStatus(`Connection failed: ${error.message}`);
        } else {
          addLog('Connection successful!', 'success');
          setConnectionStatus('Connected to Supabase successfully!');
          // If connected, search with the default term
          handleSearch();
        }
      } catch (err) {
        addLog(`Connection exception: ${err.message}`, 'error');
        setConnectionStatus(`Connection error: ${err.message}`);
        setLoading(false);
      }
    };

    testConnection();
  }, [handleSearch]);


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">School Search Debug Tool</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-100">
        <h2 className="text-lg font-semibold mb-2">Supabase Connection Status</h2>
        <p className={`mb-2 ${connectionStatus.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {connectionStatus}
        </p>
        <div className="text-sm text-gray-600">
          <p>URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}</p>
          <p>URL Value: {import.meta.env.VITE_SUPABASE_URL ? 'https://... (masked)' : 'Not set'}</p>
          <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (masked)' : 'Not set'}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">School Search</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Term</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter search term (e.g., lagos, university)"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Field</label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="state">State</option>
              <option value="name">School Name</option>
              <option value="city">City</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">{queryDetails}</p>
      </div>
      
      {/* Search Execution */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Search for "Lagos" Schools</h2>
        
        {loading ? (
          <p className="p-4 bg-blue-50 text-blue-800 rounded-lg">Loading schools...</p>
        ) : error ? (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg">
            <p><strong>Error:</strong> {error}</p>
          </div>
        ) : (
          <div>
            <p className="mb-4">{queryDetails}</p>
            
            <div className="p-4 bg-green-50 text-green-800 rounded-lg mb-4">
              Found <strong>{schools.length}</strong> school{schools.length !== 1 ? 's' : ''} in Lagos
            </div>
            
            {schools.length > 0 && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-md font-semibold mb-3">School Details:</h3>
                <ul className="space-y-3">
                  {schools.map((school) => (
                    <li key={school.id} className="p-3 bg-white rounded-md border border-gray-100">
                      <div className="font-medium">{school.name}</div>
                      <div className="text-sm text-gray-600">State: {school.state}</div>
                      <div className="text-sm text-gray-600">ID: {school.id}</div>
                      <div className="text-sm text-gray-600">Code: {school.school_code}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Debug Logs */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Debug Logs</h2>
        <div className="max-h-80 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50">
          {logs.map((log, index) => (
            <div key={index} className={`text-sm mb-1 ${log.type === 'error' ? 'text-red-600' : log.type === 'success' ? 'text-green-600' : 'text-gray-700'}`}>
              {new Date(log.timestamp).toLocaleTimeString()}: {log.message}
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h3 className="font-medium mb-2">Debug Information</h3>
        <p>If you're not seeing results, check:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Your Supabase database has schools with state "Lagos"</li>
          <li>The .env file has the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
          <li>The database table name is "schools" and has the expected columns</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugSchools;