import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './AlumniProfile.css';

function AlumniProfile() {
  const { alumniId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('about');
  const [isConnected, setIsConnected] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  const [alumniData, setAlumniData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        setLoading(true);
        console.log('Fetching alumni data for ID:', alumniId);
        
        const { data, error } = await supabase
          .from('alumni')
          .select(`
            *,
            school:schools(name, state, lga, level)
          `)
          .eq('id', alumniId)
          .single();
        
        if (error) {
          console.error('Error fetching alumni data:', error);
          setError('Failed to load alumni profile');
          return;
        }
        
        if (data) {
          console.log('Alumni data fetched:', data);
          setAlumniData(data);
        } else {
          setError('Alumni profile not found');
        }
      } catch (err) {
        console.error('Error in fetchAlumniData:', err);
        setError('Failed to load alumni profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (alumniId) {
      fetchAlumniData();
    } else {
      setError('No alumni ID provided');
      setLoading(false);
    }
  }, [alumniId]);
  
  if (loading) {
    return (
      <div className="alumni-profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading alumni profile...</p>
        </div>
      </div>
    );
  }
  
  if (error || !alumniData) {
    return (
      <div className="alumni-profile-container">
        <div className="error-container">
          <h2>Profile Not Found</h2>
          <p>{error || 'This alumni profile could not be found.'}</p>
          <button onClick={() => navigate('/home')} className="btn-primary">
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Transform the database data to match the expected format
  const transformedData = {
    id: alumniData.id,
    admissionNum: alumniData.admission_num || 'N/A',
    admissionDate: alumniData.admission_date ? new Date(alumniData.admission_date).toLocaleDateString('en-GB') : 'N/A',
    name: alumniData.full_name || 'N/A',
    dateOfBirth: alumniData.date_of_birth ? new Date(alumniData.date_of_birth).toLocaleDateString('en-GB') : 'N/A',
    sex: alumniData.sex || 'N/A',
    phoneNumber: alumniData.phone_number || 'N/A',
    email: alumniData.email || 'N/A',
    schoolName: alumniData.school?.name || 'N/A',
    schoolState: alumniData.school?.state || 'N/A',
    schoolLGA: alumniData.school?.lga || 'N/A',
    schoolLevel: alumniData.school?.level || 'N/A',
    graduationYear: alumniData.graduation_year?.toString() || 'N/A',
    graduationDate: alumniData.graduation_date ? new Date(alumniData.graduation_date).toLocaleDateString('en-GB') : 'N/A',
    fieldOfStudy: alumniData.field_of_study || 'N/A',
    currentPosition: alumniData.current_position || 'N/A',
    currentCompany: alumniData.current_company || 'N/A',
    parentGuardianNames: alumniData.parent_guardian_names || 'N/A',
    addressAtSchool: alumniData.address_at_school || 'N/A',
    lastSchoolAttended: alumniData.last_school_attended || 'N/A',
    bio: alumniData.bio || 'No bio available',
    skills: alumniData.skills ? alumniData.skills.split(',').map(s => s.trim()) : [],
    achievements: alumniData.achievements ? alumniData.achievements.split(',').map(a => a.trim()) : [],
    education: [
      {
        degree: alumniData.field_of_study || 'N/A',
        institution: alumniData.school?.name || 'N/A',
        year: alumniData.graduation_year ? `${alumniData.graduation_year - 4} - ${alumniData.graduation_year}` : 'N/A',
        description: `Graduated from ${alumniData.school?.name || 'N/A'} in ${alumniData.graduation_year || 'N/A'}.`
      }
    ],
    experience: [
      {
        position: alumniData.current_position || 'N/A',
        company: alumniData.current_company || 'N/A',
        year: 'Present',
        description: alumniData.bio || 'No experience details available'
      }
    ],
    profilePicture: alumniData.profile_picture || 'https://randomuser.me/api/portraits/men/32.jpg',
    socialLinks: {
      linkedin: alumniData.linkedin || '',
      twitter: alumniData.twitter || '',
      facebook: alumniData.facebook || ''
    },
    volunteering: [],
    interests: []
  };
  
  // Handle send message
  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to the alumni
      console.log('Message sent to alumni:', message);
      setMessage('');
      setShowMessageForm(false);
    }
  };
  
  // Handle connect/disconnect
  const handleConnect = () => {
    setIsConnected(!isConnected);
    // In a real app, this would make an API call to update the connection status
    console.log(isConnected ? 'Disconnected from alumni' : 'Connected to alumni');
  };

  return (
    <div className="alumni-profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-image-container">
          <div className="profile-image">
            <img src={transformedData.profilePicture} alt={transformedData.name} />
          </div>
          <div className="alumni-badge">
            <span>Alumni</span>
          </div>
        </div>
        
        <div className="profile-info">
          <div className="profile-name-section">
            <h1>{transformedData.name}</h1>
            <div className="alumni-id">{transformedData.id}</div>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Admission Number:</span>
              <span className="detail-value">{transformedData.admissionNum}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Admission Date:</span>
              <span className="detail-value">{transformedData.admissionDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">School:</span>
              <span className="detail-value">{transformedData.schoolName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{transformedData.schoolState}, {transformedData.schoolLGA}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Level:</span>
              <span className="detail-value">{transformedData.schoolLevel}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Graduation Year:</span>
              <span className="detail-value">{transformedData.graduationYear}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className={`btn-primary ${isConnected ? 'connected' : ''}`}
              onClick={handleConnect}
            >
              {isConnected ? '✓ Connected' : '+ Connect'}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowMessageForm(true)}
            >
              💬 Message
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`tab ${activeTab === 'education' ? 'active' : ''}`}
            onClick={() => setActiveTab('education')}
          >
            Education
          </button>
          <button 
            className={`tab ${activeTab === 'experience' ? 'active' : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
          <button 
            className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="profile-content">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="tab-panel">
            <h3>About {transformedData.name}</h3>
            <p className="bio">{transformedData.bio}</p>
            
            <div className="info-grid">
              <div className="info-section">
                <h4>Personal Information</h4>
                <div className="info-item">
                  <span className="label">Date of Birth:</span>
                  <span className="value">{transformedData.dateOfBirth}</span>
                </div>
                <div className="info-item">
                  <span className="label">Gender:</span>
                  <span className="value">{transformedData.sex}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{transformedData.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{transformedData.email}</span>
                </div>
              </div>
              
              <div className="info-section">
                <h4>Academic Information</h4>
                <div className="info-item">
                  <span className="label">Field of Study:</span>
                  <span className="value">{transformedData.fieldOfStudy}</span>
                </div>
                <div className="info-item">
                  <span className="label">Graduation Date:</span>
                  <span className="value">{transformedData.graduationDate}</span>
                </div>
                <div className="info-item">
                  <span className="label">Parent/Guardian:</span>
                  <span className="value">{transformedData.parentGuardianNames}</span>
                </div>
                <div className="info-item">
                  <span className="label">Address at School:</span>
                  <span className="value">{transformedData.addressAtSchool}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="tab-panel">
            <h3>Education</h3>
            {transformedData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <h4>{edu.degree}</h4>
                <div className="education-details">
                  <span className="institution">{edu.institution}</span>
                  <span className="year">{edu.year}</span>
                </div>
                <p className="description">{edu.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="tab-panel">
            <h3>Professional Experience</h3>
            {transformedData.experience.map((exp, index) => (
              <div key={index} className="experience-item">
                <h4>{exp.position}</h4>
                <div className="experience-details">
                  <span className="company">{exp.company}</span>
                  <span className="year">{exp.year}</span>
                </div>
                <p className="description">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="tab-panel">
            <h3>Achievements & Skills</h3>
            {transformedData.achievements.length > 0 && (
              <div className="achievements-section">
                <h4>Achievements</h4>
                <ul className="achievements-list">
                  {transformedData.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {transformedData.skills.length > 0 && (
              <div className="skills-section">
                <h4>Skills</h4>
                <div className="skills-grid">
                  {transformedData.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="tab-panel">
            <h3>Contact Information</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <span className="contact-value">{transformedData.email}</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Phone:</span>
                <span className="contact-value">{transformedData.phoneNumber}</span>
              </div>
              
              {transformedData.socialLinks.linkedin && (
                <div className="contact-item">
                  <span className="contact-label">LinkedIn:</span>
                  <a href={transformedData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                    {transformedData.socialLinks.linkedin}
                  </a>
                </div>
              )}
              
              {transformedData.socialLinks.twitter && (
                <div className="contact-item">
                  <span className="contact-label">Twitter:</span>
                  <a href={`https://twitter.com/${transformedData.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="contact-link">
                    {transformedData.socialLinks.twitter}
                  </a>
                </div>
              )}
              
              {transformedData.socialLinks.facebook && (
                <div className="contact-item">
                  <span className="contact-label">Facebook:</span>
                  <a href={transformedData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="contact-link">
                    {transformedData.socialLinks.facebook}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Message Form Modal */}
      {showMessageForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Send Message to {transformedData.name}</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => setShowMessageForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSendMessage} className="btn-primary">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlumniProfile;