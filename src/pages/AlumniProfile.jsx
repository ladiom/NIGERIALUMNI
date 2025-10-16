import { useState } from 'react';
import './AlumniProfile.css';

function AlumniProfile() {
  const [activeTab, setActiveTab] = useState('about');
  const [isConnected, setIsConnected] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState('');
  
  // Sample alumni data - updated with new fields
  const alumniData = {
    id: 'XYZLA202012345UN',
    admissionNum: '1',
    admissionDate: '20-Jan-1962',
    name: 'John Doe',
    dateOfBirth: '25-Sep-1947',
    sex: 'M',
    phoneNumber: '+234 801 234 5678',
    email: 'johndoe@example.com',
    schoolName: 'University of Lagos',
    schoolState: 'Lagos',
    schoolLGA: 'Yaba',
    schoolLevel: 'University',
    graduationYear: '2020',
    graduationDate: '31-Dec-1967',
    fieldOfStudy: 'Computer Science',
    currentPosition: 'Software Engineer',
    currentCompany: 'Tech Innovations Ltd.',
    parentGuardianNames: 'Mr. John Doe Sr.',
    addressAtSchool: 'Box 542, Ibadan',
    lastSchoolAttended: 'St. Thomas, Kano',
    bio: 'Passionate about technology and community development. Alumni of University of Lagos class of 2020. Experienced software engineer with expertise in frontend and backend development, currently working on innovative tech solutions for African markets.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'UI/UX Design', 'Machine Learning'],
    achievements: [
      'Winner of the National Tech Innovation Award 2022',
      'Published author of 3 research papers on AI applications in healthcare',
      'Mentored over 50 young developers through coding bootcamps',
      'Raised N1 million for scholarships through alumni fundraising campaign'
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of Lagos',
        year: '2016 - 2020',
        description: 'Graduated with First Class Honors. President of the Computer Science Students Association.'
      },
      {
        degree: 'Master of Science in Artificial Intelligence',
        institution: 'Massachusetts Institute of Technology (MIT)',
        year: '2020 - 2022',
        description: 'Specialized in machine learning applications for developing economies. Received scholarship for academic excellence.'
      }
    ],
    experience: [
      {
        position: 'Software Engineer',
        company: 'Tech Innovations Ltd.',
        year: '2022 - Present',
        description: 'Lead developer for a fintech platform serving over 500,000 users across Nigeria. Implemented scalable frontend architecture and improved user engagement by 40%.'
      },
      {
        position: 'Research Assistant',
        company: 'MIT AI Research Lab',
        year: '2020 - 2022',
        description: 'Contributed to research on AI applications for healthcare diagnostics in resource-limited settings.'
      },
      {
        position: 'Web Developer Intern',
        company: 'Digital Solutions Inc.',
        year: '2019 - 2020',
        description: 'Developed and maintained client websites and web applications during university studies.'
      }
    ],
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    socialLinks: {
      linkedin: 'linkedin.com/in/johndoe',
      twitter: '@johndoe',
      github: 'github.com/johndoe',
      portfolio: 'johndoe.dev'
    },
    volunteering: [
      {
        role: 'Mentor',
        organization: 'Code for Nigeria',
        year: '2021 - Present',
        description: 'Mentor young developers and teach coding workshops in underserved communities.'
      },
      {
        role: 'Alumni Ambassador',
        organization: 'University of Lagos Alumni Association',
        year: '2020 - Present',
        description: 'Represent the university at networking events and help connect alumni.'
      }
    ],
    alumniGroups: [
      'UNILAG Computer Science Alumni Network',
      'Nigerian Tech Professionals Association',
      'African Fintech Innovators Group'
    ],
    interests: ['Technology', 'Education', 'Entrepreneurship', 'Artificial Intelligence', 'Community Development']
  };
  
  // Handle send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Message sent:', message);
      setMessage('');
      setShowMessageForm(false);
    }
  };
  
  // Handle connect/disconnect
  const handleConnectToggle = () => {
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
            <img src={alumniData.profilePicture} alt={alumniData.name} />
          </div>
          <div className="alumni-badge">
            <span className="badge-text">Verified Alumni</span>
          </div>
        </div>
        
        <div className="profile-info">
          <div className="profile-name-section">
            <h1>{alumniData.name}</h1>
            <div className="alumni-id">{alumniData.id}</div>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-label">Admission Number:</span>
              <span className="detail-value">{alumniData.admissionNum}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Admission Date:</span>
              <span className="detail-value">{alumniData.admissionDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date of Birth:</span>
              <span className="detail-value">{alumniData.dateOfBirth}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender:</span>
              <span className="detail-value">{alumniData.sex === 'M' ? 'Male' : 'Female'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Alma Mater:</span>
              <span className="detail-value">{alumniData.schoolName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Graduation Date:</span>
              <span className="detail-value">{alumniData.graduationDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Field of Study:</span>
              <span className="detail-value">{alumniData.fieldOfStudy}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Parent/Guardian:</span>
              <span className="detail-value">{alumniData.parentGuardianNames}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Previous School:</span>
              <span className="detail-value">{alumniData.lastSchoolAttended}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className={`btn-primary ${isConnected ? 'connected' : ''}`}
              onClick={handleConnectToggle}
            >
              {isConnected ? 'Connected' : 'Connect'}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => setShowMessageForm(!showMessageForm)}
            >
              {showMessageForm ? 'Cancel' : 'Message'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Message Form */}
      {showMessageForm && (
        <div className="message-form-container">
          <form onSubmit={handleSendMessage} className="message-form">
            <textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              required
            />
            <div className="message-actions">
              <button type="submit" className="btn-primary">Send Message</button>
            </div>
          </form>
        </div>
      )}
      
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
            className={`tab ${activeTab === 'involvement' ? 'active' : ''}`}
            onClick={() => setActiveTab('involvement')}
          >
            Involvement
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
          <div className="about-section">
            <h2>About</h2>
            <p className="bio">{alumniData.bio}</p>
            
            <div className="about-grid">
              <div className="about-card">
                <h3>Skills</h3>
                <div className="skills-list">
                  {alumniData.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
              
              <div className="about-card">
                <h3>Interests</h3>
                <ul className="interests-list">
                  {alumniData.interests.map((interest, index) => (
                    <li key={index} className="interest-item">
                      <span className="interest-icon">•</span>
                      <span>{interest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="education-section">
            <h2>Education</h2>
            <div className="education-list">
              {alumniData.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <div className="education-info">
                      <h3>{edu.degree}</h3>
                      <div className="education-institution">{edu.institution}</div>
                    </div>
                    <div className="education-year">{edu.year}</div>
                  </div>
                  <p className="education-description">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="experience-section">
            <h2>Experience</h2>
            <div className="experience-list">
              {alumniData.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <div className="experience-info">
                      <h3>{exp.position}</h3>
                      <div className="experience-company">{exp.company}</div>
                    </div>
                    <div className="experience-year">{exp.year}</div>
                  </div>
                  <p className="experience-description">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-list">
              {alumniData.achievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-content">
                    <p>{achievement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Involvement Tab */}
        {activeTab === 'involvement' && (
          <div className="involvement-section">
            <div className="volunteering-section">
              <h2>Volunteering</h2>
              <div className="volunteering-list">
                {alumniData.volunteering.map((volunteer, index) => (
                  <div key={index} className="volunteering-item">
                    <div className="volunteering-header">
                      <div className="volunteering-info">
                        <h3>{volunteer.role}</h3>
                        <div className="volunteering-organization">{volunteer.organization}</div>
                      </div>
                      <div className="volunteering-year">{volunteer.year}</div>
                    </div>
                    <p className="volunteering-description">{volunteer.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="alumni-groups-section">
              <h2>Alumni Groups</h2>
              <div className="alumni-groups-list">
                {alumniData.alumniGroups.map((group, index) => (
                  <div key={index} className="group-item">
                    <div className="group-icon">👥</div>
                    <div className="group-name">{group}</div>
                    <button className="btn-small">Join Group</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="contact-section">
            <h2>Contact Information</h2>
            
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-details">
                  <span className="contact-label">Email</span>
                  <a href={`mailto:${alumniData.email}`} className="contact-value">{alumniData.email}</a>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-details">
                  <span className="contact-label">Phone</span>
                  <a href={`tel:${alumniData.phoneNumber}`} className="contact-value">{alumniData.phoneNumber}</a>
                </div>
              </div>
            </div>
            
            <div className="social-media">
              <h3>Connect Online</h3>
              <div className="social-links">
                <a 
                  href={`https://${alumniData.socialLinks.linkedin}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                >
                  <span className="social-icon">💼</span>
                  <span>LinkedIn</span>
                </a>
                <a 
                  href={`https://twitter.com/${alumniData.socialLinks.twitter.substring(1)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                >
                  <span className="social-icon">🐦</span>
                  <span>Twitter</span>
                </a>
                <a 
                  href={`https://${alumniData.socialLinks.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                >
                  <span className="social-icon">💻</span>
                  <span>GitHub</span>
                </a>
                <a 
                  href={`https://${alumniData.socialLinks.portfolio}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                >
                  <span className="social-icon">🌐</span>
                  <span>Portfolio</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AlumniProfile;