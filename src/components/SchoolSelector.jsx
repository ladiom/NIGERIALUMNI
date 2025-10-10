import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import SchoolRegistration from './SchoolRegistration';
import './SchoolSelector.css';

function SchoolSelector({ onSchoolSelect, selectedSchool, disabled = false }) {
  const [searchFilters, setSearchFilters] = useState({
    state: '',
    level: '',
    city: ''
  });
  
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);

  // School levels
  const schoolLevels = [
    { value: 'PR', label: 'Primary School' },
    { value: 'HI', label: 'High School' },
    { value: 'PO', label: 'Polytechnic' },
    { value: 'UN', label: 'University' }
  ];

  // Nigerian states
  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // Fetch schools based on filters
  const fetchSchools = async () => {
    if (!searchFilters.state) {
      setFilteredSchools([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let query = supabase
        .from('schools')
        .select('id, name, state, lga, level, school_code')
        .eq('state', searchFilters.state);

      if (searchFilters.level) {
        query = query.eq('level', searchFilters.level);
      }

      if (searchFilters.city) {
        query = query.ilike('lga', `%${searchFilters.city}%`);
      }

      const { data, error } = await query.order('name');

      if (error) {
        throw error;
      }

      setFilteredSchools(data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools. Please try again.');
      setFilteredSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch schools when filters change
  useEffect(() => {
    fetchSchools();
  }, [searchFilters.state, searchFilters.level, searchFilters.city]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset dependent fields when state changes
    if (field === 'state') {
      setSearchFilters(prev => ({
        ...prev,
        level: '',
        city: ''
      }));
    } else if (field === 'level') {
      setSearchFilters(prev => ({
        ...prev,
        city: ''
      }));
    }
  };

  // Handle school selection
  const handleSchoolSelect = (school) => {
    onSchoolSelect(school);
  };

  // Clear selection
  const clearSelection = () => {
    onSchoolSelect(null);
  };

  // Handle school registration
  const handleSchoolRegistered = (school) => {
    setShowSchoolRegistration(false);
    onSchoolSelect(school);
  };

  // Cancel school registration
  const handleCancelSchoolRegistration = () => {
    setShowSchoolRegistration(false);
  };

  return (
    <div className="school-selector">
      <div className="school-selector-header">
        <h3>Select Your School</h3>
        <p>Choose your school from the database to register as an alumni</p>
      </div>

      {selectedSchool ? (
        <div className="selected-school">
          <div className="selected-school-info">
            <h4>{selectedSchool.name}</h4>
            <p>
              {selectedSchool.lga && `${selectedSchool.lga}, `}
              {selectedSchool.state}
              {selectedSchool.level && ` • ${schoolLevels.find(l => l.value === selectedSchool.level)?.label}`}
            </p>
            <p className="school-code">School Code: {selectedSchool.school_code}</p>
          </div>
          <button 
            type="button" 
            onClick={clearSelection}
            className="btn-secondary"
            disabled={disabled}
          >
            Change School
          </button>
        </div>
      ) : showSchoolRegistration ? (
        <SchoolRegistration
          onSchoolRegistered={handleSchoolRegistered}
          onCancel={handleCancelSchoolRegistration}
          disabled={disabled}
        />
      ) : (
        <div className="school-search">
          <div className="search-filters">
            <div className="filter-group">
              <label htmlFor="state-filter">State *</label>
              <select
                id="state-filter"
                value={searchFilters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                disabled={disabled}
                required
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="level-filter">School Level</label>
              <select
                id="level-filter"
                value={searchFilters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                disabled={disabled || !searchFilters.state}
              >
                <option value="">All Levels</option>
                {schoolLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="city-filter">City/LGA</label>
              <input
                type="text"
                id="city-filter"
                value={searchFilters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Filter by city or LGA"
                disabled={disabled || !searchFilters.state}
              />
            </div>
          </div>

          <div className="search-actions">
            <button 
              type="button"
              className="btn-register-school-inline"
              onClick={() => setShowSchoolRegistration(true)}
              disabled={disabled}
            >
              Can't find your school? Register it here
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="schools-list">
            {isLoading ? (
              <div className="loading-message">
                <div className="spinner"></div>
                <p>Loading schools...</p>
              </div>
            ) : filteredSchools.length > 0 ? (
              <div className="schools-grid">
                {filteredSchools.map(school => (
                  <div 
                    key={school.id} 
                    className="school-card"
                    onClick={() => handleSchoolSelect(school)}
                  >
                    <div className="school-card-header">
                      <h4>{school.name}</h4>
                      <span className="school-level">
                        {schoolLevels.find(l => l.value === school.level)?.label}
                      </span>
                    </div>
                    <div className="school-card-details">
                      <p className="school-location">
                        {school.lga && `${school.lga}, `}
                        {school.state}
                      </p>
                      <p className="school-code">Code: {school.school_code}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchFilters.state ? (
              <div className="no-schools-message">
                <p>No schools found matching your criteria.</p>
                <p>Can't find your school? Register it and it will be available for selection.</p>
                <button 
                  type="button"
                  className="btn-register-school"
                  onClick={() => setShowSchoolRegistration(true)}
                  disabled={disabled}
                >
                  Register Your School
                </button>
              </div>
            ) : (
              <div className="select-state-message">
                <p>Please select a state to see available schools.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolSelector;
