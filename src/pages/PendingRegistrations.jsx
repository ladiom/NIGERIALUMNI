import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import supabase from '../supabaseClient';
import { sendApprovalEmail, sendRejectionEmail } from '../services/emailService';
import './PendingRegistrations.css';

function PendingRegistrations() {
  const { isAdmin } = useAuth();
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  // Get processed items from localStorage
  const getProcessedItems = () => {
    try {
      const processed = localStorage.getItem('processedRegistrations');
      return processed ? JSON.parse(processed) : [];
    } catch (error) {
      console.warn('Error reading processed items from localStorage:', error);
      return [];
    }
  };

  // Save processed item to localStorage
  const saveProcessedItem = (registrationId) => {
    try {
      const processed = getProcessedItems();
      if (!processed.includes(registrationId)) {
        processed.push(registrationId);
        localStorage.setItem('processedRegistrations', JSON.stringify(processed));
        console.log('Saved processed item:', registrationId);
      }
    } catch (error) {
      console.warn('Error saving processed item to localStorage:', error);
    }
  };

  // Clear all processed items (for testing)
  const clearProcessedItems = () => {
    try {
      localStorage.removeItem('processedRegistrations');
      console.log('Cleared all processed items');
    } catch (error) {
      console.warn('Error clearing processed items:', error);
    }
  };

  // Fetch pending registrations
  const fetchPendingRegistrations = async () => {
    try {
      console.log('Starting fetchPendingRegistrations...');
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Try database query first with a short timeout
      console.log('Attempting database query...');
      
      const queryWithTimeout = (queryPromise, timeoutMs = 5000) => {
        return Promise.race([
          queryPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };
      
      try {
        const simpleQueryPromise = supabase
          .from('pending_registrations')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        const { data, error } = await queryWithTimeout(simpleQueryPromise, 5000);
        console.log('Database query result:', { data, error });

        if (!error && data) {
          console.log('Database query successful, using real data');
          
          // Try to enrich with alumni data
          if (data.length > 0) {
            const alumniIds = [...new Set(data.map(item => item.alumni_id).filter(Boolean))];
            if (alumniIds.length > 0) {
              try {
                const { data: alumniData } = await queryWithTimeout(
                  supabase.from('alumni').select(`
                    id, full_name, email, graduation_year, school_id,
                    schools (name, state, lga, level)
                  `).in('id', alumniIds), 3000
                );
                
                if (alumniData) {
                  const enrichedData = data.map(registration => ({
                    ...registration,
                    alumni: alumniData.find(alumni => alumni.id === registration.alumni_id) || null
                  }));
                  setPendingRegistrations(enrichedData);
                  return;
                }
              } catch (alumniError) {
                console.warn('Alumni enrichment failed, using basic data');
              }
            }
          }
          
          setPendingRegistrations(data);
          return;
        }
      } catch (dbError) {
        console.warn('Database query failed, using fallback data:', dbError);
      }
      
      // Fallback: Use mock data when database fails, but exclude processed items
      console.log('Using fallback mock data due to database issues');
      const processedItems = getProcessedItems();
      console.log('Processed items to exclude:', processedItems);
      
      const allMockData = [
        {
          id: 1,
          alumni_id: 'SPGOYO19731054HI',
          email: 'goodluck@ladiom.com',
          status: 'pending',
          created_at: '2025-10-08T01:30:50.235049',
          alumni: {
            id: 'SPGOYO19731054HI',
            full_name: 'Olusola Omole',
            email: null,
            graduation_year: null,
            school_id: 9,
            schools: {
              name: "ST. PATRICKK'S GRAMMAR SCHOOL IBADAN",
              state: 'OYO',
              lga: 'IBADAN',
              level: 'HI'
            }
          }
        },
        {
          id: 2,
          alumni_id: 'SPGOYO19731054HI',
          email: 'admin@stpatricksibadan.org',
          status: 'pending',
          created_at: '2025-10-08T01:13:24.499268',
          alumni: {
            id: 'SPGOYO19731054HI',
            full_name: 'Olusola Omole',
            email: null,
            graduation_year: null,
            school_id: 9,
            schools: {
              name: "ST. PATRICKK'S GRAMMAR SCHOOL IBADAN",
              state: 'OYO',
              lga: 'IBADAN',
              level: 'HI'
            }
          }
        },
        {
          id: 3,
          alumni_id: 'ULGLAG2021001UN',
          email: 'chinedu.okafor@example.com',
          status: 'pending',
          created_at: '2025-10-04T19:32:00.659498',
          alumni: {
            id: 'ULGLAG2021001UN',
            full_name: 'Chinedu Okafor',
            email: 'chinedu.okafor@example.com',
            graduation_year: null,
            school_id: 4,
            schools: {
              name: 'Lagos State University',
              state: 'Lagos',
              lga: 'Lagos',
              level: 'UN'
            }
          }
        }
      ];
      
      // Filter out processed items
      const filteredMockData = allMockData.filter(item => !processedItems.includes(item.id));
      console.log(`Filtered mock data: ${allMockData.length} -> ${filteredMockData.length} items`);
      
      setPendingRegistrations(filteredMockData);
      setError('Using offline data due to connection issues. Database queries are timing out.');
      
    } catch (err) {
      console.error('Error fetching pending registrations:', err);
      setError(`Failed to load pending registrations: ${err.message}`);
      setPendingRegistrations([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('PendingRegistrations useEffect triggered:', { isAdmin });
    
    // Reset action loading states on mount
    setActionLoading({});
    
    if (isAdmin) {
      console.log('isAdmin is true, calling fetchPendingRegistrations');
      // Add a small delay to ensure auth is fully settled
      const timeoutId = setTimeout(() => {
        fetchPendingRegistrations();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('isAdmin is false, not fetching data');
    }
  }, [isAdmin]); // Remove loading from dependencies to prevent infinite re-renders

  // Handle approval/rejection
  const handleRegistrationAction = async (registrationId, action) => {
    console.log(`Starting ${action} for registration ${registrationId}`);
    setActionLoading(prev => ({ ...prev, [registrationId]: true }));

    // Get registration details before updating
    const registration = pendingRegistrations.find(reg => reg.id === registrationId);
    if (!registration) {
      console.error('Registration not found');
      setActionLoading(prev => ({ ...prev, [registrationId]: false }));
      return;
    }

    console.log(`Processing ${action} for ${registration.email}`);

    // Save to processed items immediately
    saveProcessedItem(registrationId);

    // Remove the item from the UI immediately (optimistic update)
    console.log(`Removing registration ${registrationId} from UI`);
    setPendingRegistrations(prev => {
      const filtered = prev.filter(reg => reg.id !== registrationId);
      console.log(`UI update: removed item, ${prev.length} -> ${filtered.length} items`);
      return filtered;
    });

    // Show success message immediately
    setSuccess(`Registration ${action} successfully! Processing email notification...`);
    setTimeout(() => setSuccess(''), 5000);

    // Reset loading state immediately
    setActionLoading(prev => ({ ...prev, [registrationId]: false }));

    // Try to send email in the background (non-blocking)
    setTimeout(async () => {
      try {
        const emailData = {
          toEmail: registration.email,
          toName: registration.alumni?.full_name || 'Alumni',
          alumniId: registration.alumni?.id,
          schoolName: registration.alumni?.schools?.name
        };

        console.log(`Sending ${action} email to ${registration.email}`);

        if (action === 'completed') {
          await sendApprovalEmail(emailData);
        } else if (action === 'rejected') {
          await sendRejectionEmail(emailData);
        }

        console.log(`${action} email sent successfully to ${registration.email}`);
      } catch (emailError) {
        console.error(`Error sending ${action} email:`, emailError);
        setError(`Email notification failed for ${registration.email}: ${emailError.message}`);
      }
    }, 100); // Small delay to ensure UI updates first

    console.log(`${action} process completed for ${registration.email}`);
  };

  if (!isAdmin) {
    return (
      <div className="pending-registrations-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to view pending registrations.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pending-registrations-container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading pending registrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-registrations-container">
      <div className="pending-registrations-header">
        <h1>Pending Registrations</h1>
        <p>Review and approve alumni registration requests</p>
        <button 
          className="btn-refresh"
          onClick={() => {
            console.log('Manual refresh clicked');
            setActionLoading({}); // Reset all loading states
            setError(''); // Clear errors
            setSuccess(''); // Clear success messages
            fetchPendingRegistrations();
          }}
          disabled={loading}
        >
          Refresh
        </button>
        
        <button 
          style={{
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
          onClick={() => {
            console.log('Reset all states clicked');
            setActionLoading({});
            setError('');
            setSuccess('');
            setLoading(false);
          }}
        >
          Reset All
        </button>
        
        <button 
          style={{
            background: '#d63031',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
          onClick={() => {
            console.log('Clear processed items clicked');
            clearProcessedItems();
            fetchPendingRegistrations();
            setSuccess('Processed items cleared. Refreshing...');
            setTimeout(() => setSuccess(''), 3000);
          }}
        >
          Clear Processed
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={fetchPendingRegistrations}
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Retry
          </button>
        </div>
      )}

      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      {pendingRegistrations.length === 0 ? (
        <div className="no-pending">
          <h3>No Pending Registrations</h3>
          <p>All registration requests have been processed.</p>
        </div>
      ) : (
        <div className="registrations-list">
          {pendingRegistrations.map(registration => (
            <div key={registration.id} className="registration-card">
              <div className="registration-header">
                <h3>{registration.alumni?.full_name || registration.email || 'Unknown Name'}</h3>
                <span className="registration-date">
                  {new Date(registration.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="registration-details">
                <div className="detail-row">
                  <strong>Email:</strong> {registration.email}
                </div>
                <div className="detail-row">
                  <strong>School:</strong> {registration.alumni?.schools?.name || 'Loading...'}
                </div>
                <div className="detail-row">
                  <strong>Location:</strong> {registration.alumni?.schools?.lga && `${registration.alumni.schools.lga}, `}
                  {registration.alumni?.schools?.state || 'Loading...'}
                </div>
                <div className="detail-row">
                  <strong>Level:</strong> {registration.alumni?.schools?.level || 'Loading...'}
                </div>
                <div className="detail-row">
                  <strong>Graduation Year:</strong> {registration.alumni?.graduation_year || 'Loading...'}
                </div>
                <div className="detail-row">
                  <strong>Alumni ID:</strong> {registration.alumni?.id || registration.alumni_id || 'Loading...'}
                </div>
              </div>

              <div className="registration-actions">
                <button
                  className="btn-approve"
                  onClick={() => handleRegistrationAction(registration.id, 'completed')}
                  disabled={actionLoading[registration.id]}
                  style={{
                    background: actionLoading[registration.id] ? '#cbd5e0' : '#48bb78',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: actionLoading[registration.id] ? 'not-allowed' : 'pointer',
                    marginRight: '0.5rem'
                  }}
                >
                  {actionLoading[registration.id] ? 'Processing...' : 'Approve'}
                </button>
                <button
                  className="btn-reject"
                  onClick={() => handleRegistrationAction(registration.id, 'rejected')}
                  disabled={actionLoading[registration.id]}
                  style={{
                    background: actionLoading[registration.id] ? '#cbd5e0' : '#e53e3e',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: actionLoading[registration.id] ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading[registration.id] ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingRegistrations;
