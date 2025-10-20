import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';
import './Dashboard.css';
import supabase from '../supabaseClient';

function Dashboard() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Debug: Log when userProfile changes
  useEffect(() => {
    console.log('Dashboard: userProfile changed:', userProfile);
  }, [userProfile]);
  
  // Debug: Log when component renders
  console.log('Dashboard: Component rendered with userProfile:', userProfile);
  console.log('🚀 DASHBOARD COMPONENT IS RENDERING! 🚀');
  
  // State declarations - moved before early returns
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);
  
  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="dashboard-container">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not authenticated, we'll be redirected before reaching here
  if (!user) return null;
  
  // User data state
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    graduationYear: '',
    schoolName: '',
    schoolState: '',
    schoolCity: '',
    schoolLevel: '',
    currentPosition: '',
    currentCompany: '',
    bio: '',
    profilePicture: null,
    alumniId: '',
    fieldOfStudy: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }
  });
  
  // Debug: Log current user data after state declaration
  console.log('📊 CURRENT USER DATA:', userData);
  
  // Form state for editing profile
  const [editForm, setEditForm] = useState({...userData});
  
  // Update editForm when userData changes
  useEffect(() => {
    console.log('🔄 Updating editForm with userData:', userData);
    setEditForm({...userData});
  }, [userData]);
  
  // Personal metrics and activities
  const [personalMetrics, setPersonalMetrics] = useState({
    profileViews: 0,
    connections: 0,
    eventsAttended: 0,
    messagesReceived: 0,
    profileCompleteness: 0
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'New connection', description: 'Connected with Jane Smith', time: '2 hours ago', icon: '🤝' },
    { id: 2, type: 'Event notification', description: 'Upcoming alumni reunion on Dec 15', time: '1 day ago', icon: '📅' },
    { id: 3, type: 'Message received', description: 'New message from your school admin', time: '3 days ago', icon: '💬' },
    { id: 4, type: 'Profile update', description: 'Your profile was viewed by 5 alumni', time: '1 week ago', icon: '👁️' },
    { id: 5, type: 'Achievement', description: 'Profile 100% complete!', time: '1 week ago', icon: '🏆' },
    { id: 6, type: 'School news', description: 'New article about your alma mater', time: '2 weeks ago', icon: '📰' }
  ]);

  const [schoolNews, setSchoolNews] = useState([
    { id: 1, title: 'XYZ University Ranked Top 5 in Nigeria', date: 'Nov 10, 2023', excerpt: 'Our alma mater continues to excel in national rankings...' },
    { id: 2, title: 'Annual Alumni Fund Raises N50 Million', date: 'Oct 28, 2023', excerpt: 'Thanks to generous donations from alumni...' },
    { id: 3, title: 'New Engineering Building Under Construction', date: 'Oct 15, 2023', excerpt: 'The university breaks ground on a state-of-the-art facility...' }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    { id: 1, title: '2023 Alumni Reunion', date: 'Dec 15, 2023', location: 'XYZ University Campus', time: '10:00 AM - 6:00 PM' },
    { id: 2, title: 'Career Networking Session', date: 'Nov 25, 2023', location: 'Virtual (Zoom)', time: '3:00 PM - 5:00 PM' },
    { id: 3, title: 'Fundraising Gala Dinner', date: 'Jan 20, 2024', location: 'Eko Hotel & Suites, Lagos', time: '7:00 PM - 11:00 PM' }
  ]);
  
  // Fetch user data from Supabase
  useEffect(() => {
    console.log('Dashboard useEffect triggered with userProfile:', userProfile);
    console.log('🔥 DASHBOARD USEEFFECT IS RUNNING! 🔥');
    
    const fetchUserData = async () => {
      try {
        // Use the userProfile.alumni_id to fetch the correct alumni data
        if (!userProfile?.alumni_id) {
          console.log('No alumni_id found in userProfile:', userProfile);
          setLoading(false);
          return;
        }
        
        console.log('Fetching alumni data for alumni_id:', userProfile.alumni_id);
        console.log('Exact alumni_id value:', JSON.stringify(userProfile.alumni_id));
        console.log('Type of alumni_id:', typeof userProfile.alumni_id);
        
        const { data: alumniData, error: alumniError } = await supabase
          .from('alumni')
          .select('*')
          .eq('id', userProfile.alumni_id)
          .single();
        
        console.log('Alumni data result:', alumniData);
        console.log('Alumni error:', alumniError);
        
        if (alumniError) {
          console.error('Error fetching alumni data:', alumniError);
          // If there's no alumni data, use userProfile data as fallback
          setUserData({
            fullName: user?.user_metadata?.fullName || 'User',
            email: user?.email || '',
            phoneNumber: '',
            graduationYear: '',
            schoolName: '',
            schoolState: '',
            schoolLGA: '',
            schoolLevel: '',
            currentPosition: '',
            currentCompany: '',
            bio: '',
            profilePicture: null,
            alumniId: userProfile?.alumni_id || '',
            fieldOfStudy: '',
            socialLinks: {
              linkedin: '',
              twitter: '',
              facebook: ''
            }
          });
        } else {
          // Fetch school data for this alumni
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('*')
            .eq('id', alumniData.school_id)
            .single();
          
          if (schoolError) {
            console.error('Error fetching school data:', schoolError);
          }
          
          const newUserData = {
            fullName: alumniData.full_name || '',
            email: alumniData.email || user?.email || '',
            phoneNumber: alumniData.phone_number || '',
            graduationYear: alumniData.graduation_year || '',
            schoolName: schoolData?.name || '',
            schoolState: schoolData?.state || '',
            schoolCity: schoolData?.lga || '',
            schoolLevel: schoolData?.level || '',
            currentPosition: alumniData.current_position || '',
            currentCompany: alumniData.current_company || '',
            bio: alumniData.bio || '',
            profilePicture: alumniData.profile_picture || null,
            alumniId: alumniData.id || userProfile.alumni_id || '',
            fieldOfStudy: alumniData.field_of_study || '',
            socialLinks: {
              linkedin: alumniData.linkedin || '',
              twitter: alumniData.twitter || '',
              facebook: alumniData.facebook || ''
            }
          };
          
          console.log('🎯 SETTING USER DATA:', newUserData);
          setUserData(newUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userProfile]);

  // Handle form changes during editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects like socialLinks
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setEditForm(prev => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: value
        }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle save changes during editing
  const handleSaveChanges = () => {
    setShowSaveConfirm(true);
  };

  // Confirm save changes
  const confirmSaveChanges = async () => {
    setShowSaveConfirm(false);
    try {
      // Find the alumni record by name (in a real app, we would use user ID from auth)
      const { data: alumniRecords, error: findError } = await supabase
        .from('alumni')
        .select('id')
        .eq('full_name', editForm.fullName)
        .limit(1)
        .single();
      
      if (findError && findError.code !== 'PGRST116') {
        throw new Error('Error finding alumni record: ' + findError.message);
      }
      
      if (alumniRecords) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('alumni')
          .update({
            phone_number: editForm.phoneNumber,
            email: editForm.email,
            current_position: editForm.currentPosition,
            current_company: editForm.currentCompany,
            bio: editForm.bio,
            linkedin: editForm.socialLinks.linkedin,
            twitter: editForm.socialLinks.twitter,
            facebook: editForm.socialLinks.facebook
            // Add more fields to update as needed
          })
          .eq('id', alumniRecords.id);
        
        if (updateError) {
          throw new Error('Error updating alumni record: ' + updateError.message);
        }
        
        console.log('Profile updated successfully');
        
        // Update userData with the saved changes
        setUserData(editForm);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile changes:', error);
      alert('Failed to save changes: ' + error.message);
    }
  };
  
  // Handle cancel editing
  const handleCancelEdit = () => {
    setShowCancelConfirm(true);
  };

  // Confirm cancel editing
  const confirmCancelEdit = () => {
    setShowCancelConfirm(false);
    setEditForm({...userData});
    setIsEditing(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <div className="alumni-id">
          <strong>Alumni ID:</strong> {userData.alumniId}
        </div>
      </div>
      
      <div className="dashboard-content">
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <ul className="nav-links">
            <li 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <span className="icon">👤</span>
              <span>My Profile</span>
            </li>
            <li 
              className={activeTab === 'connections' ? 'active' : ''}
              onClick={() => setActiveTab('connections')}
            >
              <span className="icon">🤝</span>
              <span>Connections</span>
            </li>
            <li 
              className={activeTab === 'events' ? 'active' : ''}
              onClick={() => setActiveTab('events')}
            >
              <span className="icon">📅</span>
              <span>Events</span>
            </li>
            <li 
              className={activeTab === 'school' ? 'active' : ''}
              onClick={() => setActiveTab('school')}
            >
              <span className="icon">🏫</span>
              <span>My School</span>
            </li>
            <li 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <span className="icon">⚙️</span>
              <span>Settings</span>
            </li>
          </ul>
        </div>
        
        {/* Main Content Area */}
        <div className="main-content">
          {/* Personal Metrics Overview */}
          <div className="metrics-overview">
            <div className="metric-card">
              <div className="metric-icon">👁️</div>
              <div className="metric-content">
                <div className="metric-value">{personalMetrics.profileViews}</div>
                <div className="metric-label">Profile Views</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🤝</div>
              <div className="metric-content">
                <div className="metric-value">{personalMetrics.connections}</div>
                <div className="metric-label">Connections</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📅</div>
              <div className="metric-content">
                <div className="metric-value">{personalMetrics.eventsAttended}</div>
                <div className="metric-label">Events Attended</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💬</div>
              <div className="metric-content">
                <div className="metric-value">{personalMetrics.messagesReceived}</div>
                <div className="metric-label">Messages</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{personalMetrics.profileCompleteness}%</div>
                <div className="metric-label">Profile Complete</div>
              </div>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>My Profile</h2>
                {!isEditing && (
                  <button 
                    className="btn-secondary edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="profile-edit-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <PhoneInput
                        name="phoneNumber"
                        value={editForm.phoneNumber}
                        onChange={handleEditChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Graduation Year</label>
                      <input
                        type="text"
                        name="graduationYear"
                        value={editForm.graduationYear}
                        onChange={handleEditChange}
                        maxLength="4"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Current Position</label>
                      <input
                        type="text"
                        name="currentPosition"
                        value={editForm.currentPosition}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Company</label>
                      <input
                        type="text"
                        name="currentCompany"
                        value={editForm.currentCompany}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>Bio</label>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      rows="4"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>LinkedIn</label>
                      <input
                        type="text"
                        name="socialLinks.linkedin"
                        value={editForm.socialLinks.linkedin}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Twitter</label>
                      <input
                        type="text"
                        name="socialLinks.twitter"
                        value={editForm.socialLinks.twitter}
                        onChange={handleEditChange}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button className="btn-primary" onClick={handleSaveChanges}>Save Changes</button>
                    <button className="btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                  
                  {/* Save Confirmation Dialog */}
                  {showSaveConfirm && (
                    <div className="confirmation-overlay">
                      <div className="confirmation-dialog">
                        <h3>Save Changes</h3>
                        <p>Are you sure you want to save these changes to your profile?</p>
                        <div className="confirmation-actions">
                          <button className="btn-primary" onClick={confirmSaveChanges}>
                            Yes, Save
                          </button>
                          <button className="btn-secondary" onClick={() => setShowSaveConfirm(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Cancel Confirmation Dialog */}
                  {showCancelConfirm && (
                    <div className="confirmation-overlay">
                      <div className="confirmation-dialog">
                        <h3>Discard Changes</h3>
                        <p>Are you sure you want to discard your changes? All unsaved changes will be lost.</p>
                        <div className="confirmation-actions">
                          <button className="btn-danger" onClick={confirmCancelEdit}>
                            Yes, Discard
                          </button>
                          <button className="btn-secondary" onClick={() => setShowCancelConfirm(false)}>
                            Keep Editing
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="profile-display">
                  <div className="profile-info">
                    <div className="profile-header">
                      <div className="profile-picture">
                        {userData.profilePicture ? (
                          <img src={userData.profilePicture} alt="Profile" />
                        ) : (
                          <div className="default-profile-pic">
                            {userData.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="profile-basic-info">
                        <h3>{userData.fullName}</h3>
                        <p className="current-position">{userData.currentPosition} at {userData.currentCompany}</p>
                      </div>
                    </div>
                    
                    <div className="profile-details">
                      <div className="detail-row">
                        <div className="detail-group">
                          <strong>Email:</strong>
                          <span>{userData.email}</span>
                        </div>
                        <div className="detail-group">
                          <strong>Phone:</strong>
                          <span>{userData.phoneNumber}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-group">
                          <strong>School:</strong>
                          <span>{userData.schoolName}</span>
                        </div>
                        <div className="detail-group">
                          <strong>Graduation Year:</strong>
                          <span>{userData.graduationYear}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-group">
                          <strong>State:</strong>
                          <span>{userData.schoolState}</span>
                        </div>
                        <div className="detail-group">
                          <strong>City:</strong>
                          <span>{userData.schoolCity}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-group full-width">
                          <strong>Bio:</strong>
                          <p>{userData.bio}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Connections Tab */}
          {activeTab === 'connections' && (
            <div className="connections-section">
              <div className="section-header">
                <h2>My Connections</h2>
                <button className="btn-secondary">Connect with Alumni</button>
              </div>
              
              <div className="connections-content">
                <p>Coming soon! This feature will allow you to connect with fellow alumni from your school and other institutions.</p>
              </div>
            </div>
          )}
          
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="events-section">
              <div className="section-header">
                <h2>Upcoming Events</h2>
                <button className="btn-secondary">View All Events</button>
              </div>
              
              <div className="events-list">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-date">
                      <div className="event-day">{new Date(event.date).getDate()}</div>
                      <div className="event-month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                    </div>
                    <div className="event-details">
                      <h3>{event.title}</h3>
                      <div className="event-info">
                        <span className="event-location">📍 {event.location}</span>
                        <span className="event-time">⏰ {event.time}</span>
                      </div>
                      <button className="btn-primary btn-small">Register Now</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* School Tab */}
          {activeTab === 'school' && (
            <div className="school-section">
              <div className="section-header">
                <h2>My School: {userData.schoolName}</h2>
                <button className="btn-secondary">Visit School Page</button>
              </div>
              
              <div className="school-content">
                <div className="school-news">
                  <h3>Latest School News</h3>
                  <div className="news-list">
                    {schoolNews.map(news => (
                      <div key={news.id} className="news-item">
                        <h4>{news.title}</h4>
                        <div className="news-date">{news.date}</div>
                        <p>{news.excerpt}</p>
                        <a href="#" className="read-more">Read More</a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <div className="section-header">
                <h2>Settings</h2>
              </div>
              
              <div className="settings-content">
                <p>Coming soon! This section will allow you to manage your account settings, notification preferences, and privacy controls.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Sidebar - Recent Activity */}
        <div className="right-sidebar">
          <div className="activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.icon}
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;