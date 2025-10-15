import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

function About() {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About NAIRA-100</h1>
          <p className="about-hero-subtitle">
            National Alumni Institutions Revival Alliance
          </p>
          <p className="about-hero-description">
            Transforming nostalgia into nation-building power by connecting Nigeria's alumni communities 
            to revive educational institutions across the nation.
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>Our Story</h2>
          <div className="about-text">
            <p>
              Nigeria's educational institutions have faced decades of underfunding and neglect, 
              leaving many schools struggling to maintain quality learning environments. The NAIRA-100 
              Initiative seeks to bridge this gap by mobilizing alumni communities nationwide to 
              reconnect, collaborate, and reinvest in their alma maters.
            </p>
            <p>
              This national movement aims to unite alumni across primary, secondary, vocational, 
              and tertiary levels through a secure digital ecosystem. By harnessing the collective 
              strength of millions of graduates, NAIRA-100 will foster school revitalization, 
              promote innovation, and ensure the long-term sustainability of education in Nigeria.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="about-section vision-mission">
        <div className="about-content">
          <div className="vision-mission-grid">
            <div className="vision-card">
              <div className="card-icon">🎯</div>
              <h3>Our Vision</h3>
              <p>
                To reconnect and empower Nigeria's alumni communities across all educational levels 
                through a unified digital platform that drives collaboration, strengthens institutions, 
                and advances educational innovation nationwide.
              </p>
            </div>
            <div className="mission-card">
              <div className="card-icon">🚀</div>
              <h3>Our Mission</h3>
              <p>
                To build a national alumni platform that enables graduates to reconnect, support their 
                alma maters, and collectively revive Nigeria's educational sector through transparent 
                governance, inclusive partnerships, and technology-driven engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Objectives */}
      <section className="about-section">
        <div className="about-content">
          <h2>Strategic Objectives</h2>
          <div className="objectives-grid">
            <div className="objective-item">
              <div className="objective-number">01</div>
              <div className="objective-content">
                <h4>Unified Digital Platform</h4>
                <p>Establish a unified digital platform connecting alumni across all levels of education in Nigeria.</p>
              </div>
            </div>
            <div className="objective-item">
              <div className="objective-number">02</div>
              <div className="objective-content">
                <h4>Secure Verification</h4>
                <p>Simplify search and registration for alumni through secure verification and digital identity systems.</p>
              </div>
            </div>
            <div className="objective-item">
              <div className="objective-number">03</div>
              <div className="objective-content">
                <h4>Resource Contribution</h4>
                <p>Enable alumni to contribute resources, expertise, and funding toward school development projects.</p>
              </div>
            </div>
            <div className="objective-item">
              <div className="objective-number">04</div>
              <div className="objective-content">
                <h4>Knowledge Sharing</h4>
                <p>Foster knowledge-sharing, mentorship, and collaborative innovation, especially in STEM and digital literacy.</p>
              </div>
            </div>
            <div className="objective-item">
              <div className="objective-number">05</div>
              <div className="objective-content">
                <h4>Transparency & Accountability</h4>
                <p>Ensure accountability and transparency through registered alumni associations with clear financial governance.</p>
              </div>
            </div>
            <div className="objective-item">
              <div className="objective-number">06</div>
              <div className="objective-content">
                <h4>Government Partnership</h4>
                <p>Mobilize alumni communities to complement government efforts in addressing educational infrastructure and quality gaps.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Components */}
      <section className="about-section core-components">
        <div className="about-content">
          <h2>Core Components</h2>
          <div className="components-grid">
            <div className="component-card">
              <div className="component-icon">🎓</div>
              <h3>Alumni Database & Digital Platform</h3>
              <p>
                The NAIRA-100 platform integrates alumni records from verified institutional registries 
                across Nigeria, connecting graduates from Primary Schools, Secondary Schools (JSS & SSS), 
                Vocational/Technical Institutes, and Universities.
              </p>
            </div>
            <div className="component-card">
              <div className="component-icon">🔐</div>
              <h3>Search & Secure Registration</h3>
              <p>
                Alumni can search by school, year of entry, or graduation year. Verified users can update 
                personal details, and new users can initiate registration via verified email link. 
                Alumni can also nominate classmates to expand the verified network.
              </p>
            </div>
            <div className="component-card">
              <div className="component-icon">👥</div>
              <h3>Platform & Member Features</h3>
              <p>
                Dedicated school pages, personalized profiles, access-controlled communities, 
                connection algorithms, and unique NAIRA-100 IDs for each alumnus.
              </p>
            </div>
            <div className="component-card">
              <div className="component-icon">🏛️</div>
              <h3>Organizational Framework</h3>
              <p>
                CAC registration requirement for all alumni associations, multi-level financial 
                governance with multi-signatory bank accounts, and bank sponsorship partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NAIRA-100 ID System */}
      <section className="about-section id-system">
        <div className="about-content">
          <h2>NAIRA-100 ID System</h2>
          <div className="id-system-content">
            <div className="id-example">
              <div className="id-card">
                <div className="id-header">NAIRA-100 ID</div>
                <div className="id-code">STP-1998-0023-AO</div>
                <div className="id-breakdown">
                  <div className="id-part">
                    <span className="id-label">School:</span>
                    <span className="id-value">STP (St. Patrick's Ibadan)</span>
                  </div>
                  <div className="id-part">
                    <span className="id-label">Year:</span>
                    <span className="id-value">1998 (Class of 1998)</span>
                  </div>
                  <div className="id-part">
                    <span className="id-label">Sequence:</span>
                    <span className="id-value">0023 (Registration number)</span>
                  </div>
                  <div className="id-part">
                    <span className="id-label">Initials:</span>
                    <span className="id-value">AO (Adebayo O.)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="id-description">
              <h3>Your Unique Identity</h3>
              <p>
                Every verified alumnus receives a personalized NAIRA-100 ID that serves as their 
                digital identity within the platform. This unique identifier ensures authenticity, 
                enables easy recognition, and creates a sense of belonging to the NAIRA-100 community.
              </p>
              <ul className="id-benefits">
                <li>✅ Verified alumni credentials</li>
                <li>✅ Official NAIRA-100 brooch pin</li>
                <li>✅ Access to exclusive member features</li>
                <li>✅ Recognition in Hall of Contributors</li>
                <li>✅ Eligibility for leadership roles</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Member Recognition Tiers */}
      <section className="about-section member-tiers">
        <div className="about-content">
          <h2>Member Recognition Tiers</h2>
          <p className="tiers-description">
            NAIRA-100 recognizes active members through a tiered membership system that rewards 
            participation and contribution to school development projects.
          </p>
          <div className="tiers-grid">
            <div className="tier-card silver">
              <div className="tier-badge">🥈</div>
              <h3>Silver Member</h3>
              <p className="tier-requirement">Registered and verified members</p>
              <ul className="tier-benefits">
                <li>Unique NAIRA-100 ID</li>
                <li>Official brooch pin</li>
                <li>Access to alumni network</li>
                <li>School updates and events</li>
              </ul>
            </div>
            <div className="tier-card gold">
              <div className="tier-badge">🥇</div>
              <h3>Gold Member</h3>
              <p className="tier-requirement">Active contributors and participants in school projects</p>
              <ul className="tier-benefits">
                <li>All Silver benefits</li>
                <li>Project participation</li>
                <li>Mentorship opportunities</li>
                <li>Priority support</li>
              </ul>
            </div>
            <div className="tier-card diamond">
              <div className="tier-badge">💎</div>
              <h3>Diamond Member</h3>
              <p className="tier-requirement">Major donors and project sponsors</p>
              <ul className="tier-benefits">
                <li>All Gold benefits</li>
                <li>Hall of Contributors recognition</li>
                <li>Leadership role eligibility</li>
                <li>Exclusive events access</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Roadmap */}
      <section className="about-section roadmap">
        <div className="about-content">
          <h2>Implementation Roadmap</h2>
          <div className="roadmap-content">
            <div className="phase-card">
              <div className="phase-number">Phase 1</div>
              <h3>Proof of Concept</h3>
              <p>
                A pilot phase beginning with three secondary schools, including St. Patrick's College, Ibadan, 
                and two additional schools selected for early adoption.
              </p>
              <div className="phase-objectives">
                <h4>Objectives:</h4>
                <ul>
                  <li>Test system usability and data accuracy</li>
                  <li>Validate alumni verification and engagement mechanisms</li>
                  <li>Gather feedback for nationwide rollout</li>
                </ul>
              </div>
            </div>
            <div className="phase-timeline">
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Q1 2024</h4>
                  <p>Platform development and testing</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Q2 2024</h4>
                  <p>Pilot launch with 3 schools</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Q3 2024</h4>
                  <p>Feedback collection and improvements</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Q4 2024</h4>
                  <p>Nationwide rollout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Join the NAIRA-100 Movement</h2>
          <p>
            Be part of the transformation that's bridging the past, empowering the present, 
            and shaping the future of education in Nigeria.
          </p>
          <div className="cta-buttons">
            <Link to="/register-school" className="btn btn-primary btn-large">
              Get Your NAIRA-100 ID
            </Link>
            <Link to="/register-school" className="btn btn-outline btn-large">
              Register Your School
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
