import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// Immediate registration approach: route directly to /register with alumni context
// import EmailPromptModal from '../components/EmailPromptModal';
// import { createPendingRegistration, sendRegistrationLink } from '../utils/registration';
import { useAuth } from '../context/AuthContext';
import './Search.css';
import supabase from '../supabaseClient';

function Search() {
  const location = useLocation();
  const { user } = useAuth();
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
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [filteredSchoolNames, setFilteredSchoolNames] = useState([]);
  const [filteredLgas, setFilteredLgas] = useState([]);
  const [sortBy, setSortBy] = useState('state'); // Default sort by state
  const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction
  const [searchText, setSearchText] = useState(''); // General search text box
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Prefill filters based on query params (e.g., /search?level=PR&sub=modern)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const levelParam = params.get('level');
    const subParam = params.get('sub');
    if (levelParam) {
      setSchoolSearch(prev => ({ ...prev, level: levelParam }));
    }
    // Optionally set search text to subcategory to help users filter further
    if (subParam && !searchText) {
      setSearchText(subParam);
    }
  }, [location.search]);

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

  // Handle sequential filtering when state changes
  useEffect(() => {
    if (schoolSearch.state) {
      console.log('State changed to:', schoolSearch.state);
      fetchFilteredSchoolNames();
      fetchFilteredLgas();
      // Reset dependent fields when state changes
      setSchoolSearch(prev => ({
        ...prev,
        level: '',
        name: '',
        lga: ''
      }));
    } else {
      console.log('State cleared');
      setFilteredSchoolNames([]);
      setFilteredLgas([]);
    }
  }, [schoolSearch.state]);

  // Handle sequential filtering when level changes
  useEffect(() => {
    if (schoolSearch.state && schoolSearch.level) {
      fetchFilteredSchoolNames();
      // Reset dependent fields when level changes
      setSchoolSearch(prev => ({
        ...prev,
        name: '',
        lga: ''
      }));
    }
  }, [schoolSearch.level]);

  // Fetch school names based on selected state and level
  const fetchFilteredSchoolNames = async () => {
    if (!schoolSearch.state) return;
    
    setIsLoadingOptions(true);
    try {
      console.log('Fetching school names for state:', schoolSearch.state, 'and level:', schoolSearch.level);
      
      // Simplified query that works based on direct database test
      let query = supabase.from('schools').select('name');
      
      if (schoolSearch.state) {
        // Use correct PostgREST or syntax with wildcard segments
        const stateTerm = schoolSearch.state.toLowerCase();
        query = query.or(`state.eq.${schoolSearch.state},state.ilike.*${stateTerm}*`);
        console.log('Adding state filter with exact and case-insensitive match:', schoolSearch.state);
      }
      
      if (schoolSearch.level) {
        query = query.eq('level', schoolSearch.level);
        console.log('Adding level filter:', schoolSearch.level);
      }
      
      const { data, error } = await query;
      console.log('School names query result:', data, 'Error:', error);
      
      if (error) {
        console.error('Error fetching school names:', error);
        setFilteredSchoolNames([]);
      } else {
        // Get unique names by creating a Set
        const uniqueNames = [...new Set(data.map(item => item.name))].sort();
        console.log('Filtered school names count:', uniqueNames.length);
        setFilteredSchoolNames(uniqueNames);
      }
    } catch (error) {
      console.error('Error:', error);
      setFilteredSchoolNames([]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Fetch LGAs based on selected state
  const fetchFilteredLgas = async () => {
    if (!schoolSearch.state) return;
    
    setIsLoadingOptions(true);
    try {
      console.log('Fetching LGAs for state:', schoolSearch.state);
      
      // Simplified query that works based on direct database test
      let query = supabase.from('schools').select('lga');
      
      if (schoolSearch.state) {
        // Use correct PostgREST or syntax with wildcard segments
        const stateTerm = schoolSearch.state.toLowerCase();
        query = query.or(`state.eq.${schoolSearch.state},state.ilike.*${stateTerm}*`);
      }
      
      const { data, error } = await query;
      console.log('LGAs query result:', data, 'Error:', error);
      
      if (error) {
        console.error('Error fetching LGAs:', error);
        setFilteredLgas([]);
      } else {
        // Get unique LGAs by creating a Set
        const uniqueLgas = [...new Set(data.map(item => item.lga))].sort();
        console.log('Filtered LGAs count:', uniqueLgas.length);
        setFilteredLgas(uniqueLgas);
      }
    } catch (error) {
      console.error('Error:', error);
      setFilteredLgas([]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Check for search results passed from Home page
  useEffect(() => {
    const storedResults = localStorage.getItem('searchResults');
    if (storedResults) {
      try {
        const results = JSON.parse(storedResults);
        // These results come from the Home page's schools query.
        // Ensure we render the schools table by switching search type.
        setResults(results);
        setSearchType('school');
        setCurrentPage(1);
        // Clear the stored results after using them
        localStorage.removeItem('searchResults');
      } catch (error) {
        console.error('Error parsing stored search results:', error);
      }
    }
  }, []);

  // Database queries will be used instead of mock data

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPage(1);
    
    try {
      const hasSchoolFilters = schoolSearch.state || schoolSearch.level || schoolSearch.name || schoolSearch.lga;
      const shouldSearchAlumni = (searchText && searchText.trim().length > 0) || (alumniYearFilter && alumniYearFilter.trim().length > 0);

      if (shouldSearchAlumni) {
        // Always run alumni search when text or year provided
        setSearchType('alumni');
        const term = (searchText || '').toLowerCase();

        // Prefetch matching school IDs if filters are selected
        let schoolIds = null;
        if (hasSchoolFilters) {
          let sQuery = supabase.from('schools').select('id');
          if (schoolSearch.state) {
            const stateTerm = schoolSearch.state.toLowerCase();
            sQuery = sQuery.or(`state.eq.${schoolSearch.state},state.ilike.*${stateTerm}*`);
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
          if (!sError && sData) {
            schoolIds = sData.map(s => s.id);
          }
        }

        // Run two ilike queries separately (full_name and id), then merge.
        let nameQuery = supabase.from('alumni').select('*, school:schools(name, level)');
        let idQuery = supabase.from('alumni').select('*, school:schools(name, level)');
        if (term) {
          nameQuery = nameQuery.ilike('full_name', `%${term}%`);
          idQuery = idQuery.ilike('id', `%${term}%`);
        }
        if (alumniYearFilter) {
          nameQuery = nameQuery.eq('graduation_year', alumniYearFilter);
          idQuery = idQuery.eq('graduation_year', alumniYearFilter);
        }
        if (schoolIds && schoolIds.length > 0) {
          nameQuery = nameQuery.in('school_id', schoolIds);
          idQuery = idQuery.in('school_id', schoolIds);
        }

        const [{ data: nameData, error: nameError }, { data: idData, error: idError }] = await Promise.all([nameQuery, idQuery]);
        if (nameError || idError) {
          console.error('Error fetching alumni:', nameError || idError);
          setResults([]);
        } else {
          const mergedMap = new Map();
          (nameData || []).forEach(alum => mergedMap.set(alum.id, alum));
          (idData || []).forEach(alum => mergedMap.set(alum.id, alum));
          const data = Array.from(mergedMap.values());

          if (data && data.length > 0) {
            const alumniIds = data.map(alum => alum.id);
            const { data: registeredUsers, error: usersError } = await supabase
              .from('users')
              .select('alumni_id')
              .in('alumni_id', alumniIds);

            if (!usersError && registeredUsers) {
              const registeredAlumniIds = new Set(registeredUsers.map(user => user.alumni_id));
              const levelFiltered = schoolSearch.level
                ? data.filter(alum => alum.school?.level === schoolSearch.level)
                : data;
              const alumniWithStatus = levelFiltered.map(alum => ({
                ...alum,
                isRegistered: registeredAlumniIds.has(alum.id)
              }));
              const sortedResults = sortResults(alumniWithStatus, sortBy);
              setResults(sortedResults);
            } else {
              const levelFiltered = schoolSearch.level
                ? data.filter(alum => alum.school?.level === schoolSearch.level)
                : data;
              const alumniWithStatus = levelFiltered.map(alum => ({
                ...alum,
                isRegistered: !!alum.email
              }));
              const sortedResults = sortResults(alumniWithStatus, sortBy);
              setResults(sortedResults);
            }
          } else {
            setResults([]);
          }
        }
      } else if (hasSchoolFilters) {
        // No alumni text/year; if school filters selected, search schools
        setSearchType('school');
        console.log('Searching for schools with:', {
          name: schoolSearch.name,
          state: schoolSearch.state,
          level: schoolSearch.level,
          lga: schoolSearch.lga
        });
        
        let query = supabase.from('schools').select('*');
        if (schoolSearch.name) {
          query = query.ilike('name', `%${schoolSearch.name.toLowerCase()}%`);
        }
        if (schoolSearch.state) {
          const stateTerm = schoolSearch.state.toLowerCase();
          query = query.or(`state.eq.${schoolSearch.state},state.ilike.*${stateTerm}*`);
        }
        if (schoolSearch.level) {
          query = query.eq('level', schoolSearch.level);
        }
        if (schoolSearch.lga) {
          query = query.ilike('lga', `%${schoolSearch.lga.toLowerCase()}%`);
        }
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching schools:', error);
          setResults([]);
        } else {
          const sortedResults = sortResults(data, sortBy);
          setResults(sortedResults);
        }
      } else {
        // Nothing provided
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolInputChange = (e) => {
    const { name, value } = e.target;
    setSchoolSearch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="search-container">
      <h1>Find Schools & Alumni</h1>
      
  {/* Removed tabs: single unified search experience */}

      <form className="search-form" onSubmit={handleSearch}>
        {/* Unified search: alumni text + school filters */}
        <div className="form-group full-width">
          <label htmlFor="search-text">Search alumni by name or ID</label>
          <input
            type="text"
            id="search-text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter alumni name or ID"
            className="form-control search-text-input"
          />
        </div>

        <div className="alumni-search-fields">
          <div className="form-group">
            <label htmlFor="alumni-year">Set Yr. (Finish or Left)</label>
            <input
              type="text"
              id="alumni-year"
              value={alumniYearFilter}
              onChange={(e) => setAlumniYearFilter(e.target.value)}
              placeholder="Enter year (e.g., 2020)"
            />
          </div>
        </div>

        <div className="school-search-fields">
          <div className="form-group">
            <label htmlFor="school-state">State</label>
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
            <label htmlFor="school-level">School Level</label>
            <select
              id="school-level"
              name="level"
              value={schoolSearch.level}
              onChange={handleSchoolInputChange}
              disabled={!schoolSearch.state}
              className="form-control"
            >
              <option value="">Select Level</option>
              {schoolLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            {!schoolSearch.state && (
              <small className="help-text">Select a state first</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="school-name">School Name</label>
            <select
              id="school-name"
              name="name"
              value={schoolSearch.name}
              onChange={handleSchoolInputChange}
              disabled={!schoolSearch.state || isLoadingOptions}
              className="form-control"
            >
              <option value="">Select School Name</option>
              {filteredSchoolNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {!schoolSearch.state && (
              <small className="help-text">Select a state first</small>
            )}
            {isLoadingOptions && schoolSearch.state && (
              <small className="help-text">Loading school names...</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="school-lga">City</label>
            <select
              id="school-lga"
              name="lga"
              value={schoolSearch.lga}
              onChange={handleSchoolInputChange}
              disabled={!schoolSearch.state || isLoadingOptions}
              className="form-control"
            >
              <option value="">Select City</option>
              {filteredLgas.map(lga => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
            {!schoolSearch.state && (
              <small className="help-text">Select a state first</small>
            )}
            {isLoadingOptions && schoolSearch.state && (
              <small className="help-text">Loading LGAs...</small>
            )}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="btn-search" 
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        
      </form>

  <div className="search-results">
        {loading && <p className="loading">Searching...</p>}
        {!loading && results.length === 0 && !searchText && (
          <p className="no-results">Select or type text to search</p>
        )}
        {!loading && results.length === 0 && searchText && (
          <p className="no-results">0 selection found</p>
        )}
        {!loading && results.length > 0 && (
          <div className="results-list">
            <div className="results-header">
              <h3>Search Results ({results.length})</h3>
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
                          {user ? (
                            <Link to={`/schools/${school.id}`} className="view-details">
                              View Details
                            </Link>
                          ) : (
                            <Link to="/login" className="view-details">
                              Sign In to View Details
                            </Link>
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
    </div>
  );
}

// Component for handling initial registration via email
function RegisterButton({ alumni }) {
  return (
    <Link to={`/register?alumni=${encodeURIComponent(alumni.id)}`} className="btn-register">
      Register
    </Link>
  );
}

export default Search;