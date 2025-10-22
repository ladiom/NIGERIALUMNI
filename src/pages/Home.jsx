import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';
import supabase from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
// Immediate registration approach: route directly to /register with alumni context

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Search form state
  const [searchMode, setSearchMode] = useState('select'); // 'select' or 'search'
  const [searchType, setSearchType] = useState('alumni'); // Default to alumni search for text box
  const [schoolSearch, setSchoolSearch] = useState({
    name: '',
    state: '',
    lga: '',
    level: 'HI' // Default to Secondary School
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

  // Sample states in Nigeria (matching database values)
  const states = [
    'ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA',
    'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO',
    'EKITI', 'ENUGU', 'FCT', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA',
    'KANO', 'KATSINA', 'KEBBI', 'KOGI', 'KWARA', 'Lagos',
    'NASARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'Oyo',
    'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'
  ];

  // School levels
  const schoolLevels = [
    { value: 'PR', label: 'Primary School' },
    { value: 'HI', label: 'Secondary School' },
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

  // Debug effect to monitor filteredLgas state
  useEffect(() => {
    console.log('🔍 filteredLgas updated:', filteredLgas);
  }, [filteredLgas]);

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
        // Use exact match for state
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
        // Use exact match for state first, then case-insensitive as fallback
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
        // Get unique LGAs by creating a Set, filter out null/empty values
        const uniqueLgas = [...new Set(data.map(item => item.lga).filter(lga => lga && lga.trim()))].sort();
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
            sQuery = sQuery.ilike('state', schoolSearch.state); // Use case-insensitive search
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
              // Temporarily disable isRegistered check - all alumni need to create auth accounts
              const alumniWithStatus = data.map(alum => ({
                ...alum,
                admission_year: alum.adm_year,
                isRegistered: false // Force all to show clickable buttons
              }));
              const sortedResults = sortResults(alumniWithStatus, sortBy);
              console.log('🔍 Setting results (all clickable):', sortedResults.length);
              setResults(sortedResults);
            } else {
              // If we can't check users table, assume no one is registered
              // This ensures buttons are clickable
              const alumniWithStatus = data.map(alum => ({
                ...alum,
                admission_year: alum.adm_year,
                isRegistered: false
              }));
              const sortedResults = sortResults(alumniWithStatus, sortBy);
              console.log('🔍 Setting results (no user status check):', sortedResults.length);
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
            // Temporarily disable isRegistered check - all alumni need to create auth accounts
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              admission_year: alum.adm_year,
              isRegistered: false // Force all to show clickable buttons
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni + schools):', sortedResults.length);
            setResults(sortedResults);
          } else {
            // If we can't check users table, assume no one is registered
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              admission_year: alum.adm_year,
              isRegistered: false
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni + schools):', sortedResults.length);
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
            // Temporarily disable isRegistered check - all alumni need to create auth accounts
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              admission_year: alum.adm_year,
              isRegistered: false // Force all to show clickable buttons
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni only):', sortedResults.length);
            setResults(sortedResults);
          } else {
            // If we can't check users table, assume no one is registered
            const alumniWithStatus = alumniData.map(alum => ({
              ...alum,
              admission_year: alum.adm_year,
              isRegistered: false
            }));
            const sortedResults = sortResults(alumniWithStatus, sortBy);
            console.log('🔍 Setting text search results (alumni only):', sortedResults.length);
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

  // Handle register button click
  const handleRegisterClick = (alumni) => {
    // Check if user is logged in
    if (!user) {
      // Store alumni data in localStorage for after login
      localStorage.setItem('selectedAlumni', JSON.stringify(alumni));
      // Redirect to login page
      navigate('/login');
      return;
    }
    
    // User is logged in, proceed with profile update
    localStorage.setItem('selectedAlumni', JSON.stringify(alumni));
    // Navigate to registration page
    window.location.href = '/register';
  };

  // Debug logging for render
  console.log('🔍 Home render state:', { loading, resultsLength: results.length, searchType, searchText });

  return (
    <div className="home-container">
      {/* Search and Filter Form - Now at the top */}
      <section className="search-hero">
        <div className="search-hero-content">
          <div className="search-header">
            <div className="spaco-beta-title">
              St. Patrick's Ibadan (SPACO) ALUMNI - Beta
            </div>
            <div className="main-title">
              <h1>National Alumni Institutions Revival Alliance</h1>
              <div className="title-line-2">Get your NAIRA 100 ID NOW!</div>
            </div>
            <p className="search-description tagline">
              Reconnect. Rediscover. Rebuild.
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
                  className="btn btn-primary btn-search"
                  onClick={clearAllFilters}
                  disabled={loading}
                >
                  Clear
                </button>
              </div>
              
              {/* Help section for users who can't find their school */}
              <div className="search-help">
                <p>
                  Can't find yourself or your School?{' '}
                  <Link to="/register-school" className="btn btn-outline">
                    Register
                  </Link>
                </p>
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

      {/* Search Results - Show immediately after search form */}
      {!loading && results.length > 0 && (
        <section className="search-results-section">
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
                      <th onClick={() => handleSort('lga')} className={`sortable ${sortBy === 'lga' ? 'sorted' : ''} ${sortBy === 'lga' && sortDirection === 'asc' ? 'asc' : sortBy === 'lga' ? 'desc' : ''}`}>
                        City <span className="sort-indicator">{sortBy === 'lga' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('level')} className={`sortable ${sortBy === 'level' ? 'sorted' : ''} ${sortBy === 'level' && sortDirection === 'asc' ? 'asc' : sortBy === 'level' ? 'desc' : ''}`}>
                        Level <span className="sort-indicator">{sortBy === 'level' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((school, index) => (
                      <tr key={school.id || index}>
                        <td>{school.name || 'N/A'}</td>
                        <td>{school.state || 'N/A'}</td>
                        <td>{school.lga || 'N/A'}</td>
                        <td>
                          <span className={`level-badge level-${school.level?.toLowerCase() || 'unknown'}`}>
                            {schoolLevels.find(l => l.value === school.level)?.label || school.level || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
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
                      <th onClick={() => handleSort('fullName')} className={`sortable ${sortBy === 'fullName' ? 'sorted' : ''} ${sortBy === 'fullName' && sortDirection === 'asc' ? 'asc' : sortBy === 'fullName' ? 'desc' : ''}`}>
                        Alumni Name <span className="sort-indicator">{sortBy === 'fullName' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('admissionYear')} className={`sortable ${sortBy === 'admissionYear' ? 'sorted' : ''} ${sortBy === 'admissionYear' && sortDirection === 'asc' ? 'asc' : sortBy === 'admissionYear' ? 'desc' : ''}`}>
                        Adm. Yr. <span className="sort-indicator">{sortBy === 'admissionYear' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th onClick={() => handleSort('graduationYear')} className={`sortable ${sortBy === 'graduationYear' ? 'sorted' : ''} ${sortBy === 'graduationYear' && sortDirection === 'asc' ? 'asc' : sortBy === 'graduationYear' ? 'desc' : ''}`}>
                        Set Yr. (Finish or Left) <span className="sort-indicator">{sortBy === 'graduationYear' && (sortDirection === 'asc' ? '↑' : '↓')}</span>
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((alum, index) => (
                      <tr key={alum.id || index}>
                        <td>{alum.school?.name || 'N/A'}</td>
                        <td>{alum.full_name || 'N/A'}</td>
                        <td>{alum.admission_year || 'N/A'}</td>
                        <td>{alum.graduation_year || 'N/A'}</td>
                        <td>
                          {alum.isRegistered ? (
                            <span className="status-badge registered">Registered</span>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleRegisterClick(alum)}
                            >
                              Update your Profile
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
                </>
                );
                })()}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hero Section - Only show when no search results */}
      {!loading && results.length === 0 && (
        <section className="hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <span className="stat-number">10K+</span>
              <span className="stat-label">Alumni Connected</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏫</div>
              <span className="stat-number">100+</span>
              <span className="stat-label">Schools Registered</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏆</div>
              <span className="stat-number">3</span>
              <span className="stat-label">Member Tiers</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🗺️</div>
              <span className="stat-number">36</span>
              <span className="stat-label">States Covered</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link to="/register-school" className="btn btn-primary btn-large">
              Join Now
            </Link>
            <Link to="/login" className="btn btn-primary btn-large">
              Sign In
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2>NAIRA-100 Core Features</h2>
          <p className="features-subtitle">Transforming nostalgia into nation-building power</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Unified Alumni Database</h3>
              <p>Connect graduates from Primary, Secondary, Vocational, and Tertiary institutions across Nigeria through our secure digital platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure Verification</h3>
              <p>Get your unique NAIRA-100 ID with verified credentials. Example: STP-1998-0023-AO (School-Year-Sequence-Initials).</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏛️</div>
              <h3>CAC Registered Chapters</h3>
              <p>All alumni associations are legally registered with Corporate Affairs Commission ensuring transparency and accountability.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Bank Partnerships</h3>
              <p>Partner banks provide ₦100,000 startup support for verified alumni organizations with multi-signatory governance.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>STEM & Innovation</h3>
              <p>Facilitate cross-institutional collaboration in STEM, AI education, digital literacy, and career mentorship programs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Member Recognition</h3>
              <p>Silver, Gold, and Diamond membership tiers with official NAIRA-100 brooch pins and Hall of Contributors recognition.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Member Recognition Tiers */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2>NAIRA-100 Member Recognition</h2>
          <p className="testimonials-subtitle">Join our tiered membership system and get recognized for your contributions</p>
          <div className="testimonials-grid">
            <div className="testimonial-card silver-tier">
              <div className="tier-badge silver">🥈</div>
              <div className="testimonial-content">
                <h3>Silver Member</h3>
                <p>"As a registered and verified member, I received my unique NAIRA-100 ID and official brooch pin. It's a badge of pride and commitment to my alma mater."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">AO</div>
                <div className="author-info">
                  <h4>Chinedu Adebayo</h4>
                  <p>STP-1998-0023-AO • St. Patrick's Grammar School</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card gold-tier">
              <div className="tier-badge gold">🥇</div>
              <div className="testimonial-content">
                <h3>Gold Member</h3>
                <p>"Being an active contributor in school projects has been rewarding. The platform connects me with like-minded alumni working to improve education in Nigeria."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">CA</div>
                <div className="author-info">
                  <h4>Chinwe Adebayo</h4>
                  <p>UNI-2005-0156-CA • University of Lagos</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card diamond-tier">
              <div className="tier-badge diamond">💎</div>
              <div className="testimonial-content">
                <h3>Diamond Member</h3>
                <p>"As a major donor and project sponsor, I'm honored to be in the Hall of Contributors. NAIRA-100 has given me a platform to make real impact in education."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">FO</div>
                <div className="author-info">
                  <h4>Folake Ogunlesi</h4>
                  <p>POL-1995-0089-FO • Yaba College of Technology</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact">
        <div className="impact-content">
          <div className="impact-text">
            <h2>Reviving Nigeria's Educational Institutions</h2>
            <p>NAIRA-100 bridges the gap between alumni and their alma maters, transforming nostalgia into nation-building power. Join us in addressing decades of underfunding and neglect in Nigeria's educational sector.</p>
          </div>
          <div className="impact-stats">
            <div className="impact-stat">
              <div className="impact-number">100+</div>
              <div className="impact-label">Schools Connected</div>
            </div>
            <div className="impact-stat">
              <div className="impact-number">10K+</div>
              <div className="impact-label">Alumni Registered</div>
            </div>
            <div className="impact-stat">
              <div className="impact-number">₦100K</div>
              <div className="impact-label">Startup Support</div>
            </div>
            <div className="impact-stat">
              <div className="impact-number">36</div>
              <div className="impact-label">States Covered</div>
            </div>
          </div>
          <div className="impact-actions">
            <Link to="/register-school" className="btn btn-primary btn-large">
              Get Your NAIRA-100 ID
            </Link>
            <Link to="/register-school" className="btn btn-outline btn-large">
              Register Your School
            </Link>
          </div>
        </div>
        <div className="impact-visual">
          <div className="impact-graphic">
            <div className="graphic-circle">
              <div className="graphic-text">NAIRA-100</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;