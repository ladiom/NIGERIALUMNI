import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import SchoolRegistration from './SchoolRegistration';
import './SchoolSelector.css';

function SchoolSelector({ onSchoolSelect, selectedSchool, disabled = false }) {
  const [searchFilters, setSearchFilters] = useState({
    state: '',
    level: 'HI', // Default to Secondary School
    city: '',
    name: '' // Add name search
  });
  
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Fetch schools based on filters
  const fetchSchools = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching schools with filters:', searchFilters);
      
      let query = supabase
        .from('schools')
        .select('id, name, state, lga, level, school_code')
        .limit(100); // Limit to prevent large queries

      // Apply filters if provided
      if (searchFilters.state) {
        console.log('🔍 Adding state filter:', searchFilters.state);
        // Use case-insensitive search for state
        query = query.ilike('state', searchFilters.state);
      }

      if (searchFilters.level) {
        console.log('🔍 Adding level filter:', searchFilters.level);
        query = query.eq('level', searchFilters.level);
      }

      if (searchFilters.city) {
        console.log('🔍 Adding city filter:', searchFilters.city);
        query = query.ilike('lga', `%${searchFilters.city}%`);
      }

      if (searchFilters.name) {
        console.log('🔍 Adding name filter:', searchFilters.name);
        query = query.ilike('name', `%${searchFilters.name}%`);
      }

      console.log('🔍 Executing query...');
      const { data, error } = await query.order('name');

      if (error) {
        console.error('🔍 Query error:', error);
        throw error;
      }

      console.log('🔍 Query result:', data?.length, 'schools found');
      console.log('🔍 Schools data:', data);
      
      // Sort the data
      const sortedData = (data || []).sort((a, b) => {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';
        
        // Handle special cases
        if (sortField === 'lga') {
          aValue = a.lga || '';
          bValue = b.lga || '';
        }
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      setFilteredSchools(sortedData);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Failed to load schools. Please try again.');
      setFilteredSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch schools when component mounts and when filters change
  useEffect(() => {
    fetchSchools();
  }, [searchFilters.state, searchFilters.level, searchFilters.city, searchFilters.name]);

  // Fetch schools on component mount
  useEffect(() => {
    fetchSchools();
  }, []);

  // Re-sort data when sort field or direction changes
  useEffect(() => {
    if (filteredSchools.length > 0) {
      const sortedData = [...filteredSchools].sort((a, b) => {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';
        
        // Handle special cases
        if (sortField === 'lga') {
          aValue = a.lga || '';
          bValue = b.lga || '';
        }
        
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      setFilteredSchools(sortedData);
    }
  }, [sortField, sortDirection]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
              <label htmlFor="name-filter">School Name</label>
              <input
                type="text"
                id="name-filter"
                value={searchFilters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                placeholder="Search by school name"
                disabled={disabled}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="state-filter">State</label>
              <select
                id="state-filter"
                value={searchFilters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                disabled={disabled}
              >
                <option value="">All States</option>
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
                disabled={disabled}
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
                disabled={disabled}
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
              <div className="schools-list">
                <div className="schools-list-header">
                  <div className="header-name" onClick={() => handleSort('name')}>
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                  <div className="header-state" onClick={() => handleSort('state')}>
                    State {sortField === 'state' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                  <div className="header-location" onClick={() => handleSort('lga')}>
                    City/LGA {sortField === 'lga' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                  <div className="header-level" onClick={() => handleSort('level')}>
                    Level {sortField === 'level' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </div>
                  <div className="header-action">Action</div>
                </div>
                {filteredSchools.map(school => (
                  <div 
                    key={school.id} 
                    className="school-list-item"
                  >
                    <div className="school-list-content">
                      <div className="school-list-main">
                        <h4 className="school-name">{school.name}</h4>
                        <span className="school-state">{school.state}</span>
                        <span className="school-location">{school.lga || 'N/A'}</span>
                        <span className="school-level">
                          {schoolLevels.find(l => l.value === school.level)?.label}
                        </span>
                      </div>
                    </div>
                    <div className="school-list-action">
                      <button 
                        type="button"
                        className="btn-select-school"
                        onClick={() => handleSchoolSelect(school)}
                        disabled={disabled}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SchoolSelector;
