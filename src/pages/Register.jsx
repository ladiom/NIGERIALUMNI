import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Register.css';
import supabase from '../supabaseClient';
import { enqueueRegistrationReceivedEmail } from '../utils/registration';

function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    graduationYear: '',
    schoolName: '',
    schoolState: '',
    schoolCity: '',
    schoolLevel: '',
    admissionYear: '',
    currentPosition: '',
    currentCompany: '',
    fieldOfStudy: '',
    bio: '',
    profilePicture: '',
    linkedin: '',
    twitter: '',
    facebook: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Invited flow state
  const [invitedContext, setInvitedContext] = useState({
    isInvited: false,
    isImmediate: false,
    pendingId: null,
    alumniId: null,
    school: null,
    userEmail: ''
  });

  // School levels
  const schoolLevels = [
    { value: 'PR', label: 'Primary School' },
    { value: 'HI', label: 'High School' },
    { value: 'PO', label: 'Polytechnic' },
    { value: 'UN', label: 'University' }
  ];

  // Sample states in Nigeria
  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // Detect immediate flow via query param, and invited flow via auth email
  useEffect(() => {
    const detectFlows = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const alumniIdParam = params.get('alumni');

        if (alumniIdParam) {
          // Immediate flow: prefill by alumni id from query
          const { data: alumn, error: alumErr } = await supabase
            .from('alumni')
            .select('*')
            .eq('id', alumniIdParam)
            .single();
          if (alumErr && alumErr.code !== 'PGRST116') {
            console.warn('Alumni prefill error:', alumErr);
          }

          let schoolData = null;
          if (alumn?.school_id) {
            const { data: s, error: sErr } = await supabase
              .from('schools')
              .select('*')
              .eq('id', alumn.school_id)
              .single();
            if (!sErr && s) schoolData = s;
          }

          setFormData(prev => ({
            ...prev,
            title: alumn?.title || '',
            fullName: alumn?.full_name || '',
            phoneNumber: alumn?.phone_number || '',
            email: alumn?.email || '',
            graduationYear: alumn?.graduation_year ? String(alumn.graduation_year) : '',
            schoolName: schoolData?.name || '',
            schoolState: schoolData?.state || '',
            schoolCity: schoolData?.lga || '',
            schoolLevel: schoolData?.level || '',
            admissionYear: alumn?.adm_year ? String(alumn.adm_year) : '',
            currentPosition: alumn?.current_position || '',
            currentCompany: alumn?.current_company || '',
            fieldOfStudy: alumn?.field_of_study || '',
            bio: alumn?.bio || '',
            profilePicture: alumn?.profile_picture || '',
            linkedin: alumn?.linkedin || '',
            twitter: alumn?.twitter || '',
            facebook: alumn?.facebook || ''
          }));

          setInvitedContext({
            isInvited: false,
            isImmediate: true,
            pendingId: null,
            alumniId: alumniIdParam,
            school: schoolData,
            userEmail: ''
          });
          return; // Prefer immediate flow when query param exists
        }

        // Fallback: invited flow via magic link
        const { data: userResult } = await supabase.auth.getUser();
        const user = userResult?.user;
        if (!user?.email) return; // no invited flow

        // Find pending registration by email
        const { data: pending, error: pendErr } = await supabase
          .from('pending_registrations')
          .select('*')
          .eq('email', user.email)
          .neq('status', 'completed')
          .limit(1)
          .single();

        if (pendErr && pendErr.code !== 'PGRST116') {
          console.warn('Pending registration lookup error:', pendErr);
          return;
        }

        if (!pending) return; // Not invited, keep general form

        // Load alumni and school to prefill (read-only)
        const { data: alumn, error: alumErr } = await supabase
          .from('alumni')
          .select('*')
          .eq('id', pending.alumni_id)
          .single();
        if (alumErr && alumErr.code !== 'PGRST116') {
          console.warn('Alumni prefill error:', alumErr);
        }

        let schoolData = null;
        if (alumn?.school_id) {
          const { data: s, error: sErr } = await supabase
            .from('schools')
            .select('*')
            .eq('id', alumn.school_id)
            .single();
          if (!sErr && s) schoolData = s;
        }

        // Prefill form with known data; allow editing of name/phone/year
        setFormData(prev => ({
          ...prev,
          title: alumn?.title || '',
          fullName: alumn?.full_name || '',
          phoneNumber: alumn?.phone_number || '',
          email: user.email,
          graduationYear: alumn?.graduation_year ? String(alumn.graduation_year) : '',
          schoolName: schoolData?.name || '',
          schoolState: schoolData?.state || '',
          schoolCity: schoolData?.lga || '',
          schoolLevel: schoolData?.level || '',
          admissionYear: alumn?.adm_year ? String(alumn.adm_year) : '',
          currentPosition: alumn?.current_position || '',
          currentCompany: alumn?.current_company || '',
          fieldOfStudy: alumn?.field_of_study || '',
          bio: alumn?.bio || '',
          profilePicture: alumn?.profile_picture || '',
          linkedin: alumn?.linkedin || '',
          twitter: alumn?.twitter || '',
          facebook: alumn?.facebook || ''
        }));

        setInvitedContext({
          isInvited: true,
          isImmediate: false,
          pendingId: pending.id,
          alumniId: pending.alumni_id,
          school: schoolData,
          userEmail: user.email
        });
      } catch (e) {
        console.warn('Detect invited flow failed:', e);
      }
    };
    detectFlows();
  }, [location.search]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.graduationYear.trim()) {
      newErrors.graduationYear = 'Graduation year is required';
    } else if (!/^\d{4}$/.test(formData.graduationYear)) {
      newErrors.graduationYear = 'Please enter a valid 4-digit year';
    }
    
    // Optional: admission year if provided must be 4 digits
    if (formData.admissionYear && !/^\d{4}$/.test(formData.admissionYear)) {
      newErrors.admissionYear = 'Please enter a valid 4-digit year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // If invited, update existing alumni and mark pending completed
      if (invitedContext.isInvited && invitedContext.alumniId) {
        // Update alumni with provided fields
        const { error: updErr } = await supabase
          .from('alumni')
          .update({
            title: formData.title || null,
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            email: invitedContext.userEmail,
            graduation_year: (formData.graduationYear && formData.graduationYear.trim()) ? formData.graduationYear.trim() : null,
            adm_year: (formData.admissionYear && formData.admissionYear.trim()) ? formData.admissionYear.trim() : null,
            current_position: formData.currentPosition || null,
            current_company: formData.currentCompany || null,
            field_of_study: formData.fieldOfStudy || null,
            bio: formData.bio || null,
            profile_picture: formData.profilePicture || null,
            linkedin: formData.linkedin || null,
            twitter: formData.twitter || null,
            facebook: formData.facebook || null
          })
          .eq('id', invitedContext.alumniId);
        if (updErr) throw new Error('Error updating alumni: ' + updErr.message);

        // Mark pending registration as completed
        if (invitedContext.pendingId) {
          const { error: pendUpdErr } = await supabase
            .from('pending_registrations')
            .update({ status: 'completed' })
            .eq('id', invitedContext.pendingId);
          if (pendUpdErr) console.warn('Pending status update failed:', pendUpdErr);
        }

        // Best-effort: create users record if table exists (optional)
        try {
          await supabase
            .from('users')
            .insert([{ alumni_id: invitedContext.alumniId }]);
        } catch (uerr) {
          // Ignore if table not present or blocked by RLS
          console.warn('Optional users insert skipped:', uerr?.message || uerr);
        }

        // Queue notification email to alumni (invited flow)
        try {
          await enqueueRegistrationReceivedEmail({
            toEmail: invitedContext.userEmail,
            toName: `${formData.title ? formData.title + ' ' : ''}${formData.fullName}`.trim(),
            alumniId: invitedContext.alumniId,
            schoolName: invitedContext.school?.name || null
          });
        } catch (e) {
          console.warn('Email enqueue failed (invited flow):', e?.message || e);
        }

        setSubmitting(false);
        setSubmitted(true);
        return;
      }

      // Immediate flow: create a pending registration linked to alumni
      if (invitedContext.isImmediate && invitedContext.alumniId) {
        const { data: pend, error: pendErr } = await supabase
          .from('pending_registrations')
          .insert([{ alumni_id: invitedContext.alumniId, email: formData.email, status: 'pending' }])
          .select();
        if (pendErr) {
          console.error('Pending registration error:', pendErr);
          if (pendErr.code === '42501' || pendErr.message.includes('row-level security policy')) {
            throw new Error('Registration system is temporarily unavailable. Please contact support at support@nigeriaalumninetwork.com or try again later.');
          }
          throw new Error('Error creating pending registration: ' + pendErr.message);
        }

        // Queue notification email to alumni (immediate flow)
        try {
          await enqueueRegistrationReceivedEmail({
            toEmail: formData.email,
            toName: `${formData.title ? formData.title + ' ' : ''}${formData.fullName}`.trim(),
            alumniId: invitedContext.alumniId,
            schoolName: invitedContext.school?.name || null
          });
        } catch (e) {
          console.warn('Email enqueue failed (immediate flow):', e?.message || e);
        }

        setSubmitting(false);
        setSubmitted(true);
        return;
      }

      // General flow without context is not supported; require selection from search
      throw new Error('Please start registration by clicking Register on a search result.');
      
      // Optional: Reset form after submission
      // setFormData({
      //   fullName: '',
      //   phoneNumber: '',
      //   email: '',
      //   graduationYear: '',
      //   schoolName: '',
      //   schoolState: '',
      //   schoolLGA: '',
      //   schoolLevel: ''
      // });
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <h1>{invitedContext.isInvited ? 'Complete Your Registration' : 'Register as Alumni'}</h1>
      {(formData.schoolName || invitedContext.school) && (
        <div className="school-header">
          <div className="school-title">
            {formData.schoolName || invitedContext.school?.name || 'School'}
          </div>
          <div className="school-subtitle">
            {(formData.schoolCity || invitedContext.school?.lga || '')}
            {((formData.schoolCity || invitedContext.school?.lga) && (formData.schoolState || invitedContext.school?.state)) ? ', ' : ''}
            {(formData.schoolState || invitedContext.school?.state || '')}
          </div>
        </div>
      )}
      
      {submitted ? (
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Registration Successfully Submitted!</h2>
          <div className="success-details">
            <p className="success-main">Thank you for registering with Nigeria Alumni Network (NAN).</p>
            <p>Your submission has been received and is currently under review by our team.</p>
            
            <div className="confirmation-info">
              <h3>What happens next?</h3>
              <ul>
                <li>📧 A confirmation email has been sent to <strong>{formData.email || invitedContext.userEmail}</strong></li>
                <li>⏱️ Our team will review your registration within 2-3 business days</li>
                <li>✅ You'll receive an approval email with your unique alumni ID once verified</li>
                <li>🔐 The approval email will include login credentials and next steps</li>
              </ul>
            </div>

            <div className="registration-summary">
              <h3>Registration Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Name:</span>
                  <span className="value">{formData.title ? formData.title + ' ' : ''}{formData.fullName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">School:</span>
                  <span className="value">{formData.schoolName || invitedContext.school?.name || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Email:</span>
                  <span className="value">{formData.email || invitedContext.userEmail}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Graduation Year:</span>
                  <span className="value">{formData.graduationYear || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="next-steps">
              <h3>While you wait...</h3>
              <p>Feel free to explore our platform and learn more about the Nigeria Alumni Network.</p>
            </div>
          </div>
          
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
            <button 
              className="btn-secondary"
              onClick={() => window.location.reload()}
            >
              Register Another Alumni
            </button>
          </div>
        </div>
      ) : (
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <select
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              >
                <option value="">Select Title</option>
                <option value="Dr.">Dr.</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Chief">Chief</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={invitedContext.isInvited}
                placeholder="Enter your email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="graduationYear">Graduation Year *</label>
              <input
                type="text"
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                placeholder="YYYY"
                maxLength="4"
              />
              {errors.graduationYear && <span className="error-message">{errors.graduationYear}</span>}
            </div>
          </div>
          
          {/* Additional alumni information */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="admissionYear">Admission Year</label>
              <input
                type="text"
                id="admissionYear"
                name="admissionYear"
                value={formData.admissionYear}
                onChange={handleChange}
                placeholder="YYYY"
                maxLength="4"
              />
              {errors.admissionYear && <span className="error-message">{errors.admissionYear}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="currentPosition">Current Position</label>
              <input
                type="text"
                id="currentPosition"
                name="currentPosition"
                value={formData.currentPosition}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentCompany">Current Company</label>
              <input
                type="text"
                id="currentCompany"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
                placeholder="e.g., Acme Corp"
              />
            </div>
            <div className="form-group">
              <label htmlFor="fieldOfStudy">Field of Study</label>
              <input
                type="text"
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                type="url"
                id="linkedin"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="twitter">Twitter</label>
              <input
                type="url"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="facebook">Facebook</label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture URL</label>
              <input
                type="url"
                id="profilePicture"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ minWidth: '100%' }}>
              <label htmlFor="bio">Bio</label>
              <input
                type="text"
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
          
          <div className="form-note">
            <p>* Required fields</p>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary submit-btn"
            disabled={submitting}
          >
            {submitting ? (invitedContext.isInvited ? 'Saving...' : 'Submitting...') : (invitedContext.isInvited ? 'Complete Registration' : 'Register Now')}
          </button>
        </form>
      )}
    </div>
  );
}

export default Register;