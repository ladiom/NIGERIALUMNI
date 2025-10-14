import React, { useState } from 'react';
import supabase from '../supabaseClient';
import './SchoolRegistration.css';

function SchoolRegistration({ onSchoolRegistered, onCancel, disabled = false }) {
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    lga: '',
    level: 'HI',
    foundingYear: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // School levels
  const schoolLevels = [
    { value: 'PR', label: 'Primary School' },
    { value: 'HI', label: 'Secondary School' },
    { value: 'PO', label: 'Polytechnic' },
    { value: 'UN', label: 'University' }
  ];

  // Nigerian states (matching database values)
  const states = [
    'ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA',
    'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO',
    'EKITI', 'ENUGU', 'FCT', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA',
    'KANO', 'KATSINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS',
    'NASARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO',
    'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'
  ];

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.level) {
      newErrors.level = 'School level is required';
    }
    
    if (formData.foundingYear && !/^\d{4}$/.test(formData.foundingYear)) {
      newErrors.foundingYear = 'Please enter a valid 4-digit year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate school code
  const generateSchoolCode = (name, state) => {
    // Take first 3 characters of school name and first 2 of state
    const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const stateCode = state.substring(0, 2).toUpperCase();
    return `${nameCode}${stateCode}`.substring(0, 3);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Generate school code
      const schoolCode = generateSchoolCode(formData.name, formData.state);
      
      // Create school record
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert([{
          name: formData.name.trim(),
          state: formData.state,
          lga: formData.lga.trim() || null,
          level: formData.level,
          school_code: schoolCode,
          founding_year: formData.foundingYear ? parseInt(formData.foundingYear) : null,
          description: formData.description.trim() || null
        }])
        .select()
        .single();

      if (schoolError) {
        throw new Error('Failed to register school: ' + schoolError.message);
      }

      setSubmitting(false);
      setSubmitted(true);
      
      // Notify parent component
      setTimeout(() => {
        onSchoolRegistered(schoolData);
      }, 1500);
      
    } catch (error) {
      console.error('School registration error:', error);
      setErrors({ submit: error.message });
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="school-registration-success">
        <div className="success-icon">✅</div>
        <h3>School Registered Successfully!</h3>
        <p>Your school "{formData.name}" has been registered and is now available for selection.</p>
        <p>You can now proceed with your alumni registration.</p>
        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => onSchoolRegistered({
              id: 'temp',
              name: formData.name,
              state: formData.state,
              lga: formData.lga,
              level: formData.level,
              school_code: generateSchoolCode(formData.name, formData.state)
            })}
          >
            Continue with Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="school-registration">
      <div className="school-registration-header">
        <h3>Register Your School</h3>
        <p>Can't find your school? Register it here and it will be available for selection.</p>
      </div>

      <form className="school-registration-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="school-name">School Name *</label>
            <input
              type="text"
              id="school-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter school name"
              disabled={disabled || submitting}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="school-state">State *</label>
            <select
              id="school-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={disabled || submitting}
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && <span className="error-message">{errors.state}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="school-lga">City/LGA</label>
            <input
              type="text"
              id="school-lga"
              name="lga"
              value={formData.lga}
              onChange={handleChange}
              placeholder="Enter city or LGA"
              disabled={disabled || submitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="school-level">School Level *</label>
            <select
              id="school-level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              disabled={disabled || submitting}
              required
            >
              {schoolLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            {errors.level && <span className="error-message">{errors.level}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="school-founding-year">Founding Year</label>
            <input
              type="text"
              id="school-founding-year"
              name="foundingYear"
              value={formData.foundingYear}
              onChange={handleChange}
              placeholder="YYYY"
              maxLength="4"
              disabled={disabled || submitting}
            />
            {errors.foundingYear && <span className="error-message">{errors.foundingYear}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="school-description">Description</label>
            <textarea
              id="school-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the school (optional)"
              rows="3"
              disabled={disabled || submitting}
            />
          </div>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={submitting || disabled}
          >
            {submitting ? 'Registering School...' : 'Register School'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SchoolRegistration;
