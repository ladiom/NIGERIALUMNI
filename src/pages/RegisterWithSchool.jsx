import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SchoolSelector from '../components/SchoolSelector';
import supabase from '../supabaseClient';
import { enqueueRegistrationReceivedEmail } from '../utils/registration';
import './RegisterWithSchool.css';

function RegisterWithSchool() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
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
  
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);
  const [existingAlumniId, setExistingAlumniId] = useState(null);

  const location = useLocation();

  // Pre-populate form with existing alumni data
  useEffect(() => {
    const prePopulateForm = async () => {
      try {
        // Check for alumni data in localStorage (from Home.jsx)
        const storedAlumni = localStorage.getItem('selectedAlumni');
        if (storedAlumni) {
          const alumniData = JSON.parse(storedAlumni);
          console.log('Pre-populating form with stored alumni data:', alumniData);
          
          // Pre-populate form fields
          setFormData(prev => ({
            ...prev,
            fullName: alumniData.full_name || '',
            graduationYear: alumniData.graduation_year || '',
            admissionYear: alumniData.adm_year || alumniData.admission_year || '',
            currentPosition: alumniData.current_position || '',
            currentCompany: alumniData.current_company || '',
            fieldOfStudy: alumniData.field_of_study || '',
            bio: alumniData.bio || '',
            profilePicture: alumniData.profile_picture || '',
            linkedin: alumniData.linkedin || '',
            twitter: alumniData.twitter || '',
            facebook: alumniData.facebook || '',
            phoneNumber: alumniData.phone_number || '',
            email: alumniData.email || ''
          }));
          
          // Set school if available
          if (alumniData.school) {
            setSelectedSchool({
              id: alumniData.school_id,
              name: alumniData.school.name,
              state: alumniData.school.state,
              lga: alumniData.school.lga,
              level: alumniData.school.level
            });
          }
          
          setIsUpdatingExisting(true);
          setExistingAlumniId(alumniData.id);
          
          // Clear localStorage after using the data
          localStorage.removeItem('selectedAlumni');
          return;
        }
        
        // Check for alumni ID in URL parameters (from Search.jsx)
        const urlParams = new URLSearchParams(location.search);
        const alumniId = urlParams.get('alumni');
        if (alumniId) {
          console.log('Fetching alumni data for ID:', alumniId);
          
          // Fetch alumni data from database
          const { data: alumniData, error } = await supabase
            .from('alumni')
            .select(`
              *,
              school:schools(name, state, lga, level)
            `)
            .eq('id', alumniId)
            .single();
          
          if (error) {
            console.error('Error fetching alumni data:', error);
            return;
          }
          
          if (alumniData) {
            console.log('Pre-populating form with fetched alumni data:', alumniData);
            
            // Pre-populate form fields
            setFormData(prev => ({
              ...prev,
              fullName: alumniData.full_name || '',
              graduationYear: alumniData.graduation_year || '',
              admissionYear: alumniData.adm_year || alumniData.admission_year || '',
              currentPosition: alumniData.current_position || '',
              currentCompany: alumniData.current_company || '',
              fieldOfStudy: alumniData.field_of_study || '',
              bio: alumniData.bio || '',
              profilePicture: alumniData.profile_picture || '',
              linkedin: alumniData.linkedin || '',
              twitter: alumniData.twitter || '',
              facebook: alumniData.facebook || '',
              phoneNumber: alumniData.phone_number || '',
              email: alumniData.email || ''
            }));
            
            // Set school if available
            if (alumniData.school) {
              setSelectedSchool({
                id: alumniData.school_id,
                name: alumniData.school.name,
                state: alumniData.school.state,
                lga: alumniData.school.lga,
                level: alumniData.school.level
              });
            }
            
            setIsUpdatingExisting(true);
            setExistingAlumniId(alumniData.id);
          }
        }
      } catch (error) {
        console.error('Error pre-populating form:', error);
      }
    };
    
    prePopulateForm();
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

  // Handle school selection
  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    // Clear school-related errors
    if (errors.school) {
      setErrors(prev => ({
        ...prev,
        school: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.graduationYear.trim()) {
      newErrors.graduationYear = 'Graduation year is required';
    } else if (!/^\d{4}$/.test(formData.graduationYear)) {
      newErrors.graduationYear = 'Please enter a valid 4-digit year';
    }
    
    if (!selectedSchool) {
      newErrors.school = 'Please select your school';
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
      let alumniId = existingAlumniId;
      
      if (isUpdatingExisting && existingAlumniId) {
        // Update existing alumni record
        console.log('Updating existing alumni record:', existingAlumniId);
        
        const { data: alumniData, error: alumniError } = await supabase
          .from('alumni')
          .update({
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            graduation_year: parseInt(formData.graduationYear),
            school_id: selectedSchool.id,
            adm_year: formData.admissionYear ? parseInt(formData.admissionYear) : null,
            current_position: formData.currentPosition || null,
            current_company: formData.currentCompany || null,
            field_of_study: formData.fieldOfStudy || null,
            bio: formData.bio || null,
            profile_picture: formData.profilePicture || null,
            linkedin: formData.linkedin || null,
            twitter: formData.twitter || null,
            facebook: formData.facebook || null
          })
          .eq('id', existingAlumniId)
          .select();

        if (alumniError) {
          throw new Error('Failed to update alumni record: ' + alumniError.message);
        }
        
        if (!alumniData || alumniData.length === 0) {
          throw new Error('No alumni record was updated. The record may not exist or you may not have permission to update it.');
        }
        
        console.log('Successfully updated alumni record:', alumniData[0]);
      } else {
        // Create new alumni record
        console.log('Creating new alumni record');
        
        // Step 1: Register user account
        const registerResult = await register(
          formData.email, 
          formData.password, 
          formData.fullName
        );
        
        if (!registerResult.success) {
          throw new Error(registerResult.error.message || 'Registration failed');
        }

        // Step 2: Create alumni record
        alumniId = generateAlumniId(selectedSchool, formData.graduationYear);
        
        const { data: alumniData, error: alumniError } = await supabase
          .from('alumni')
          .insert([{
            id: alumniId,
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            email: formData.email,
            graduation_year: parseInt(formData.graduationYear),
            school_id: selectedSchool.id,
            adm_year: formData.admissionYear ? parseInt(formData.admissionYear) : null,
            current_position: formData.currentPosition || null,
            current_company: formData.currentCompany || null,
            field_of_study: formData.fieldOfStudy || null,
            bio: formData.bio || null,
            profile_picture: formData.profilePicture || null,
            linkedin: formData.linkedin || null,
            twitter: formData.twitter || null,
            facebook: formData.facebook || null
          }])
          .select()
          .single();

        if (alumniError) {
          throw new Error('Failed to create alumni record: ' + alumniError.message);
        }

        // Step 3: Create pending registration
        const { error: pendingError } = await supabase
          .from('pending_registrations')
          .insert([{
            alumni_id: alumniId,
            email: formData.email,
            status: 'pending'
          }]);

        if (pendingError) {
          console.warn('Failed to create pending registration:', pendingError);
        }
      }

      // Step 4: Queue notification email
      try {
        await enqueueRegistrationReceivedEmail({
          toEmail: formData.email,
          toName: formData.fullName,
          alumniId: alumniId,
          schoolName: selectedSchool.name
        });
      } catch (emailError) {
        console.warn('Failed to queue email notification:', emailError);
      }

      setSubmitting(false);
      setSubmitted(true);
      
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
      setSubmitting(false);
    }
  };

  // Generate alumni ID based on school code, state, year, and sequence
  const generateAlumniId = (school, graduationYear) => {
    const schoolCode = school.school_code;
    const stateCode = school.state.substring(0, 2).toUpperCase();
    const year = graduationYear.toString().slice(-2);
    const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const level = school.level;
    
    return `${schoolCode}${stateCode}${year}${sequence}${level}`;
  };

  if (submitted) {
    return (
      <div className="register-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Registration Submitted Successfully!</h2>
          <p>Thank you for registering with Nigeria Alumni Network (NAN).</p>
          <p>Your registration is now pending approval.</p>
          <p>A confirmation email will be sent to <strong>{formData.email}</strong>.</p>
          <p>You'll receive an email with your unique alumni ID once approved.</p>
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Login to Your Account
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-header">
        <h1>{isUpdatingExisting ? 'Update Your Alumni Profile' : 'Register as Alumni'}</h1>
        <p>{isUpdatingExisting ? 'Update your information in the Nigeria Alumni Network' : 'Join the Nigeria Alumni Network by registering with your school'}</p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        {/* School Selection */}
        <div className="form-section">
          <SchoolSelector 
            onSchoolSelect={handleSchoolSelect}
            selectedSchool={selectedSchool}
            disabled={submitting}
          />
          {errors.school && <span className="error-message">{errors.school}</span>}
        </div>

        {/* Personal Information */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={submitting}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter your phone number"
                disabled={submitting}
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                disabled={submitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                disabled={submitting}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={submitting}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="form-section">
          <h3>Academic Information</h3>
          <div className="form-row">
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
                disabled={submitting}
              />
              {errors.graduationYear && <span className="error-message">{errors.graduationYear}</span>}
            </div>
            
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
                disabled={submitting}
              />
              {errors.admissionYear && <span className="error-message">{errors.admissionYear}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fieldOfStudy">Field of Study</label>
              <input
                type="text"
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="form-section">
          <h3>Professional Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentPosition">Current Position</label>
              <input
                type="text"
                id="currentPosition"
                name="currentPosition"
                value={formData.currentPosition}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
                disabled={submitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="currentCompany">Current Company</label>
              <input
                type="text"
                id="currentCompany"
                name="currentCompany"
                value={formData.currentCompany}
                onChange={handleChange}
                placeholder="e.g., Acme Corp"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Social Media & Additional Info */}
        <div className="form-section">
          <h3>Social Media & Additional Information</h3>
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="3"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        {/* Form Note */}
        <div className="form-note">
          <p>* Required fields</p>
          <p>Your registration will be pending approval. You'll receive an email notification once approved.</p>
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-primary submit-btn"
          disabled={submitting || !selectedSchool}
        >
          {submitting ? (isUpdatingExisting ? 'Updating...' : 'Registering...') : (isUpdatingExisting ? 'Update Profile' : 'Register as Alumni')}
        </button>
      </form>
    </div>
  );
}

export default RegisterWithSchool;
