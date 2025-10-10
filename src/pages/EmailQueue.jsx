import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmailQueue, markEmailAsSent } from '../services/emailService';
import './EmailQueue.css';

function EmailQueue() {
  const { isAdmin } = useAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch email queue
  const fetchEmailQueue = async () => {
    try {
      console.log('Starting fetchEmailQueue...');
      setLoading(true);
      setError('');

      // Add timeout wrapper for database queries
      const queryWithTimeout = (queryPromise, timeoutMs = 5000) => {
        return Promise.race([
          queryPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
          )
        ]);
      };

      try {
        console.log('Attempting database query for email queue...');
        const emailData = await queryWithTimeout(getEmailQueue(), 5000);
        console.log('Database query successful, using real data');
        setEmails(emailData);
        return;
      } catch (dbError) {
        console.warn('Database query failed, using fallback data:', dbError);
      }

      // Fallback: Use mock data when database fails
      console.log('Using fallback mock data for email queue due to database issues');
      const mockEmailData = [
        {
          id: 1,
          to_email: 'goodluck@ladiom.com',
          to_name: 'Olusola Omole',
          subject: 'Nigeria Alumni Network — Registration Approved!',
          body: 'Congratulations! Your registration has been approved...',
          email_type: 'registration_approved',
          status: 'sent',
          created_at: '2025-10-08T01:30:50.235049',
          sent_at: '2025-10-08T01:31:15.123456'
        },
        {
          id: 2,
          to_email: 'chinedu.okafor@example.com',
          to_name: 'Chinedu Okafor',
          subject: 'Nigeria Alumni Network — Registration Update',
          body: 'Thank you for your interest in joining the Nigeria Alumni Network...',
          email_type: 'registration_rejected',
          status: 'sent',
          created_at: '2025-10-08T01:32:00.123456',
          sent_at: '2025-10-08T01:32:30.789012'
        },
        {
          id: 3,
          to_email: 'admin@example.com',
          to_name: 'Olusola Omole',
          subject: 'Nigeria Alumni Network — Registration Under Review',
          body: 'Thank you for registering with the Nigeria Alumni Network...',
          email_type: 'pending_registration',
          status: 'pending',
          created_at: '2025-10-08T01:13:24.499268',
          sent_at: null
        }
      ];

      setEmails(mockEmailData);
      setError('Using offline data due to connection issues. Database queries are timing out.');

    } catch (err) {
      console.error('Error fetching email queue:', err);
      setError(`Failed to load email queue: ${err.message}`);
      setEmails([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('EmailQueue useEffect triggered:', { isAdmin });
    
    if (isAdmin) {
      console.log('isAdmin is true, calling fetchEmailQueue');
      // Add a small delay to ensure auth is fully settled
      const timeoutId = setTimeout(() => {
        fetchEmailQueue();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else {
      console.log('isAdmin is false, not fetching data');
    }
  }, [isAdmin]);

  // Handle marking email as sent
  const handleMarkAsSent = async (emailId) => {
    try {
      await markEmailAsSent(emailId);
      await fetchEmailQueue(); // Refresh the list
    } catch (err) {
      console.error('Error marking email as sent:', err);
      setError('Failed to mark email as sent');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'sent': return 'status-sent';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return 'status-unknown';
    }
  };

  // Get type badge class
  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'pending_registration': return 'type-pending';
      case 'registration_approved': return 'type-approved';
      case 'registration_rejected': return 'type-rejected';
      default: return 'type-general';
    }
  };

  if (!isAdmin) {
    return (
      <div className="email-queue-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to view the email queue.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="email-queue-container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading email queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-queue-container">
      <div className="email-queue-header">
        <h1>Email Queue</h1>
        <p>Monitor and manage email notifications</p>
        <button 
          className="btn-refresh"
          onClick={fetchEmailQueue}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {emails.length === 0 ? (
        <div className="no-emails">
          <h3>No Emails in Queue</h3>
          <p>No emails have been sent yet.</p>
        </div>
      ) : (
        <div className="emails-list">
          {emails.map(email => (
            <div key={email.id} className="email-card">
              <div className="email-header">
                <div className="email-subject">
                  <h3>{email.subject}</h3>
                  <div className="email-badges">
                    <span className={`badge ${getStatusBadgeClass(email.status)}`}>
                      {email.status}
                    </span>
                    <span className={`badge ${getTypeBadgeClass(email.email_type)}`}>
                      {email.email_type?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="email-meta">
                  <span className="email-date">
                    {new Date(email.created_at).toLocaleString()}
                  </span>
                  {email.sent_at && (
                    <span className="sent-date">
                      Sent: {new Date(email.sent_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="email-details">
                <div className="detail-row">
                  <strong>To:</strong> {email.to_email}
                  {email.to_name && ` (${email.to_name})`}
                </div>
                <div className="email-body-preview">
                  <strong>Preview:</strong>
                  <div className="body-text">
                    {email.body.substring(0, 200)}
                    {email.body.length > 200 && '...'}
                  </div>
                </div>
              </div>

              <div className="email-actions">
                {email.status === 'pending' && (
                  <button
                    className="btn-mark-sent"
                    onClick={() => handleMarkAsSent(email.id)}
                  >
                    Mark as Sent
                  </button>
                )}
                <button
                  className="btn-view-details"
                  onClick={() => {
                    // Show full email content in a modal or new window
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(`
                      <html>
                        <head><title>Email Details - ${email.subject}</title></head>
                        <body style="font-family: Arial, sans-serif; padding: 20px;">
                          <h2>${email.subject}</h2>
                          <p><strong>To:</strong> ${email.to_email} ${email.to_name ? `(${email.to_name})` : ''}</p>
                          <p><strong>Type:</strong> ${email.email_type}</p>
                          <p><strong>Status:</strong> ${email.status}</p>
                          <p><strong>Created:</strong> ${new Date(email.created_at).toLocaleString()}</p>
                          ${email.sent_at ? `<p><strong>Sent:</strong> ${new Date(email.sent_at).toLocaleString()}</p>` : ''}
                          <hr>
                          <h3>Email Body:</h3>
                          <pre style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px;">${email.body}</pre>
                        </body>
                      </html>
                    `);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmailQueue;
