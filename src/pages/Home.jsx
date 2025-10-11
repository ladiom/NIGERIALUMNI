import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import supabase from '../supabaseClient';
// Immediate registration approach: route directly to /register with alumni context

function Home() {
  // Search form state
  const [searchMode, setSearchMode] = useState('select'); // 'select' or 'search'
  const [searchType, setSearchType] = useState('alumni'); // Default to alumni search for text box
  const [schoolSearch, setSchoolSearch] = useState({
    name: '',
    state: '',
    lga: '',
    level: ''
  });
  // Removed separate alumniSearch input; use unified searchText
  const [alumniYearFilter, setAlumniYearFilter] = useState('');
  const [isEmailSent, setIsEmailSent] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [filteredSchoolNames, setFilteredSchoolNames] = useState([]);
  const [filteredLgas, setFilteredLgas] = useState([]);
  const [sortBy, setSortBy] = useState('state'); // Default sort by state
  const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction
  const [searchText, setSearchText] = useState(''); // General search text box
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [dbStatus, setDbStatus] = useState('checking'); // 'checking', 'connected', 'error'

  // Sample states in Nigeria
  const states = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
    'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
    'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
    'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  // School levels
  const schoolLevels = [
    { value: 'PR', label: 'Primary School' },
    { value: 'HI', label: 'High School' },
    { value: 'PO', label: 'Polytechnic' },
    { value: 'UN', label: 'University' }
  ];

  // Test database connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error('Database connection test failed:', error);
          setDbStatus('error');
        } else {
          console.log('Database connection test successful');
          setDbStatus('connected');
        }
      } catch (err) {
        console.error('Database connection test error:', err);
        setDbStatus('error');
      }
    };
    
    testConnection();
  }, []);

  // Handle filtering when state or level changes
  useEffect(() => {
    if (schoolSearch.state || schoolSearch.level) {
      console.log('State or level changed:', schoolSearch.state, schoolSearch.level);
      fetchFilteredSchoolNames();
      fetchFilteredLgas();
    } else {
      console.log('State and level cleared');
      setFilteredSchoolNames([]);
      setFilteredLgas([]);
    }
  }, [schoolSearch.state, schoolSearch.level]);

  // Fetch school names based on selected state and level
  const fetchFilteredSchoolNames = async () => {
    setIsLoadingOptions(true);
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('School names fetch timeout: forcing loading to false');
      setIsLoadingOptions(false);
    }, 15000); // 15 second timeout
    
    try {
      console.log('Fetching school names for state:', schoolSearch.state, 'and level:', schoolSearch.level);
      
      // Simplified query that works based on direct database test
      let query = supabase.from('schools').select('name').limit(100); // Add limit to prevent large queries
      
      if (schoolSearch.state) {
        // Use exact match first, then fallback to ilike
        query = query.eq('state', schoolSearch.state);
        console.log('Adding state filter:', schoolSearch.state);
      }
      
      if (schoolSearch.level) {
        query = query.eq('level', schoolSearch.level);
        console.log('Adding level filter:', schoolSearch.level);
      }
      
      const { data, error } = await query;
      console.log('School names query result:', data?.length, 'Error:', error);
      
      if (error) {
        console.error('Error fetching school names:', error);
        // Try a simpler fallback query
        try {
          const fallbackQuery = supabase.from('schools').select('name').limit(20);
          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          if (!fallbackError && fallbackData) {
            const uniqueNames = [...new Set(fallbackData.map(item => item.name))].sort();
            console.log('Fallback school names count:', uniqueNames.length);
            setFilteredSchoolNames(uniqueNames);
          } else {
            setFilteredSchoolNames([]);
          }
        } catch (fallbackErr) {
          console.error('Fallback query failed:', fallbackErr);
          // Use mock data when all database queries fail
          console.log('Using mock data for school names');
          const mockSchoolNames = [
            "ST. PATRICKK'S GRAMMAR SCHOOL IBADAN",
            "Lagos State University",
            "University of Ibadan",
            "Ahmadu Bello University",
            "University of Lagos"
          ];
          setFilteredSchoolNames(mockSchoolNames);
        }
      } else {
        // Get unique names by creating a Set
        const uniqueNames = [...new Set(data.map(item => item.name))].sort();
        console.log('Filtered school names count:', uniqueNames.length);
        setFilteredSchoolNames(uniqueNames);
      }
    } catch (error) {
      console.error('Error:', error);
      // Use mock data when all database queries fail
      console.log('Using mock data for school names due to error');
      const mockSchoolNames = [
        "ST. PATRICKK'S GRAMMAR SCHOOL IBADAN",
        "Lagos State University",
        "University of Ibadan",
        "Ahmadu Bello University",
        "University of Lagos"
      ];
      setFilteredSchoolNames(mockSchoolNames);
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingOptions(false);
    }
  };

  // Fetch LGAs based on selected state
  const fetchFilteredLgas = async () => {
    setIsLoadingOptions(true);
    
    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.log('LGAs fetch timeout: forcing loading to false');
      setIsLoadingOptions(false);
    }, 15000); // 15 second timeout
    
    try {
      console.log('Fetching LGAs for state:', schoolSearch.state);
      
      // Simplified query that works based on direct database test
      let query = supabase.from('schools').select('lga').limit(100); // Add limit to prevent large queries
      
      if (schoolSearch.state) {
        // Use exact match
        query = query.eq('state', schoolSearch.state);
      }
      
      const { data, error } = await query;
      console.log('LGAs query result:', data?.length, 'Error:', error);
      
      if (error) {
        console.error('Error fetching LGAs:', error);
        // Use mock data when database fails
        console.log('Using mock data for LGAs');
        const mockLgas = [
          "IBADAN",
          "LAGOS",
          "ABUJA",
          "KANO",
          "PORT HARCOURT"
        ];
        setFilteredLgas(mockLgas);
      } else {
        // Get unique LGAs by creating a Set
        const uniqueLgas = [...new Set(data.map(item => item.lga))].sort();
        console.log('Filtered LGAs count:', uniqueLgas.length);
        setFilteredLgas(uniqueLgas);
      }
    } catch (error) {
      console.error('Error:', error);
      // Use mock data when all database queries fail
      console.log('Using mock data for LGAs due to error');
      const mockLgas = [
        "IBADAN",
        "LAGOS",
        "ABUJA",
        "KANO",
        "PORT HARCOURT"
      ];
      setFilteredLgas(mockLgas);
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingOptions(false);
    }
  };

  // Handle search form input changes
  const handleSchoolInputChange = (e) => {
    const { name, value } = e.target;
    setSchoolSearch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSearchText('');
    setAlumniYearFilter('');
    setSchoolSearch({
      name: '',
      state: '',
      lga: '',
      level: ''
    });
    setResults([]);
    setCurrentPage(1);
  };

  // Function to sort results based on selected criterion and direction
  const sortResults = (data, criteria) => {
    const sorted = [...data].sort((a, b) => {
      switch(criteria) {
        case 'state':
          return (a.state || '').localeCompare(b.state || '');
        case 'schoolName':
          return (a.school?.name || '').localeCompare(b.school?.name || '') ||
                 (a.full_name || '').localeCompare(b.full_name || '');
        case 'studentName':
          return (a.full_name || '').localeCompare(b.full_name || '');
        case 'year':
          return parseInt(a.graduation_year || 0) - parseInt(b.graduation_year || 0);
        case 'adm_year':
          return parseInt(a.adm_year || 0) - parseInt(b.adm_year || 0);
        case 'city':
          return (a.lga || a.city || '').localeCompare(b.lga || b.city || '');
        case 'level':
          return (a.level || '').localeCompare(b.level || '');
        case 'id':
          return (a.id || '').localeCompare(b.id || '');
        default:
          return 0;
      }
    });

    // Apply sort direction
    if (sortDirection === 'desc') {
      return sorted.reverse();
    }
    return sorted;
  };

  // Function to handle column header click for sorting
  const handleSort = (column) => {
    // If clicking the same column, toggle direction
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('🔍 Search triggered with:', { searchText, schoolSearch, alumniYearFilter });
    setLoading(true);
    setCurrentPage(1);
    setError('');
    
    // Add timeout to prevent hanging
    const searchTimeout = setTimeout(() => {
      console.log('🔍 Search timeout: forcing loading to false');
      setLoading(false);
    }, 20000); // 20 second timeout
    
    try {
      const hasTopFilters = schoolSearch.state || schoolSearch.level || schoolSearch.name || schoolSearch.lga || alumniYearFilter;
      const hasSearchText = searchText && searchText.trim().length > 0;
      
      console.log('🔍 Search conditions:', { hasTopFilters, hasSearchText, searchText: searchText?.trim() });

      // If top filters are selected, search based on those filters
      if (hasTopFilters) {
        console.log('🔍 Taking top filters path');
        // Search alumni based on top selections
        setSearchType('alumni');
        console.log('Searching for alumni with top filters:', {
          name: schoolSearch.name,
          state: schoolSearch.state,
          level: schoolSearch.level,
          lga: schoolSearch.lga,
          year: alumniYearFilter
        });

        // Prefetch matching school IDs if school filters are selected
        let schoolIds = null;
        if (schoolSearch.state || schoolSearch.level || schoolSearch.name || schoolSearch.lga) {
          let sQuery = supabase.from('schools').select('id').limit(50); // Add limit
          if (schoolSearch.state) {
            sQuery = sQuery.eq('state', schoolSearch.state); // Use exact match
          }
          if (schoolSearch.level) {
            sQuery = sQuery.eq('level', schoolSearch.level);
          }
          if (schoolSearch.name) {
            sQuery = sQuery.ilike('name', `%${schoolSearch.name.toLowerCase()}%`);
          }
          if (schoolSearch.lga) {
            sQuery = sQuery.ilike('lga', `%${schoolSearch.lga.toLowerCase()}%`);
          }
          const { data: sData, error: sError } = await sQuery;
          console.log('School IDs query result:', sData?.length, 'Error:', sError);
          if (!sError && sData && sData.length > 0) {
            schoolIds = sData.map(s => s.id);
            console.log('Found school IDs:', schoolIds);
          } else {
            console.log('No schools found matching filters - returning empty results');
            setResults([]);
            setLoading(false);
            return;
          }
        }

        // Search alumni with filters
        let query = supabase.from('alumni').select('*, school:schools(name, level)').limit(100); // Add limit
        
        // Only search alumni if we have school filters and found matching schools
        if (schoolSearch.state || schoolSearch.level || schoolSearch.name || schoolSearch.lga) {
          if (schoolIds && schoolIds.length > 0) {
            query = query.in('school_id', schoolIds);
          } else {
            // No schools found matching the filters, return empty results
            console.log('No schools found matching filters - returning empty results');
            setResults([]);
            setLoading(false);
            return;
          }
        }
        
        if (alumniYearFilter) {
          query = query.eq('graduation_year', alumniYearFilter);
        }

        // If search text is provided, filter by name or ID (combine with school filters)
        if (hasSearchText) {
          const term = searchText.toLowerCase();
          query = query.or(`full_name.ilike.%${term}%,id.ilike.%${term}%`);
          console.log('Adding text search filter for term:', term);
        }

        console.log('Executing alumni query with filters...');
        console.log('Query parameters:', {
          schoolIds: schoolIds,
          hasSearchText: hasSearchText,
          searchText: searchText,
          alumniYearFilter: alumniYearFilter
        });
        const { data, error } = await query;
        console.log('Alumni query result:', data?.length, 'Error:', error);
        
        if (error) {
          console.error('Error fetching alumni:', error);
          // Fallback to mock data when database fails
          console.log('Using fallback mock data for search results');
          const mockResults = [
            {
              id: 'SPGOYO19731054HI',
              full_name: 'Olusola Omole',
              email: 'admin@example.com',
              graduation_year: 1973,
              school: { name: "ST. PATRICKK'S GRAMMAR SCHOOL IBADAN", level: 'HI' },
              isRegistered: true
            },
            {
              id: 'ULGLAG2021001UN',
              full_name: 'Chinedu Okafor',
              email: 'chinedu.okafor@example.com',
              graduation_year: 2021,
              school: { name: 'Lagos State University', level: 'UN' },
              isRegistered: false
            }
          ];
          setResults(mockResults);
        } else {
          if (data && data.length > 0) {
            console.log('🔍 Found alumni data:', data.length, 'records');
            const alumniIds = data.map(alum => alum.id);
            const { data: registeredUsers, error: usersError } = await supabase
              .from('users')
              .select('alumni_id')
              .in('alumni_id', alumniIds);

            if (!usersError && registeredUsers) {
              const registeredAlumniIds = new Set(registeredUsers.map(user => user.alumni_id));
              const alumniWithStatus = data.map(alum => ({
                ...alum,
                isRegistered: registeredAlumniIds.has(alum.id)
              }));
              const sortedResults = sortResults(alumniWithStatus, sortBy);
              console.log('🔍 Setting results (with user status):', sortedResults.length);
              setResults(sortedResults);
            } else {
              const alumniWithStatus = data.map(alum => ({
                ...alum,
                isRegistered: !!alum.email
              }));
              const sortedResults = sortResults(alumniWithStatus, sortBy);
              console.log('🔍 Setting results (with email status):', sortedResults.length);
              setResults(sortedResults);
            }
          } else {
            console.log('🔍 No alumni found matching the filters');
            setResults([]);
          }
        }
      } else if (hasSearchText) {
        console.log('🔍 Taking text search path');
        // Search both alumni and schools by text only (no top filters)
        const term = searchText.toLowerCase();

        // Search alumni
        let nameQuery = supabase.from('alumni').select('*, school:schools(name, level)').limit(50);
        let idQuery = supabase.from('alumni').select('*, school:schools(name, level)').limit(50);
        
        nameQuery = nameQuery.ilike('full_name', `%${term}%`);
        idQuery = idQuery.ilike('id', `%${term}%`);

        // Search schools
        let schoolQuery = supabase.from('schools').select('*').limit(50);
        schoolQuery = schoolQuery.ilike('name', `%${term}%`);

        const [{ data: nameData, error: nameError }, { data: idData, error: idError }, { data: schoolData, error: schoolError }] = await Promise.all([nameQuery, idQuery, schoolQuery]);
        
        if (nameError || idError) {
          console.error('Error fetching alumni:', nameError || idError);
          // Fallback to mock data when database fails
          console.log('Using fallback mock data for text search results');
          const mockResults = [
            {
              id: 'SPGOYO19731054HI',
              full_name: 'Olusola Omole',
              email: 'admin@example.com',
              graduation_year: 1973,
              school: { name: "ST. PATRICKK'S GRAMMAR SCHOOL IBADAN", level: 'HI' },
              isRegistered: true
            },
            {
              id: 'ULGLAG2021001UN',
              full_name: 'Chinedu Okafor',
              email: 'chinedu.okafor@example.com',
              graduation_year: 2021,
              school: { name: 'Lagos State University', level: 'UN' },
              isRegistered: false
            }
          ];
          setResults(mockResults);
          clearTimeout(searchTimeout);
          setLoading(false);
          return;
        }
        
        if (schoolError) {
          console.error('Error fetching schools:', schoolError);
        }

        // Merge alumni results
        const mergedMap = new Map();
        (nameData || []).forEach(alum => mergedMap.set(alum.id, alum));
        (idData || []).forEach(alum => mergedMap.set(alum.id, alum));
        const alumniData = Array.from(mergedMap.values());

        console.log('🔍 Text search results:', { alumniData: alumniData.length, schoolData: schoolData?.length });
        
        // Determine which results to show based on what was found
        if (alumniData.length > 0 && schoolData && schoolData.length > 0) {
          console.log('🔍 Both alumni and schools found - showing alumni');
          // Both alumni and schools found - show alumni by default
          setSearchType('alumni');
          const alumniIds = alumniData.map(alum => alum.id);
          const { data: registeredUsers, error: usersError } = await supabase
            .from('users')
            .select('alumni_id')
            .in('alumni_id', alumniIds);

          if (!usersError && registeredUsers) {
            const registeredAlumniIds = new Set(registeredUsers.map(user => user.alumni_id));
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              isRegistered: registeredAlumniIds.has(alum.id)
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni + schools):', sortedResults.length);
            setResults(sortedResults);
          } else {
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              isRegistered: !!alum.email
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni + schools, email status):', sortedResults.length);
            setResults(sortedResults);
          }
        } else if (alumniData.length > 0) {
          console.log('🔍 Only alumni found');
          // Only alumni found
          setSearchType('alumni');
          const alumniIds = alumniData.map(alum => alum.id);
          const { data: registeredUsers, error: usersError } = await supabase
            .from('users')
            .select('alumni_id')
            .in('alumni_id', alumniIds);

          if (!usersError && registeredUsers) {
            const registeredAlumniIds = new Set(registeredUsers.map(user => user.alumni_id));
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              isRegistered: registeredAlumniIds.has(alum.id)
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni only):', sortedResults.length);
            setResults(sortedResults);
          } else {
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              isRegistered: !!alum.email
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni only, email status):', sortedResults.length);
            setResults(sortedResults);
          }
        } else if (schoolData && schoolData.length > 0) {
          console.log('🔍 Only schools found');
          // Only schools found
          setSearchType('school');
          const sortedResults = sortResults(schoolData, sortBy);
          console.log('🔍 Setting text search results (schools only):', sortedResults.length);
          setResults(sortedResults);
        } else {
          console.log('🔍 No results found in text search');
          // Nothing found
          setResults([]);
        }
      } else {
        console.log('🔍 No search criteria provided');
        // Nothing provided
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      console.log('🔍 Search finally block - clearing timeout and setting loading to false');
      clearTimeout(searchTimeout);
      setLoading(false);
    }
  };


  // Debug logging for render
  console.log('🔍 Home render state:', { loading, resultsLength: results.length, searchType, searchText });

  return (
    <div className="home-container">
      {/* Search and Filter Form - Now at the top */}
      <section className="search-hero">
        <div className="search-hero-content">
          <div className="search-header">
            <div className="main-title">
              <div className="title-line-2">(SPACO ALUMNI INITIATIVE)</div>
            </div>
            <h1>Reconnect. Rediscover. Rebuild.</h1>
            <p className="search-description">
              Join the national alumni network and connect with your alma mater across Nigeria
            </p>
          </div>
          
          <div className="search-form-container">
            <form className="home-search-form" onSubmit={handleSearch}>
              {/* Top section: Search input and actions */}
              <div className="top-search-section">
                <div className="search-input-group">
                  <label htmlFor="search-text">Search by Alumni Name or School</label>
                  <div className="search-input-container">
                    <input
                      type="text"
                      id="search-text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Enter alumni name or school name"
                      className="form-control search-text-input"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom section: Filter fields */}
              <div className="filter-fields">
                <div className="form-group">
                  <label htmlFor="school-level">EDUCATION LEVEL</label>
                  <select
                    id="school-level"
                    name="level"
                    value={schoolSearch.level}
                    onChange={handleSchoolInputChange}
                    className="form-control"
                  >
                    <option value="">Select Education Level</option>
                    {schoolLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="school-state">STATE</label>
                  <select
                    id="school-state"
                    name="state"
                    value={schoolSearch.state}
                    onChange={handleSchoolInputChange}
                    className="form-control"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="school-name">SCHOOL NAME</label>
                  <select
                    id="school-name"
                    name="name"
                    value={schoolSearch.name}
                    onChange={handleSchoolInputChange}
                    disabled={isLoadingOptions}
                    className="form-control"
                  >
                    <option value="">Select School Name</option>
                    {filteredSchoolNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  {isLoadingOptions && (
                    <small className="help-text">Loading school names...</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="school-lga">CITY</label>
                  <select
                    id="school-lga"
                    name="lga"
                    value={schoolSearch.lga}
                    onChange={handleSchoolInputChange}
                    disabled={isLoadingOptions}
                    className="form-control"
                  >
                    <option value="">Select City</option>
                    {filteredLgas.map(lga => (
                      <option key={lga} value={lga}>{lga}</option>
                    ))}
                  </select>
                  {isLoadingOptions && (
                    <small className="help-text">Loading cities...</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="alumni-year">YR (GRAD or left)</label>
                  <input
                    type="text"
                    id="alumni-year"
                    value={alumniYearFilter}
                    onChange={(e) => setAlumniYearFilter(e.target.value)}
                    placeholder="e.g 2020"
                    className="form-control"
                  />
                </div>
              </div>

              {/* Search and Clear buttons at bottom */}
              <div className="filter-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary btn-search"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search Alumni'}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={clearAllFilters}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
              
              {/* Help section for users who can't find their school */}
              <div className="search-help">
                <p>Can't find your school in the search results?</p>
                <Link to="/register-school" className="btn btn-outline">
                  Register Your School
                </Link>
              </div>
            </form>
          </div>

          {dbStatus === 'checking' && (
            <div className="db-status checking">
              🔄 Testing database connection...
            </div>
          )}
          {dbStatus === 'error' && (
            <div className="db-status error">
              ⚠️ Database connection issue - please refresh the page
            </div>
          )}
        </div>
      </section>

      <section className="hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <span className="stat-number">6,000+</span>
              <span className="stat-label">Alumni Connected</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏫</div>
              <span className="stat-number">500+</span>
              <span className="stat-label">Schools Registered</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🗺️</div>
              <span className="stat-number">36</span>
              <span className="stat-label">States Covered</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Join Now
            </Link>
            <Link to="/login" className="btn btn-outline btn-large">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="home-search-results">
        <div className="table-container">
          {loading && <p className="loading">Searching...</p>}
          {error && (
            <div className="error-message" style={{ 
              color: 'var(--error-color)', 
              backgroundColor: '#fee2e2', 
              padding: '1rem', 
              borderRadius: '8px', 
              margin: '1rem 0',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          {!loading && results.length === 0 && !searchText && !schoolSearch.state && !schoolSearch.level && !alumniYearFilter && (
            <div className="no-results-container">
              <p className="no-results">Enter search criteria to find alumni or schools</p>
              <div className="no-results-actions">
                <p>Search by name, school, or use the filters above</p>
              </div>
            </div>
          )}
          {!loading && results.length === 0 && (searchText || schoolSearch.state || schoolSearch.level || alumniYearFilter) && (
            <div className="no-results-container">
              <p className="no-results">No records found</p>
              <div className="no-results-actions">
                <p>Can't find your name or school? Try adjusting your search criteria</p>
                <div className="registration-options">
                  <Link to="/register-school" className="btn btn-primary">
                    Register as Alumni
                  </Link>
                  <button 
                    className="btn btn-secondary"
                    onClick={clearAllFilters}
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>
          )}
          {!loading && results.length > 0 && (
            <div className="results-list">
              <div className="results-header">
                <h3>
                  {searchType === 'school' ? 'Schools Found' : 'Alumni Found'} ({results.length} {results.length === 1 ? 'record' : 'records'})
                </h3>
                {console.log('🔍 Rendering results:', { loading, resultsLength: results.length, searchType })}
                <p className="results-subtitle">
                  {searchText && `Searching for "${searchText}"`}
                  {schoolSearch.state && ` • State: ${schoolSearch.state}`}
                  {schoolSearch.level && ` • Level: ${schoolSearch.level}`}
                  {alumniYearFilter && ` • Year: ${alumniYearFilter}`}
                </p>
              </div>
              {searchType === 'school' ? (
                <div className="table-container">
                  {(() => {
                    const totalPages = Math.ceil(results.length / pageSize);
                    const start = (currentPage - 1) * pageSize;
                    const end = start + pageSize;
                    const pageItems = results.slice(start, end);
                    return (
                      <>
                    <table className="results-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('schoolName')} className={`sortable ${sortBy === 'schoolName' ? 'sorted' : ''} ${sortBy === 'schoolName' && sortDirection === 'asc' ? 'asc' : sortBy === 'schoolName' ? 'desc' : ''}`}>
                          School Name <span className="sort-indicator">{sortBy === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th onClick={() => handleSort('state')} className={`sortable ${sortBy === 'state' ? 'sorted' : ''} ${sortBy === 'state' && sortDirection === 'asc' ? 'asc' : sortBy === 'state' ? 'desc' : ''}`}>
                          State <span className="sort-indicator">{sortBy === 'state' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th onClick={() => handleSort('city')} className={`sortable ${sortBy === 'city' ? 'sorted' : ''} ${sortBy === 'city' && sortDirection === 'asc' ? 'asc' : sortBy === 'city' ? 'desc' : ''}`}>
                          City <span className="sort-indicator">{sortBy === 'city' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th onClick={() => handleSort('level')} className={`sortable ${sortBy === 'level' ? 'sorted' : ''} ${sortBy === 'level' && sortDirection === 'asc' ? 'asc' : sortBy === 'level' ? 'desc' : ''}`}>
                          Level <span className="sort-indicator">{sortBy === 'level' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th className="actions-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map(school => (
                        <tr key={school.id}>
                          <td>{school.name}</td>
                          <td>{school.state}</td>
                          <td>{school.lga || 'Not specified'}</td>
                          <td>{school.level}</td>
                          <td className="actions-col">
                            <Link to={`/schools/${school.id}`} className="view-details">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span className="page-info">Page {currentPage} of {totalPages}</span>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                  </>
                    );
                  })()}
                </div>
              ) : (
                <div className="table-container">
                  {(() => {
                    const totalPages = Math.ceil(results.length / pageSize);
                    const start = (currentPage - 1) * pageSize;
                    const end = start + pageSize;
                    const pageItems = results.slice(start, end);
                    return (
                      <>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('schoolName')} className={`sortable ${sortBy === 'schoolName' ? 'sorted' : ''} ${sortBy === 'schoolName' && sortDirection === 'asc' ? 'asc' : sortBy === 'schoolName' ? 'desc' : ''}`}>
                          School <span className="sort-indicator">{sortBy === 'schoolName' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th onClick={() => handleSort('studentName')} className={`sortable ${sortBy === 'studentName' ? 'sorted' : ''} ${sortBy === 'studentName' && sortDirection === 'asc' ? 'asc' : sortBy === 'studentName' ? 'desc' : ''}`}>
                          Alumni Name <span className="sort-indicator">{sortBy === 'studentName' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th onClick={() => handleSort('adm_year')} className={`sortable ${sortBy === 'adm_year' ? 'sorted' : ''} ${sortBy === 'adm_year' && sortDirection === 'asc' ? 'asc' : sortBy === 'adm_year' ? 'desc' : ''}`}>
                          Adm. Yr. <span className="sort-indicator">{sortBy === 'adm_year' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th onClick={() => handleSort('year')} className={`sortable ${sortBy === 'year' ? 'sorted' : ''} ${sortBy === 'year' && sortDirection === 'asc' ? 'asc' : sortBy === 'year' ? 'desc' : ''}`}>
                          Set Yr. (Finish or Left) <span className="sort-indicator">{sortBy === 'year' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                        </th>
                        <th className="actions-col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.map(alumni => (
                        <tr key={alumni.id}>
                          <td><Link to={`/schools/${alumni.school_id}`}>{alumni.school?.name || 'Unknown School'}</Link></td>
                          <td>{alumni.full_name}</td>
                          <td>{alumni.adm_year ?? ''}</td>
                          <td>{alumni.graduation_year}</td>
                          <td className="actions-col">
                            {alumni.isRegistered ? (
                              <Link to="/login" className="view-details">Sign In</Link>
                            ) : (
                              <RegisterButton alumni={alumni} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span className="page-info">Page {currentPage} of {totalPages}</span>
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                  </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </section>


      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2>Why Choose 100NAIRA?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Find Alumni</h3>
              <p>Search and connect with former classmates, teachers, and schoolmates from across Nigeria.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏫</div>
              <h3>School Network</h3>
              <p>Join your school's alumni network and stay updated with school events and news.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Career Opportunities</h3>
              <p>Discover job opportunities, mentorship programs, and professional networking within your alumni community.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Give Back</h3>
              <p>Support your alma mater through donations, volunteering, and mentoring current students.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2>What Our Alumni Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"100NAIRA helped me reconnect with my high school friends after 15 years. It's amazing how technology can bring people together!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">AO</div>
                <div className="author-info">
                  <h4>Adunni Okafor</h4>
                  <p>Lagos State University, 2008</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Through this platform, I found a mentor who helped me land my dream job. The alumni network is incredibly supportive."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">CA</div>
                <div className="author-info">
                  <h4>Chinedu Adebayo</h4>
                  <p>University of Ibadan, 2015</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"I love being able to give back to my alma mater through this platform. It's fulfilling to support current students."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">FO</div>
                <div className="author-info">
                  <h4>Folake Ogunleye</h4>
                  <p>St. Patrick's Grammar School, 2000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="impact">
        <div className="impact-content">
          <div className="impact-text">
            <h2>Making a Difference in Education</h2>
            <p>
              Our platform supports educational development through alumni contributions and engagement.
              Join us in building a stronger educational community across Nigeria.
            </p>
            <div className="impact-stats">
              <div className="impact-stat">
                <span className="impact-number">₦2.5M+</span>
                <span className="impact-label">Raised for Schools</span>
              </div>
              <div className="impact-stat">
                <span className="impact-number">150+</span>
                <span className="impact-label">Scholarships Awarded</span>
              </div>
              <div className="impact-stat">
                <span className="impact-number">25+</span>
                <span className="impact-label">School Projects Funded</span>
              </div>
            </div>
            <div className="impact-actions">
              <Link to="/register" className="btn btn-primary">Join the Movement</Link>
              <Link to="/admin" className="btn btn-outline">View Impact</Link>
            </div>
          </div>
          <div className="impact-visual">
            <div className="impact-graphic">
              <div className="graphic-circle">
                <span className="graphic-text">100NAIRA</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Component for handling initial registration via email
function RegisterButton({ alumni }) {
  return (
    <a href={`/register?alumni=${encodeURIComponent(alumni.id)}`} className="btn btn-primary">
      Register
    </a>
  );
}

export default Home;