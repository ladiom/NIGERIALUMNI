import React, { useState } from 'react';
import './Partners.css';

const Partners = () => {
  const [activeTab, setActiveTab] = useState('current');

  const currentPartners = [
    {
      id: 1,
      name: "First Bank of Nigeria",
      logo: "/logos/first-bank.png",
      category: "Banking Partner",
      description: "Providing ₦100,000 startup support for verified alumni organizations with multi-signatory governance.",
      tier: "Platinum",
      website: "https://firstbanknigeria.com",
      benefits: ["Banking Services", "Startup Funding", "Financial Advisory"]
    },
    {
      id: 2,
      name: "Corporate Affairs Commission (CAC)",
      logo: "/logos/cac.png",
      category: "Regulatory Partner",
      description: "Ensuring all alumni associations are legally registered with transparency and accountability.",
      tier: "Gold",
      website: "https://cac.gov.ng",
      benefits: ["Legal Registration", "Compliance Support", "Documentation"]
    },
    {
      id: 3,
      name: "Google for Education",
      logo: "/logos/google-education.png",
      category: "Technology Partner",
      description: "Supporting STEM education and digital literacy programs across Nigerian institutions.",
      tier: "Gold",
      website: "https://edu.google.com",
      benefits: ["Digital Tools", "Training Programs", "Technology Support"]
    },
    {
      id: 4,
      name: "Microsoft Nigeria",
      logo: "/logos/microsoft.png",
      category: "Technology Partner",
      description: "Facilitating AI education and career mentorship programs for alumni.",
      tier: "Silver",
      website: "https://microsoft.com/ng",
      benefits: ["Software Licenses", "Training Resources", "Career Development"]
    }
  ];

  const partnershipTiers = [
    {
      name: "Platinum",
      color: "#E5E7EB",
      icon: "💎",
      minInvestment: "₦10M+",
      benefits: [
        "Premium logo placement on all materials",
        "Exclusive speaking opportunities at events",
        "Direct access to alumni network data",
        "Custom partnership programs",
        "Priority support and consultation"
      ]
    },
    {
      name: "Gold",
      color: "#FCD34D",
      icon: "🥇",
      minInvestment: "₦5M - ₦10M",
      benefits: [
        "Logo placement on website and materials",
        "Speaking opportunities at major events",
        "Access to alumni network insights",
        "Co-branded initiatives",
        "Dedicated account manager"
      ]
    },
    {
      name: "Silver",
      color: "#9CA3AF",
      icon: "🥈",
      minInvestment: "₦1M - ₦5M",
      benefits: [
        "Logo placement on website",
        "Event participation opportunities",
        "Basic alumni network access",
        "Co-marketing opportunities",
        "Regular partnership updates"
      ]
    },
    {
      name: "Bronze",
      color: "#CD7F32",
      icon: "🥉",
      minInvestment: "₦100K - ₦1M",
      benefits: [
        "Logo placement on partners page",
        "Newsletter mentions",
        "Basic partnership support",
        "Event invitations",
        "Quarterly partnership reports"
      ]
    }
  ];

  const partnershipAreas = [
    {
      title: "Education Technology",
      description: "Support STEM education, digital literacy, and AI training programs",
      icon: "💻",
      opportunities: ["Software licenses", "Training programs", "Technology infrastructure"]
    },
    {
      title: "Financial Services",
      description: "Provide banking services, startup funding, and financial advisory",
      icon: "🏦",
      opportunities: ["Banking partnerships", "Investment opportunities", "Financial education"]
    },
    {
      title: "Professional Development",
      description: "Offer career mentorship, job placement, and skill development",
      icon: "🎯",
      opportunities: ["Mentorship programs", "Job opportunities", "Skill training"]
    },
    {
      title: "Infrastructure & Facilities",
      description: "Support school infrastructure development and facility upgrades",
      icon: "🏗️",
      opportunities: ["Building projects", "Equipment donations", "Facility maintenance"]
    },
    {
      title: "Healthcare & Wellness",
      description: "Provide health services, wellness programs, and medical support",
      icon: "🏥",
      opportunities: ["Health screenings", "Wellness programs", "Medical partnerships"]
    },
    {
      title: "Media & Communications",
      description: "Support marketing, communications, and media outreach",
      icon: "📺",
      opportunities: ["Media partnerships", "Marketing support", "Content creation"]
    }
  ];

  return (
    <div className="partners-container">
      {/* Header Section */}
      <div className="partners-header">
        <div className="partners-hero">
          <h1>Partners & Sponsors</h1>
          <p className="partners-subtitle">
            Join the NAIRA-100 movement and help revive Nigeria's educational institutions
          </p>
          <div className="partners-stats">
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Active Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">₦50M+</div>
              <div className="stat-label">Total Investment</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Schools Supported</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Students Impacted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="partners-nav">
        <button 
          className={`nav-tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current Partners
        </button>
        <button 
          className={`nav-tab ${activeTab === 'tiers' ? 'active' : ''}`}
          onClick={() => setActiveTab('tiers')}
        >
          Partnership Tiers
        </button>
        <button 
          className={`nav-tab ${activeTab === 'opportunities' ? 'active' : ''}`}
          onClick={() => setActiveTab('opportunities')}
        >
          Partnership Opportunities
        </button>
        <button 
          className={`nav-tab ${activeTab === 'join' ? 'active' : ''}`}
          onClick={() => setActiveTab('join')}
        >
          Join Us
        </button>
      </div>

      {/* Current Partners Tab */}
      {activeTab === 'current' && (
        <div className="partners-content">
          <div className="partners-grid">
            {currentPartners.map(partner => (
              <div key={partner.id} className={`partner-card ${partner.tier.toLowerCase()}`}>
                <div className="partner-header">
                  <div className="partner-logo">
                    <img src={partner.logo} alt={partner.name} />
                  </div>
                  <div className="partner-info">
                    <h3>{partner.name}</h3>
                    <span className="partner-category">{partner.category}</span>
                    <span className={`partner-tier ${partner.tier.toLowerCase()}`}>
                      {partner.tier} Partner
                    </span>
                  </div>
                </div>
                <p className="partner-description">{partner.description}</p>
                <div className="partner-benefits">
                  <h4>Partnership Benefits:</h4>
                  <ul>
                    {partner.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <a href={partner.website} target="_blank" rel="noopener noreferrer" className="partner-website">
                  Visit Website →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partnership Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="partners-content">
          <div className="tiers-intro">
            <h2>Partnership Tiers</h2>
            <p>Choose the partnership level that aligns with your organization's goals and investment capacity.</p>
          </div>
          <div className="tiers-grid">
            {partnershipTiers.map(tier => (
              <div key={tier.name} className={`tier-card ${tier.name.toLowerCase()}`}>
                <div className="tier-header">
                  <div className="tier-icon">{tier.icon}</div>
                  <h3>{tier.name} Partner</h3>
                  <div className="tier-investment">{tier.minInvestment}</div>
                </div>
                <div className="tier-benefits">
                  <h4>Benefits Include:</h4>
                  <ul>
                    {tier.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                <button className="tier-cta">
                  Become {tier.name} Partner
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partnership Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="partners-content">
          <div className="opportunities-intro">
            <h2>Partnership Opportunities</h2>
            <p>Explore various ways your organization can contribute to the NAIRA-100 movement.</p>
          </div>
          <div className="opportunities-grid">
            {partnershipAreas.map(area => (
              <div key={area.title} className="opportunity-card">
                <div className="opportunity-icon">{area.icon}</div>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <div className="opportunity-list">
                  <h4>Opportunities:</h4>
                  <ul>
                    {area.opportunities.map((opportunity, index) => (
                      <li key={index}>{opportunity}</li>
                    ))}
                  </ul>
                </div>
                <button className="opportunity-cta">
                  Explore Partnership
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join Us Tab */}
      {activeTab === 'join' && (
        <div className="partners-content">
          <div className="join-intro">
            <h2>Join the NAIRA-100 Movement</h2>
            <p>Be part of the solution to revive Nigeria's educational institutions and create lasting impact.</p>
          </div>
          
          <div className="join-process">
            <h3>How to Become a Partner</h3>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Express Interest</h4>
                  <p>Contact our partnership team to discuss your organization's goals and alignment with NAIRA-100.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Partnership Proposal</h4>
                  <p>Submit a detailed proposal outlining your contribution and desired partnership tier.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Review & Approval</h4>
                  <p>Our team reviews your proposal and conducts due diligence on your organization.</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Partnership Agreement</h4>
                  <p>Sign a formal partnership agreement and begin making impact together.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-section">
            <div className="contact-info">
              <h3>Ready to Partner?</h3>
              <p>Get in touch with our partnership team to start the conversation.</p>
              <div className="contact-details">
                <div className="contact-item">
                  <strong>Email:</strong> partnerships@naira100.org
                </div>
                <div className="contact-item">
                  <strong>Phone:</strong> +234 (0) 800 NAIRA100
                </div>
                <div className="contact-item">
                  <strong>Address:</strong> NAIRA-100 Headquarters, Lagos, Nigeria
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h4>Send us a message</h4>
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Organization Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Contact Email" required />
                </div>
                <div className="form-group">
                  <input type="tel" placeholder="Phone Number" />
                </div>
                <div className="form-group">
                  <select required>
                    <option value="">Select Partnership Interest</option>
                    <option value="platinum">Platinum Partnership</option>
                    <option value="gold">Gold Partnership</option>
                    <option value="silver">Silver Partnership</option>
                    <option value="bronze">Bronze Partnership</option>
                    <option value="custom">Custom Partnership</option>
                  </select>
                </div>
                <div className="form-group">
                  <textarea placeholder="Tell us about your organization and partnership goals" rows="4"></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  Send Partnership Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="partners-cta">
        <div className="cta-content">
          <h2>Ready to Make a Difference?</h2>
          <p>Join the NAIRA-100 movement and help transform Nigeria's educational landscape.</p>
          <div className="cta-buttons">
            <button className="btn-primary">Become a Partner</button>
            <button className="btn-download-kit">
              📥 Download Partnership Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners;
