import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SchoolProfile.css';
import { useAuth } from '../context/AuthContext';

function SchoolProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [expandedAlumni, setExpandedAlumni] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState(false);
  const [expandedNews, setExpandedNews] = useState(false);
  
  // Sample school data
  const schoolData = {
    id: 'SCH001',
    name: 'University of Lagos',
    state: 'Lagos',
    lga: 'Yaba',
    address: 'Akoka, Yaba, Lagos',
    establishedYear: 1962,
    schoolLevel: 'University',
    description: 'The University of Lagos, also known as UNILAG, is a public research university located in Lagos, Nigeria. It is one of the first generation universities in Nigeria and is ranked among the top universities in the country. The university offers undergraduate and postgraduate programs across various fields including Arts, Sciences, Law, Medicine, Engineering, and Social Sciences.',
    vision: 'To be a top-rated institution of learning, research, innovation and development, comparable to the best in the world.',
    mission: 'To pursue excellence in teaching, research and service to humanity, through the development of products and services that positively impact society.',
    achievements: [
      'Ranked as the Best University in Nigeria in 2023',
      'Produced 5 Nobel Prize nominees',
      'Home to 10 research centers of excellence',
      'Has over 50,000 alumni worldwide'
    ],
    contactInfo: {
      phone: '+234 1 280 8600',
      email: 'info@unilag.edu.ng',
      website: 'www.unilag.edu.ng',
      socialMedia: {
        facebook: 'facebook.com/unilag',
        twitter: '@unilagng',
        instagram: '@unilag_official'
      }
    },
    alumniStats: {
      totalAlumni: 50000,
      registeredAlumni: 12500,
      alumniInNetworking: 8750,
      alumniDonors: 3200
    },
    imageUrl: 'https://images.unsplash.com/photo-1532153975070-1c77d579a8f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
  };
  
  // Sample notable alumni
  const notableAlumni = [
    {
      id: 'ALM001',
      name: 'Dr. Okechukwu Ibeanu',
      graduationYear: '1985',
      fieldOfStudy: 'Medicine',
      currentPosition: 'Director, World Health Organization',
      achievements: 'Leading expert in global health policy and infectious disease control',
      photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'ALM002',
      name: 'Prof. Ngozi Okonjo-Iweala',
      graduationYear: '1977',
      fieldOfStudy: 'Economics',
      currentPosition: 'Director-General, World Trade Organization',
      achievements: 'Former Minister of Finance of Nigeria and global economic leader',
      photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'ALM003',
      name: 'Mr. Akinwumi Adesina',
      graduationYear: '1981',
      fieldOfStudy: 'Agricultural Economics',
      currentPosition: 'President, African Development Bank',
      achievements: 'Recipient of the World Food Prize and global agriculture expert',
      photoUrl: 'https://randomuser.me/api/portraits/men/57.jpg'
    },
    {
      id: 'ALM004',
      name: 'Dr. Amara Enyia',
      graduationYear: '1999',
      fieldOfStudy: 'Political Science',
      currentPosition: 'Public Policy Expert & Author',
      achievements: 'Leading voice on urban development and public policy reform',
      photoUrl: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];
  
  // Sample upcoming events
  const upcomingEvents = [
    {
      id: 'EVT001',
      title: '2023 UNILAG Alumni Reunion',
      date: 'December 15, 2023',
      location: 'Main Campus, UNILAG',
      description: 'Annual gathering of UNILAG alumni from around the world to reconnect, network, and celebrate the university\'s achievements.',
      imageUrl: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 'EVT002',
      title: 'UNILAG Foundation Fundraising Gala',
      date: 'January 20, 2024',
      location: 'Eko Hotel & Suites, Lagos',
      description: 'A black-tie event to raise funds for scholarships, research, and infrastructure development at the university.',
      imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8eeda?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1460&q=80'
    },
    {
      id: 'EVT003',
      title: 'Career Mentorship Workshop',
      date: 'February 10, 2024',
      location: 'Virtual (Zoom)',
      description: 'A workshop connecting current students with successful alumni to provide career guidance and mentorship.',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80'
    }
  ];
  
  // Sample news articles
  const newsArticles = [
    {
      id: 'NEWS001',
      title: 'UNILAG Ranked Best University in Nigeria for 5th Consecutive Year',
      date: 'November 10, 2023',
      summary: 'The University of Lagos has been ranked as the best university in Nigeria for the fifth consecutive year in the latest national university rankings.',
      imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 'NEWS002',
      title: 'UNILAG Launches New Research Center for Renewable Energy',
      date: 'October 25, 2023',
      summary: 'The university has launched a state-of-the-art research center focused on developing sustainable and affordable renewable energy solutions for Nigeria and Africa.',
      imageUrl: 'https://images.unsplash.com/photo-1518548419970-6f00504e3519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    },
    {
      id: 'NEWS003',
      title: 'UNILAG Alumni Donate N200 Million for Library Renovation',
      date: 'September 18, 2023',
      summary: 'A group of successful alumni has donated N200 million to renovate and modernize the university\'s main library, providing students with world-class facilities.',
      imageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    }
  ];
  
  // Get alumni to display based on expanded state
  const displayedAlumni = expandedAlumni ? notableAlumni : notableAlumni.slice(0, 2);
  const displayedEvents = expandedEvents ? upcomingEvents : upcomingEvents.slice(0, 2);
  const displayedNews = expandedNews ? newsArticles : newsArticles.slice(0, 2);

  return (
    <div className="school-profile-container">
      {/* Hero Section */}
      <div className="school-hero">
        <div className="school-hero-image" style={{ backgroundImage: `url(${schoolData.imageUrl})` }}>
          <div className="school-hero-overlay">
            <div className="school-hero-content">
              <h1>{schoolData.name}</h1>
              <div className="school-meta">
                <span className="school-location">{schoolData.address}, {schoolData.lga}, {schoolData.state}</span>
                <span className="school-level">{schoolData.schoolLevel}</span>
                <span className="school-year">Established: {schoolData.establishedYear}</span>
              </div>
              <div className="school-stats">
                <div className="stat-item">
                  <div className="stat-number">{schoolData.alumniStats.totalAlumni.toLocaleString()}</div>
                  <div className="stat-label">Total Alumni</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{schoolData.alumniStats.registeredAlumni.toLocaleString()}</div>
                  <div className="stat-label">Registered on Platform</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{schoolData.alumniStats.alumniDonors.toLocaleString()}</div>
                  <div className="stat-label">Active Donors</div>
                </div>
              </div>
              <div className="school-actions">
                <button 
                  className="btn-primary"
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                    } else {
                      // User is logged in, redirect to profile update
                      navigate('/register');
                    }
                  }}
                >
                  Update your Profile
                </button>
                <button className="btn-secondary">View School Website</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="school-tabs">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button 
            className={`tab ${activeTab === 'alumni' ? 'active' : ''}`}
            onClick={() => setActiveTab('alumni')}
          >
            Alumni
          </button>
          <button 
            className={`tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            News
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
      <div className="school-content">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="about-section">
            <div className="about-content">
              <h2>About {schoolData.name}</h2>
              <p className="school-description">{schoolData.description}</p>
              
              <div className="about-grid">
                <div className="about-card">
                  <h3>Vision</h3>
                  <p>{schoolData.vision}</p>
                </div>
                <div className="about-card">
                  <h3>Mission</h3>
                  <p>{schoolData.mission}</p>
                </div>
              </div>
              
              <div className="achievements-section">
                <h3>Notable Achievements</h3>
                <ul className="achievements-list">
                  {schoolData.achievements.map((achievement, index) => (
                    <li key={index} className="achievement-item">
                      <span className="achievement-icon">🏆</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Alumni Tab */}
        {activeTab === 'alumni' && (
          <div className="alumni-section">
            <div className="alumni-header">
              <h2>Notable Alumni</h2>
              <button className="btn-secondary">Search All Alumni</button>
            </div>
            
            <div className="alumni-grid">
              {displayedAlumni.map(alum => (
                <div key={alum.id} className="alumni-card">
                  <div className="alumni-photo">
                    <img src={alum.photoUrl} alt={alum.name} />
                  </div>
                  <div className="alumni-info">
                    <h3>{alum.name}</h3>
                    <div className="alumni-meta">
                      <span className="grad-year">Class of {alum.graduationYear}</span>
                      <span className="field">{alum.fieldOfStudy}</span>
                    </div>
                    <div className="alumni-position">{alum.currentPosition}</div>
                    <div className="alumni-achievements">{alum.achievements}</div>
                    <div className="alumni-actions">
                      <button className="btn-small">View Profile</button>
                      <button className="btn-small">Connect</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {notableAlumni.length > 2 && (
              <button 
                className="btn-secondary expand-btn"
                onClick={() => setExpandedAlumni(!expandedAlumni)}
              >
                {expandedAlumni ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="events-section">
            <div className="events-header">
              <h2>Upcoming Events</h2>
              <button className="btn-secondary">View All Events</button>
            </div>
            
            <div className="events-list">
              {displayedEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <img src={event.imageUrl} alt={event.title} />
                  </div>
                  <div className="event-details">
                    <div className="event-date">{event.date}</div>
                    <h3>{event.title}</h3>
                    <div className="event-location">{event.location}</div>
                    <p className="event-description">{event.description}</p>
                    <button className="btn-primary btn-small">Register Now</button>
                  </div>
                </div>
              ))}
            </div>
            
            {upcomingEvents.length > 2 && (
              <button 
                className="btn-secondary expand-btn"
                onClick={() => setExpandedEvents(!expandedEvents)}
              >
                {expandedEvents ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}
        
        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="news-section">
            <div className="news-header">
              <h2>Latest News</h2>
              <button className="btn-secondary">View All News</button>
            </div>
            
            <div className="news-grid">
              {displayedNews.map(news => (
                <div key={news.id} className="news-card">
                  <div className="news-image">
                    <img src={news.imageUrl} alt={news.title} />
                  </div>
                  <div className="news-content">
                    <div className="news-date">{news.date}</div>
                    <h3>{news.title}</h3>
                    <p className="news-summary">{news.summary}</p>
                    <button className="btn-secondary btn-small">Read More</button>
                  </div>
                </div>
              ))}
            </div>
            
            {newsArticles.length > 2 && (
              <button 
                className="btn-secondary expand-btn"
                onClick={() => setExpandedNews(!expandedNews)}
              >
                {expandedNews ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>
        )}
        
        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="contact-section">
            <h2>Contact Information</h2>
            
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div className="contact-details">
                  <span className="contact-label">Address</span>
                  <span className="contact-value">{schoolData.address}</span>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-details">
                  <span className="contact-label">Phone</span>
                  <span className="contact-value">{schoolData.contactInfo.phone}</span>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-details">
                  <span className="contact-label">Email</span>
                  <span className="contact-value">{schoolData.contactInfo.email}</span>
                </div>
              </div>
              
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <div className="contact-details">
                  <span className="contact-label">Website</span>
                  <a href={`https://${schoolData.contactInfo.website}`} target="_blank" rel="noopener noreferrer" className="contact-value">{schoolData.contactInfo.website}</a>
                </div>
              </div>
            </div>
            
            <div className="social-media">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href={`https://${schoolData.contactInfo.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📱</span>
                  <span>{schoolData.contactInfo.socialMedia.facebook}</span>
                </a>
                <a href={`https://twitter.com/${schoolData.contactInfo.socialMedia.twitter.substring(1)}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">🐦</span>
                  <span>{schoolData.contactInfo.socialMedia.twitter}</span>
                </a>
                <a href={`https://instagram.com/${schoolData.contactInfo.socialMedia.instagram.substring(1)}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon">📸</span>
                  <span>{schoolData.contactInfo.socialMedia.instagram}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchoolProfile;