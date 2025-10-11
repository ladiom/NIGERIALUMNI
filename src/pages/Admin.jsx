import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';
import supabase from '../supabaseClient';

function Admin() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    schools: 0,
    alumni: 0,
    pendingRegistrations: 0,
    emailsQueued: 0,
    users: 0,
    completedRegistrations: 0,
    rejectedRegistrations: 0,
    recentActivity: 0
  });
  const [recentPending, setRecentPending] = useState([]);
  const [allPending, setAllPending] = useState([]);
  const [recentApproved, setRecentApproved] = useState([]);
  const [allApproved, setAllApproved] = useState([]);
  const [recentRejected, setRecentRejected] = useState([]);
  const [allRejected, setAllRejected] = useState([]);
  const [recentSchools, setRecentSchools] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [recentAlumni, setRecentAlumni] = useState([]);
  const [allAlumni, setAllAlumni] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegistrationStatus, setSelectedRegistrationStatus] = useState('pending');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRegistrations, setSelectedRegistrations] = useState(new Set());
  const [selectedSchools, setSelectedSchools] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [actionLoading, setActionLoading] = useState({});
  const [showAllRegistrations, setShowAllRegistrations] = useState(false);
  const [showAllSchools, setShowAllSchools] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(true);
  const [selectedSchoolStatus, setSelectedSchoolStatus] = useState('total');

  // Pagination and search state for users
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // No longer using localStorage - all data comes from database
  const getProcessedItems = () => {
    return []; // Always return empty array - we rely on database state
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // User search and pagination functions
  const searchUsers = async (search = '', page = 1, sortBy = 'created_at', order = 'desc') => {
    setIsLoadingUsers(true);
    try {
      console.log('Searching users:', { search, page, sortBy, order });
      
      let query = supabase
        .from('alumni')
        .select('id, full_name, graduation_year, created_at, email, schools(name)', { count: 'exact' });
      
      // Add search filter
      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,id.ilike.%${search}%`);
      }
      
      // Add sorting
      query = query.order(sortBy, { ascending: order === 'asc' });
      
      // Add pagination
      const from = (page - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Search users error:', error);
        throw error;
      }
      
      console.log('Search results:', { data: data?.length, count, page });
      
      setFilteredUsers(data || []);
      setTotalUsers(count || 0);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Error searching users:', error);
      setFilteredUsers([]);
      setTotalUsers(0);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    searchUsers(term, 1, sortField, sortDirection);
  };

  const handleUserSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    setCurrentPage(1);
    searchUsers(searchTerm, 1, field, newDirection);
  };

  const handlePageChange = (page) => {
    searchUsers(searchTerm, page, sortField, sortDirection);
  };


  // Helper functions to get data based on view mode
  const getDisplayData = () => {
    try {
      console.log('getDisplayData called:', { activeTab, selectedRegistrationStatus, showAllRegistrations });
      if (activeTab === 'registrations') {
        if (selectedRegistrationStatus === 'pending') {
          console.log('Returning pending data:', { allPending: allPending.length, recentPending: recentPending.length });
          return showAllRegistrations ? allPending : recentPending;
        } else if (selectedRegistrationStatus === 'approved') {
          console.log('Getting approved data:', { allApproved: allApproved.length, recentApproved: recentApproved.length, showAllRegistrations });
          return showAllRegistrations ? allApproved : recentApproved;
        } else if (selectedRegistrationStatus === 'rejected') {
          console.log('Getting rejected data:', { allRejected: allRejected.length, recentRejected: recentRejected.length, showAllRegistrations });
          return showAllRegistrations ? allRejected : recentRejected;
        }
        return showAllRegistrations ? allPending : recentPending;
      } else if (activeTab === 'schools') {
      let schoolsData = showAllSchools ? allSchools : recentSchools;
      
      // Filter by selected school status
      if (selectedSchoolStatus === 'active') {
        schoolsData = schoolsData.filter(school => school.status === 'active');
      } else if (selectedSchoolStatus === 'inactive') {
        schoolsData = schoolsData.filter(school => school.status === 'inactive');
      } else if (selectedSchoolStatus === 'pending') {
        schoolsData = schoolsData.filter(school => school.status === 'pending');
      }
      
      return schoolsData;
    } else if (activeTab === 'users') {
      return showAllUsers ? allAlumni : recentAlumni;
    }
    return recentPending;
    } catch (error) {
      console.error('Error in getDisplayData:', error);
      return [];
    }
  };

  const getDisplayCount = () => {
    if (activeTab === 'registrations') {
      return showAllRegistrations ? allPending.length : recentPending.length;
    } else if (activeTab === 'schools') {
      return showAllSchools ? allSchools.length : recentSchools.length;
    } else if (activeTab === 'users') {
      return showAllUsers ? allAlumni.length : recentAlumni.length;
    }
    return recentPending.length;
  };

  // Sort the data
  const sortedPending = [...getDisplayData()].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested properties
    if (sortField === 'school') {
      aValue = a.alumni?.schools?.name || '';
      bValue = b.alumni?.schools?.name || '';
    } else if (sortField === 'location') {
      aValue = `${a.alumni?.schools?.lga || ''} ${a.alumni?.schools?.state || ''}`.trim();
      bValue = `${b.alumni?.schools?.lga || ''} ${b.alumni?.schools?.state || ''}`.trim();
    } else if (sortField === 'level') {
      aValue = a.alumni?.schools?.level || '';
      bValue = b.alumni?.schools?.level || '';
    } else if (sortField === 'graduation_year') {
      aValue = a.alumni?.graduation_year || '';
      bValue = b.alumni?.graduation_year || '';
    } else if (sortField === 'alumni_id') {
      aValue = a.alumni?.id || a.alumni_id || '';
      bValue = b.alumni?.id || b.alumni_id || '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Action handlers
  const handleApprove = async (registrationId) => {
    try {
      console.log('Approving registration:', registrationId);
      setActionLoading(prev => ({ ...prev, [registrationId]: true }));
      
      // Find the registration record
      const registration = recentPending.find(p => p.id === registrationId) || 
                          allPending.find(p => p.id === registrationId);
      
      if (!registration) {
        throw new Error('Registration not found');
      }

      // Update the registration status in the database
      console.log('Updating registration status for ID:', registrationId);
      const { data: updateData, error: updateError } = await supabase
        .from('pending_registrations')
        .update({ status: 'approved' })
        .eq('id', registrationId)
        .select();

      console.log('Update result:', { updateData, updateError });
      
      let databaseUpdateSuccess = false;
      
      if (updateError) {
        console.error('Database update error details:', updateError);
        console.warn('Database update failed - likely due to RLS policies');
      } else if (!updateData || updateData.length === 0) {
        console.warn(`No registration found with ID: ${registrationId} - likely due to RLS policies`);
      } else {
        console.log('Registration status updated successfully:', updateData[0]);
        databaseUpdateSuccess = true;
      }
      
      if (!databaseUpdateSuccess) {
        console.warn('⚠️ Database update failed due to Row Level Security (RLS) policies. The approval will be processed locally but may not persist in the database.');
      }

      // Create a user account for the approved alumni
      // Use a simple approach - let Supabase generate the UUID
      console.log('Creating user account for:', registration.email);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: registration.email,
          alumni_id: registration.alumni_id, // Store the alumni ID as a separate field
          created_at: new Date().toISOString()
        })
        .select();

      console.log('User creation result:', { userData, userError });

      if (userError) {
        console.warn('User creation warning:', userError);
        // Don't fail the approval if user creation has issues
      } else {
        console.log('User account created successfully:', userData[0]);
      }

      // Send approval email notification
      try {
        const { sendApprovalEmail } = await import('../services/emailService');
        await sendApprovalEmail({
          toEmail: registration.email,
          toName: registration.alumni_id,
          alumniId: registration.alumni_id,
          schoolName: 'N/A', // We don't have school name in pending_registrations
          loginUrl: `${window.location.origin}/login`
        });
        console.log('Approval email sent successfully');
        
        // Also add to email queue for tracking
        try {
          console.log('Adding email to queue for:', registration.email);
          const { data: queueData, error: queueError } = await supabase
            .from('email_outbox')
            .insert({
              to_email: registration.email,
              to_name: registration.alumni_id,
              subject: 'Nigeria Alumni Network — Registration Approved!',
              body: `Congratulations! Your registration has been approved. You can now login to access your alumni account.

Your Alumni ID: ${registration.alumni_id}
Login Link: ${window.location.origin}/login

Welcome to the Nigeria Alumni Network!`,
              email_type: 'registration_approved',
              status: 'sent',
              sent_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            })
            .select();
          
          console.log('Email queue insertion result:', { queueData, queueError });
          
          if (queueError) {
            console.warn('Email queue insertion warning:', queueError);
          } else {
            console.log('Email added to queue successfully:', queueData[0]);
          }
        } catch (queueError) {
          console.warn('Email queue insertion error:', queueError);
        }
        
      } catch (emailError) {
        console.warn('Email sending warning:', emailError);
        // Don't fail the approval if email sending has issues
      }
      
      // Update local state to reflect the change
      setRecentPending(prev => prev.filter(p => p.id !== registrationId));
      setAllPending(prev => prev.filter(p => p.id !== registrationId));
      setStats(prev => ({
        ...prev,
        pendingRegistrations: prev.pendingRegistrations - 1,
        completedRegistrations: prev.completedRegistrations + 1
      }));

      if (databaseUpdateSuccess) {
        alert(`Registration ${registrationId} has been approved! Email notification has been queued.`);
      } else {
        alert(`Registration ${registrationId} has been approved locally! However, the database update failed due to Row Level Security policies. The approval may not persist after refresh. Please contact your administrator to fix the RLS policies.`);
      }
      
      // Refresh all data to get updated counts
      console.log('Refreshing data after approval...');
      window.location.reload(); // Force a complete refresh to ensure data consistency
      
    } catch (error) {
      console.error('Error approving registration:', error);
      alert(`Failed to approve registration: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleDecline = async (registrationId) => {
    try {
      console.log('Declining registration:', registrationId);
      setActionLoading(prev => ({ ...prev, [registrationId]: true }));
      
      if (confirm(`Are you sure you want to decline registration ${registrationId}?`)) {
        // Find the registration record
        const registration = recentPending.find(p => p.id === registrationId) || 
                            allPending.find(p => p.id === registrationId);
        
        if (!registration) {
          throw new Error('Registration not found');
        }

        // Update the registration status in the database
        const { error: updateError } = await supabase
          .from('pending_registrations')
          .update({ status: 'rejected' })
          .eq('id', registrationId);

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`);
        }

        // Send rejection email notification
        try {
          const { sendRejectionEmail } = await import('../services/emailService');
          await sendRejectionEmail({
            toEmail: registration.email,
            toName: registration.alumni_id,
            alumniId: registration.alumni_id,
            schoolName: 'N/A' // We don't have school name in pending_registrations
          });
          console.log('Rejection email sent successfully');
          
          // Also add to email queue for tracking
          try {
            const { error: queueError } = await supabase
              .from('email_outbox')
              .insert({
                to_email: registration.email,
                to_name: registration.alumni_id,
                subject: 'Nigeria Alumni Network — Registration Update',
                body: `Thank you for your interest in joining the Nigeria Alumni Network.

Unfortunately, your registration could not be approved at this time. If you believe this is an error, please contact our support team.

Your Alumni ID: ${registration.alumni_id}

Best regards,
Nigeria Alumni Network Team`,
                email_type: 'registration_rejected',
                status: 'sent',
                sent_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              });
            
            if (queueError) {
              console.warn('Email queue insertion warning:', queueError);
            } else {
              console.log('Email added to queue successfully');
            }
          } catch (queueError) {
            console.warn('Email queue insertion error:', queueError);
          }
          
        } catch (emailError) {
          console.warn('Email sending warning:', emailError);
        }
        
        // Update local state to reflect the change
        setRecentPending(prev => prev.filter(p => p.id !== registrationId));
        setAllPending(prev => prev.filter(p => p.id !== registrationId));
        setStats(prev => ({
          ...prev,
          pendingRegistrations: prev.pendingRegistrations - 1,
          rejectedRegistrations: prev.rejectedRegistrations + 1
        }));

        alert(`Registration ${registrationId} has been declined! Email notification has been queued.`);
      }
    } catch (error) {
      console.error('Error declining registration:', error);
      alert(`Failed to decline registration: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const handleDelete = async (registrationId) => {
    try {
      console.log('Deleting registration:', registrationId);
      // Here you would typically make an API call to delete the registration
      // For now, we'll just show a confirmation
      if (confirm(`Are you sure you want to delete registration ${registrationId}? This action cannot be undone.`)) {
        alert(`Registration ${registrationId} has been deleted!`);
        
        // Update local state to reflect the change
        setRecentPending(prev => prev.filter(p => p.id !== registrationId));
        setStats(prev => ({
          ...prev,
          pendingRegistrations: prev.pendingRegistrations - 1
        }));
      }
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration. Please try again.');
    }
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRegistrations(new Set(getDisplayData().map(p => p.id)));
    } else {
      setSelectedRegistrations(new Set());
    }
  };

  const handleSelectRegistration = (registrationId, checked) => {
    const newSelected = new Set(selectedRegistrations);
    if (checked) {
      newSelected.add(registrationId);
    } else {
      newSelected.delete(registrationId);
    }
    setSelectedRegistrations(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedRegistrations.size === 0) {
      alert('Please select at least one registration to delete.');
      return;
    }

    const count = selectedRegistrations.size;
    if (confirm(`Are you sure you want to delete ${count} selected registration(s)? This action cannot be undone.`)) {
      try {
        console.log('Bulk deleting registrations:', Array.from(selectedRegistrations));
        
        // Update local state to reflect the changes
        setRecentPending(prev => prev.filter(p => !selectedRegistrations.has(p.id)));
        setStats(prev => ({
          ...prev,
          pendingRegistrations: prev.pendingRegistrations - count
        }));
        setSelectedRegistrations(new Set());
        
        alert(`${count} registration(s) have been deleted!`);
      } catch (error) {
        console.error('Error bulk deleting registrations:', error);
        alert('Failed to delete registrations. Please try again.');
      }
    }
  };

  // Schools selection handlers
  const handleSelectAllSchools = (checked) => {
    if (checked) {
      setSelectedSchools(new Set(getDisplayData().map(s => s.id)));
    } else {
      setSelectedSchools(new Set());
    }
  };

  const handleSelectSchool = (schoolId, checked) => {
    const newSelected = new Set(selectedSchools);
    if (checked) {
      newSelected.add(schoolId);
    } else {
      newSelected.delete(schoolId);
    }
    setSelectedSchools(newSelected);
  };

  const handleBulkDeleteSchools = async () => {
    if (selectedSchools.size === 0) {
      alert('Please select at least one school to delete.');
      return;
    }

    const count = selectedSchools.size;
    if (confirm(`Are you sure you want to delete ${count} selected school(s)? This action cannot be undone.`)) {
      try {
        console.log('Bulk deleting schools:', Array.from(selectedSchools));
        
        setRecentSchools(prev => prev.filter(s => !selectedSchools.has(s.id)));
        setStats(prev => ({
          ...prev,
          schools: prev.schools - count
        }));
        setSelectedSchools(new Set());
        
        alert(`${count} school(s) have been deleted!`);
      } catch (error) {
        console.error('Error bulk deleting schools:', error);
        alert('Failed to delete schools. Please try again.');
      }
    }
  };

  // Users selection handlers
  const handleSelectAllUsers = (checked) => {
    if (checked) {
      setSelectedUsers(new Set(getDisplayData().map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId, checked) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleBulkDeleteUsers = async () => {
    if (selectedUsers.size === 0) {
      alert('Please select at least one user to delete.');
      return;
    }

    const count = selectedUsers.size;
    if (confirm(`Are you sure you want to delete ${count} selected user(s)? This action cannot be undone.`)) {
      try {
        console.log('Bulk deleting users:', Array.from(selectedUsers));
        
        setRecentAlumni(prev => prev.filter(u => !selectedUsers.has(u.id)));
        setStats(prev => ({
          ...prev,
          users: prev.users - count,
          alumni: prev.alumni - count
        }));
        setSelectedUsers(new Set());
        
        alert(`${count} user(s) have been deleted!`);
      } catch (error) {
        console.error('Error bulk deleting users:', error);
        alert('Failed to delete users. Please try again.');
      }
    }
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    console.log('Admin auth check:', { authLoading, user: !!user, isAdmin, userEmail: user?.email });
    if (!authLoading && !user) {
      console.log('No user, redirecting to login');
      navigate('/login');
    } else if (!authLoading && user && !isAdmin) {
      console.log('User not admin, redirecting to home');
      navigate('/');
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return; // wait until redirect happens
      try {
        setLoading(true);
        setError('');


        let schoolsCount = 0;
        let alumniCount = 0;
        let pendingCount = 0;
        let emailsCount = 0;
        let usersCount = 0;
        let completedCount = 0;
        let rejectedCount = 0;
        let recentPending = [];
        let allPending = [];
        let recentApproved = [];
        let allApproved = [];
        let recentRejected = [];
        let allRejected = [];
        let recentSchools = [];
        let allSchools = [];
        let recentAlumni = [];
        let allAlumni = [];

        try {
          console.log('Attempting database queries for dashboard...');
          
          // Test basic connectivity first
          console.log('Testing basic Supabase connectivity...');
          const { data: testData, error: testError } = await supabase.from('schools').select('id').limit(1);
          console.log('Basic connectivity test:', { testData, testError });
          
          if (testError) {
            throw new Error(`Basic connectivity failed: ${testError.message}`);
          }
          
          // Test individual queries first to identify which one is failing
          console.log('Testing schools query...');
          const schoolsRes = await supabase.from('schools').select('id', { count: 'exact', head: true });
          console.log('Schools query result:', schoolsRes);
          schoolsCount = schoolsRes.count ?? 0;
          
          console.log('Testing alumni query...');
          const alumniRes = await supabase.from('alumni').select('id', { count: 'exact', head: true });
          console.log('Alumni query result:', alumniRes);
          alumniCount = alumniRes.count ?? 0;
          
          console.log('Testing pending registrations query...');
          const pendingRes = await supabase.from('pending_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending');
          console.log('Pending query result:', pendingRes);
          pendingCount = pendingRes.count ?? 0;
          
          console.log('Testing email outbox query...');
          const emailsRes = await supabase.from('email_outbox').select('id', { count: 'exact', head: true });
          console.log('Emails query result:', emailsRes);
          emailsCount = emailsRes.count ?? 0;
          
          console.log('Testing users query...');
          const usersRes = await supabase.from('users').select('id', { count: 'exact', head: true });
          console.log('Users query result:', usersRes);
          usersCount = usersRes.count ?? 0;
          
          console.log('Testing approved registrations query...');
          const completedRes = await supabase.from('pending_registrations').select('id', { count: 'exact', head: true }).eq('status', 'approved');
          console.log('Approved query result:', completedRes);
          completedCount = completedRes.count ?? 0;
          
          console.log('Testing rejected registrations query...');
          const rejectedRes = await supabase.from('pending_registrations').select('id', { count: 'exact', head: true }).eq('status', 'rejected');
          console.log('Rejected query result:', rejectedRes);
          rejectedCount = rejectedRes.count ?? 0;
          
          console.log('Testing recent pending registrations query...');
          const recentPendingRes = await supabase
            .from('pending_registrations')
            .select('id, alumni_id, email, created_at, status')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(20);
          console.log('Recent pending query result:', recentPendingRes);
          recentPending = recentPendingRes.data || [];
          allPending = recentPendingRes.data || [];
          
          console.log('Testing recent approved registrations query...');
          const recentApprovedRes = await supabase
            .from('pending_registrations')
            .select('id, alumni_id, email, created_at, status')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(20);
          console.log('Recent approved query result:', recentApprovedRes);
          recentApproved = recentApprovedRes.data || [];
          allApproved = recentApprovedRes.data || [];
          console.log('Approved data loaded:', { recentApproved, allApproved });
          
          console.log('Testing recent rejected registrations query...');
          const recentRejectedRes = await supabase
            .from('pending_registrations')
            .select('id, alumni_id, email, created_at, status')
            .eq('status', 'rejected')
            .order('created_at', { ascending: false })
            .limit(20);
          console.log('Recent rejected query result:', recentRejectedRes);
          recentRejected = recentRejectedRes.data || [];
          allRejected = recentRejectedRes.data || [];
          console.log('Rejected data loaded:', { recentRejected, allRejected });
          
          console.log('Testing recent schools query...');
          const recentSchoolsRes = await supabase
            .from('schools')
            .select('id, name, state, lga, level, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
          console.log('Recent schools query result:', recentSchoolsRes);
          recentSchools = recentSchoolsRes.data || [];
          allSchools = recentSchoolsRes.data || [];
          
          console.log('Testing recent alumni query...');
          const recentAlumniRes = await supabase
            .from('alumni')
            .select('id, full_name, graduation_year, created_at, email, schools(name)')
            .order('created_at', { ascending: false })
            .limit(20);
          console.log('Recent alumni query result:', recentAlumniRes);
          recentAlumni = recentAlumniRes.data || [];
          allAlumni = recentAlumniRes.data || [];

          console.log('All database queries completed successfully:', { 
            schoolsCount, 
            alumniCount, 
            pendingCount, 
            emailsCount, 
            usersCount,
            completedCount,
            rejectedCount,
            recentPendingCount: recentPending.length,
            recentSchoolsCount: recentSchools.length,
            recentAlumniCount: recentAlumni.length
          });
        } catch (dbError) {
          console.error('Database queries failed:', dbError);
          setError(`Database connection failed: ${dbError.message}. Please refresh the page to retry.`);
          
          // Set minimal fallback data to prevent crashes
          schoolsCount = 0;
          alumniCount = 0;
          pendingCount = 0;
        emailsCount = 0;
          usersCount = 0;
        completedCount = 0;
        rejectedCount = 0;
          recentPending = [];
          allPending = [];
          recentSchools = [];
          allSchools = [];
          recentAlumni = [];
          allAlumni = [];
        }

        setStats({
          schools: schoolsCount,
          alumni: alumniCount,
          pendingRegistrations: pendingCount,
          emailsQueued: emailsCount,
          users: usersCount,
          completedRegistrations: completedCount,
          rejectedRegistrations: rejectedCount,
          recentActivity: pendingCount + completedCount + rejectedCount
        });
        setRecentPending(recentPending);
        setAllPending(allPending);
        setRecentApproved(recentApproved);
        setAllApproved(allApproved);
        setRecentRejected(recentRejected);
        setAllRejected(allRejected);
        setRecentSchools(recentSchools);
        setAllSchools(allSchools);
        setRecentAlumni(recentAlumni);
        setAllAlumni(allAlumni);
      } catch (e) {
        console.error('Admin data load error:', e);
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Load users when Users tab is selected
  useEffect(() => {
    if (activeTab === 'users' && showAllUsers) {
      searchUsers(searchTerm, currentPage, sortField, sortDirection);
    }
  }, [activeTab, showAllUsers]);

  // Load email queue when Email Queue tab is selected
  useEffect(() => {
    if (activeTab === 'email-queue') {
      loadData(); // This will refresh all data including email counts
    }
  }, [activeTab]);

  if (authLoading) {
    return (
      <div className="admin-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Checking authentication…</p>
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: 'var(--primary-color)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null; // redirected

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <img 
            src="/NAIRA100LOGO.JPG" 
            alt="Nigeria Alumni Network Logo" 
            className="admin-logo"
          />
          <div className="admin-header-text">
            <h1>Admin Dashboard</h1>
            <p className="sub">Comprehensive administration panel for managing the alumni platform</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-error">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button 
              className="btn-primary error-retry"
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}

      <div className="admin-content">
        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          <ul className="admin-nav-links">
            <li 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              <span>Overview</span>
            </li>
            <li 
              className={activeTab === 'registrations' ? 'active' : ''}
              onClick={() => setActiveTab('registrations')}
            >
              <span className="nav-icon">⏳</span>
              <span>Registrations</span>
            </li>
            <li 
              className={activeTab === 'schools' ? 'active' : ''}
              onClick={() => setActiveTab('schools')}
            >
              <span className="nav-icon">🏫</span>
              <span>Schools</span>
            </li>
            <li 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">👥</span>
              <span>Users</span>
            </li>
            <li 
              className={activeTab === 'analytics' ? 'active' : ''}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="nav-icon">📈</span>
              <span>Analytics</span>
            </li>
            <li 
              className={activeTab === 'emailQueue' ? 'active' : ''}
              onClick={() => setActiveTab('emailQueue')}
            >
              <span className="nav-icon">📧</span>
              <span>Email Queue</span>
            </li>
          </ul>
        </div>
        
        {/* Main Content Area */}
        <div className="admin-main-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
          {/* Key Metrics */}
          <div className="admin-stats">
            <div className="stat-card primary clickable" onClick={() => setActiveTab('schools')}>
              <div className="stat-icon">🏫</div>
              <div className="stat-content">
                <div className="stat-value">{stats.schools}</div>
                <div className="stat-label">Total Schools</div>
                <div className="stat-trend">+2 this month</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
            <div className="stat-card success clickable" onClick={() => setActiveTab('users')}>
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.alumni.toLocaleString()}</div>
                <div className="stat-label">Registered Alumni</div>
                <div className="stat-trend">+{Math.floor(stats.alumni * 0.05)} this week</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
            <div className="stat-card warning clickable" onClick={() => setActiveTab('registrations')}>
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-value">{stats.pendingRegistrations}</div>
                <div className="stat-label">Pending Approvals</div>
                <div className="stat-trend">Requires attention</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
            <div className="stat-card info clickable" onClick={() => setActiveTab('users')}>
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <div className="stat-value">{stats.users}</div>
                <div className="stat-label">Active Users</div>
                <div className="stat-trend">+1 today</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
            <div className="stat-card secondary clickable" onClick={() => navigate('/email-queue')}>
              <div className="stat-icon">📧</div>
              <div className="stat-content">
                <div className="stat-value">{stats.emailsQueued}</div>
                <div className="stat-label">Emails Queued</div>
                <div className="stat-trend">System active</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
            <div className="stat-card accent clickable" onClick={() => setActiveTab('registrations')}>
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.completedRegistrations}</div>
                <div className="stat-label">Approved</div>
                <div className="stat-trend">This month</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
          </div>

          <div className="admin-sections">
            <section className="panel">
              <div className="panel-header">
                <h2>System Status</h2>
                <p className="panel-subtitle">Click on the metric cards above to navigate to detailed views</p>
              </div>
              <div className="panel-body">
                <div className="status-grid">
                  <div className="status-item">
                    <div className="status-indicator active"></div>
                    <div className="status-content">
                      <div className="status-title">Database</div>
                      <div className="status-desc">Connected</div>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator active"></div>
                    <div className="status-content">
                      <div className="status-title">Email System</div>
                      <div className="status-desc">Operational</div>
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-indicator warning"></div>
                    <div className="status-content">
                      <div className="status-title">Pending Reviews</div>
                      <div className="status-desc">{stats.pendingRegistrations} items</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="panel">
              <div className="panel-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="panel-body">
                <div className="activity-list">
                  {recentPending.slice(0, 3).map((p) => (
                    <div key={p.id} className="activity-item">
                      <div className="activity-icon">📝</div>
                      <div className="activity-content">
                        <div className="activity-title">New Registration Request</div>
                        <div className="activity-details">{p.alumni_id} - {p.email}</div>
                        <div className="activity-time">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                  {recentSchools.slice(0, 2).map((s) => (
                    <div key={s.id} className="activity-item">
                      <div className="activity-icon">🏫</div>
                      <div className="activity-content">
                        <div className="activity-title">New School Added</div>
                        <div className="activity-details">{s.name} - {s.state}</div>
                        <div className="activity-time">{new Date(s.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pending Registrations - Full Width */}
            <section className="panel full-width">
              <div className="panel-header">
                <h2>Recent Pending Registrations</h2>
                <Link to="/pending-registrations" className="panel-action">View All</Link>
              </div>
              <div className="panel-body">
                {loading ? (
                  <p>Loading...</p>
                ) : recentPending.length === 0 ? (
                  <p>No pending registrations found.</p>
                ) : (
                  <div className="pending-registrations-table-container">
                    <table className="pending-registrations-table">
                      <thead>
                        <tr>
                          <th className="col-id">ID</th>
                          <th className="col-name">Full Name</th>
                          <th className="col-email">Email Address</th>
                          <th className="col-school">School</th>
                          <th className="col-location">Location</th>
                          <th className="col-level">Level</th>
                          <th className="col-graduation">Graduation Year</th>
                          <th className="col-alumni-id">Alumni ID</th>
                          <th className="col-status">Status</th>
                          <th className="col-requested">Requested</th>
                          <th className="col-actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPending.map((p) => (
                          <tr key={p.id} className="registration-row">
                            <td className="col-id">{p.id}</td>
                            <td className="col-name">{p.alumni_id || '—'}</td>
                            <td className="col-email">{p.email || '—'}</td>
                            <td className="col-school">{p.school_name || p.alumni?.schools?.name || 'N/A'}</td>
                            <td className="col-location">
{p.school_lga && `${p.school_lga}, `}
{p.school_state || p.alumni?.schools?.state || 'N/A'}
                            </td>
                            <td className="col-level">{p.school_level || p.alumni?.schools?.level || 'N/A'}</td>
                            <td className="col-graduation">{p.graduation_year || p.alumni?.graduation_year || 'N/A'}</td>
                            <td className="col-alumni-id">{p.alumni?.id || p.alumni_id || 'Loading...'}</td>
                            <td className="col-status">
                              <span className={`status-badge ${p.status || 'pending'}`}>
                                {p.status || 'pending'}
                              </span>
                            </td>
                            <td className="col-requested">
                              {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                            </td>
                            <td className="col-actions">
                              <Link to="/pending-registrations" className="action-btn">Review</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {activeTab === 'registrations' && (
        <div className="tab-content">
          {/* Registration Statistics */}
          <section className="panel">
            <div className="panel-header">
              <h2>Registration Statistics</h2>
              <p className="panel-subtitle">Click on a status card to view detailed registrations</p>
            </div>
            <div className="panel-body">
              <div className="stats-grid">
                <div 
                  className={`stat-item clickable ${selectedRegistrationStatus === 'pending' ? 'active' : ''}`}
                  onClick={() => setSelectedRegistrationStatus('pending')}
                >
                  <div className="stat-number pending">{stats.pendingRegistrations}</div>
                  <div className="stat-text">Pending</div>
                  <div className="stat-arrow">→</div>
                </div>
                <div 
                  className={`stat-item clickable ${selectedRegistrationStatus === 'approved' ? 'active' : ''}`}
                  onClick={() => setSelectedRegistrationStatus('approved')}
                >
                  <div className="stat-number completed">{stats.completedRegistrations}</div>
                  <div className="stat-text">Approved</div>
                  <div className="stat-arrow">→</div>
                </div>
                <div 
                  className={`stat-item clickable ${selectedRegistrationStatus === 'rejected' ? 'active' : ''}`}
                  onClick={() => setSelectedRegistrationStatus('rejected')}
                >
                  <div className="stat-number rejected">{stats.rejectedRegistrations}</div>
                  <div className="stat-text">Declined</div>
                  <div className="stat-arrow">→</div>
                </div>
              </div>
            </div>
          </section>

          {/* Pending Registrations - Full Width Below Statistics */}
          <section className="panel full-width">
            <div className="panel-header">
              <h2>{selectedRegistrationStatus.charAt(0).toUpperCase() + selectedRegistrationStatus.slice(1)} Registrations</h2>
              <div className="panel-actions">
                <span className="registration-count">
                  {getDisplayCount()} {showAllRegistrations ? 'total' : 'recent'}
                </span>
                {selectedRegistrationStatus === 'pending' && selectedRegistrations.size > 0 && (
                  <button 
                    className="btn-danger"
                    onClick={handleBulkDelete}
                    title={`Delete ${selectedRegistrations.size} selected registration(s)`}
                  >
                    🗑 Delete Selected ({selectedRegistrations.size})
                  </button>
                )}
                <button 
                  className="panel-action"
                  onClick={() => setShowAllRegistrations(!showAllRegistrations)}
                >
                  {showAllRegistrations ? 'Show Recent' : 'View All'}
                </button>
              </div>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading registrations...</p>
                </div>
              ) : (
                <div className="pending-registrations-table-container">
                  <table className="pending-registrations-table">
                      <thead>
                        <tr>
                          <th className="col-select">
                            <input
                              type="checkbox"
                              checked={selectedRegistrations.size === getDisplayData().length && getDisplayData().length > 0}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                              title="Select All"
                            />
                          </th>
                          <th 
                            className={`col-id sortable ${sortField === 'id' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('id')}
                          >
                            ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-name sortable ${sortField === 'alumni_id' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('alumni_id')}
                          >
                            Alumni ID {sortField === 'alumni_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-email sortable ${sortField === 'email' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('email')}
                          >
                            Email Address {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-school sortable ${sortField === 'school' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('school')}
                          >
                            School {sortField === 'school' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-location sortable ${sortField === 'location' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('location')}
                          >
                            Location {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-level sortable ${sortField === 'level' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('level')}
                          >
                            Level {sortField === 'level' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-graduation sortable ${sortField === 'graduation_year' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('graduation_year')}
                          >
                            Graduation Year {sortField === 'graduation_year' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-status sortable ${sortField === 'status' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('status')}
                          >
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th 
                            className={`col-requested sortable ${sortField === 'created_at' ? `sort-${sortDirection}` : ''}`}
                            onClick={() => handleSort('created_at')}
                          >
                            Requested {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="col-actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRegistrationStatus === 'pending' && sortedPending.map((p) => (
                          <tr key={p.id} className="registration-row">
                            <td className="col-select">
                              <input
                                type="checkbox"
                                checked={selectedRegistrations.has(p.id)}
                                onChange={(e) => handleSelectRegistration(p.id, e.target.checked)}
                                title="Select Registration"
                              />
                            </td>
                            <td className="col-id">{p.id}</td>
                            <td className="col-name">{p.alumni_id || '—'}</td>
                            <td className="col-email">{p.email || '—'}</td>
                            <td className="col-school">{p.school_name || p.alumni?.schools?.name || 'N/A'}</td>
                            <td className="col-location">
{p.school_lga && `${p.school_lga}, `}
{p.school_state || p.alumni?.schools?.state || 'N/A'}
                            </td>
                            <td className="col-level">{p.school_level || p.alumni?.schools?.level || 'N/A'}</td>
                            <td className="col-graduation">{p.graduation_year || p.alumni?.graduation_year || 'N/A'}</td>
                            <td className="col-status">
                              <span className={`status-badge ${p.status || 'pending'}`}>
                                {p.status || 'pending'}
                              </span>
                            </td>
                            <td className="col-requested">
                              {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                            </td>
                            <td className="col-actions">
                              <div className="action-buttons">
                                <button 
                                  className="action-btn approve"
                                  onClick={() => handleApprove(p.id)}
                                  title="Approve Registration"
                                >
                                  ✓ Approve
                                </button>
                                <button 
                                  className="action-btn decline"
                                  onClick={() => handleDecline(p.id)}
                                  title="Decline Registration"
                                >
                                  ✗ Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {selectedRegistrationStatus === 'approved' && getDisplayData().map((p) => (
                        <tr key={p.id} className="registration-row">
                          <td className="col-select">
                            <input
                              type="checkbox"
                              checked={selectedRegistrations.has(p.id)}
                              onChange={(e) => handleSelectRegistration(p.id, e.target.checked)}
                              title="Select Registration"
                            />
                          </td>
                          <td className="col-id">{p.id}</td>
                          <td className="col-name">{p.alumni_id}</td>
                          <td className="col-email">{p.email}</td>
                          <td className="col-school">N/A</td>
                          <td className="col-location">N/A</td>
                          <td className="col-level">N/A</td>
                          <td className="col-graduation">N/A</td>
                          <td className="col-status">
                            <span className="status-badge approved">APPROVED</span>
                          </td>
                          <td className="col-requested">{new Date(p.created_at).toLocaleString()}</td>
                          <td className="col-actions">
                            <div className="action-buttons">
                              <button 
                                className="btn-success"
                                onClick={() => handleApprove(p.id)}
                                disabled={actionLoading[p.id]}
                              >
                                {actionLoading[p.id] ? 'Processing...' : 'Approve'}
                              </button>
                              <button 
                                className="btn-danger"
                                onClick={() => handleDecline(p.id)}
                                disabled={actionLoading[p.id]}
                              >
                                {actionLoading[p.id] ? 'Processing...' : 'Decline'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {selectedRegistrationStatus === 'approved' && getDisplayData().length === 0 && (
                        <tr className="no-data-row">
                          <td colSpan="10" className="no-data">
                            <div className="no-data-content">
                              <span className="no-data-icon">✅</span>
                              <p>No approved registrations found</p>
                              <small>Approved registrations will appear here once processed</small>
                            </div>
                          </td>
                        </tr>
                      )}
                      {selectedRegistrationStatus === 'rejected' && getDisplayData().map((p) => (
                        <tr key={p.id} className="registration-row">
                          <td className="col-select">
                            <input
                              type="checkbox"
                              checked={selectedRegistrations.has(p.id)}
                              onChange={(e) => handleSelectRegistration(p.id, e.target.checked)}
                              title="Select Registration"
                            />
                          </td>
                          <td className="col-id">{p.id}</td>
                          <td className="col-name">{p.alumni_id}</td>
                          <td className="col-email">{p.email}</td>
                          <td className="col-school">N/A</td>
                          <td className="col-location">N/A</td>
                          <td className="col-level">N/A</td>
                          <td className="col-graduation">N/A</td>
                          <td className="col-status">
                            <span className="status-badge rejected">DECLINED</span>
                          </td>
                          <td className="col-requested">{new Date(p.created_at).toLocaleString()}</td>
                          <td className="col-actions">
                            <div className="action-buttons">
                              <button 
                                className="btn-success"
                                onClick={() => handleApprove(p.id)}
                                disabled={actionLoading[p.id]}
                              >
                                {actionLoading[p.id] ? 'Processing...' : 'Approve'}
                              </button>
                              <button 
                                className="btn-danger"
                                onClick={() => handleDecline(p.id)}
                                disabled={actionLoading[p.id]}
                              >
                                {actionLoading[p.id] ? 'Processing...' : 'Decline'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {selectedRegistrationStatus === 'rejected' && getDisplayData().length === 0 && (
                        <tr className="no-data-row">
                          <td colSpan="10" className="no-data">
                            <div className="no-data-content">
                              <span className="no-data-icon">❌</span>
                              <p>No declined registrations found</p>
                              <small>Declined registrations will appear here if any</small>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Schools Tab */}
      {activeTab === 'schools' && (
        <div className="tab-content">
          {/* Schools Statistics */}
          <section className="panel">
            <div className="panel-header">
              <h2>School Statistics</h2>
              <p className="panel-subtitle">Manage schools in the system</p>
            </div>
            <div className="panel-body">
              <div className="stats-grid">
                <div 
                  className={`stat-item clickable ${selectedSchoolStatus === 'total' ? 'active' : ''}`}
                  onClick={() => setSelectedSchoolStatus('total')}
                >
                  <div className="stat-number primary">{stats.schools}</div>
                  <div className="stat-text">Total Schools</div>
                  <div className="stat-arrow">→</div>
                </div>
                <div 
                  className={`stat-item clickable ${selectedSchoolStatus === 'active' ? 'active' : ''}`}
                  onClick={() => setSelectedSchoolStatus('active')}
                >
                  <div className="stat-number success">{allSchools.filter(s => s.status === 'active').length}</div>
                  <div className="stat-text">Active</div>
                  <div className="stat-arrow">→</div>
                </div>
                <div 
                  className={`stat-item clickable ${selectedSchoolStatus === 'inactive' ? 'active' : ''}`}
                  onClick={() => setSelectedSchoolStatus('inactive')}
                >
                  <div className="stat-number info">{allSchools.filter(s => s.status === 'inactive').length}</div>
                  <div className="stat-text">Inactive</div>
                  <div className="stat-arrow">→</div>
                </div>
              </div>
            </div>
          </section>

          {/* Schools List - Full Width Below Statistics */}
          <section className="panel full-width">
            <div className="panel-header">
              <h2>
                {selectedSchoolStatus === 'total' && 'All Schools'}
                {selectedSchoolStatus === 'active' && 'Active Schools'}
                {selectedSchoolStatus === 'inactive' && 'Inactive Schools'}
                {selectedSchoolStatus === 'pending' && 'Pending Schools'}
              </h2>
              <div className="panel-actions">
                <span className="registration-count">
                  {getDisplayCount()} {showAllSchools ? 'total' : 'recent'} schools
                </span>
                {selectedSchools.size > 0 && (
                  <button 
                    className="btn-danger"
                    onClick={handleBulkDeleteSchools}
                    title={`Delete ${selectedSchools.size} selected school(s)`}
                  >
                    🗑 Delete Selected ({selectedSchools.size})
                  </button>
                )}
                <button 
                  className="panel-action"
                  onClick={() => setShowAllSchools(!showAllSchools)}
                >
                  {showAllSchools ? 'Show Recent' : 'View All'}
                </button>
              </div>
            </div>
            <div className="panel-body">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading schools...</p>
                </div>
              ) : recentSchools.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">🏫</span>
                    <p>No schools found</p>
                    <small>Schools will appear here once added to the system</small>
                  </div>
                </div>
              ) : (
                <div className="pending-registrations-table-container">
                  <table className="pending-registrations-table">
                    <thead>
                      <tr>
                        <th className="col-select">
                          <input
                            type="checkbox"
                            checked={selectedSchools.size === getDisplayData().length && getDisplayData().length > 0}
                            onChange={(e) => handleSelectAllSchools(e.target.checked)}
                            title="Select All"
                          />
                        </th>
                        <th className="col-id">ID</th>
                        <th className="col-name">School Name</th>
                        <th className="col-location">State</th>
                        <th className="col-lga">LGA</th>
                        <th className="col-level">Level</th>
                        <th className="col-status">Status</th>
                        <th className="col-alumni">Alumni Count</th>
                        <th className="col-requested">Created</th>
                        <th className="col-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDisplayData().map((s) => (
                        <tr key={s.id} className="registration-row">
                          <td className="col-select">
                            <input
                              type="checkbox"
                              checked={selectedSchools.has(s.id)}
                              onChange={(e) => handleSelectSchool(s.id, e.target.checked)}
                              title="Select School"
                            />
                          </td>
                          <td className="col-id">{s.id}</td>
                          <td className="col-name">{s.name || '—'}</td>
                          <td className="col-location">{s.state || '—'}</td>
                          <td className="col-lga">{s.lga || '—'}</td>
                          <td className="col-level">{s.level || '—'}</td>
                          <td className="col-status">
                            <span className={`status-badge ${s.status || 'active'}`}>
                              {s.status || 'active'}
                            </span>
                          </td>
                          <td className="col-alumni">{s.alumni_count || 0}</td>
                          <td className="col-requested">
                            {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="col-actions">
                            <div className="action-buttons">
                              <button 
                                className="action-btn approve"
                                onClick={() => alert(`Viewing school: ${s.name}`)}
                                title="View School Details"
                              >
                                👁 View
                              </button>
                              <button 
                                className="action-btn decline"
                                onClick={() => alert(`Editing school: ${s.name}`)}
                                title="Edit School"
                              >
                                ✏ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="tab-content">
          {/* Users Statistics */}
          <section className="panel">
            <div className="panel-header">
              <h2>User Statistics</h2>
              <p className="panel-subtitle">Manage users and alumni in the system</p>
            </div>
            <div className="panel-body">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number primary">{stats.users}</div>
                  <div className="stat-text">Total Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number success">{stats.alumni}</div>
                  <div className="stat-text">Alumni Users</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number info">{recentAlumni.length}</div>
                  <div className="stat-text">Recently Added</div>
                  <div className="stat-subtext">Last 20 alumni</div>
                </div>
              </div>
            </div>
          </section>

          {/* Users List - Full Width Below Statistics */}
          <section className="panel full-width">
            <div className="panel-header">
              <h2>Users Management</h2>
              <div className="panel-actions">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
                <span className="registration-count">
                  {totalUsers.toLocaleString()} total users
                </span>
                {selectedUsers.size > 0 && (
                  <button 
                    className="btn-danger"
                    onClick={handleBulkDeleteUsers}
                    title={`Delete ${selectedUsers.size} selected user(s)`}
                  >
                    🗑 Delete Selected ({selectedUsers.size})
                  </button>
                )}
                <button 
                  className="panel-action"
                  onClick={() => setShowAllUsers(!showAllUsers)}
                >
                  {showAllUsers ? 'Show Recent' : 'View All'}
                </button>
              </div>
            </div>
            <div className="panel-body">
              {isLoadingUsers ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="no-data">
                  <div className="no-data-content">
                    <span className="no-data-icon">👥</span>
                    <p>{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
                    <small>{searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}</small>
                  </div>
                </div>
              ) : (
                <div className="pending-registrations-table-container">
                  <table className="pending-registrations-table">
                    <thead>
                      <tr>
                        <th className="col-select">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                            onChange={(e) => handleSelectAllUsers(e.target.checked)}
                            title="Select All"
                          />
                        </th>
                        <th 
                          className={`col-id sortable ${sortField === 'id' ? `sort-${sortDirection}` : ''}`}
                          onClick={() => handleUserSort('id')}
                        >
                          ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          className={`col-name sortable ${sortField === 'full_name' ? `sort-${sortDirection}` : ''}`}
                          onClick={() => handleUserSort('full_name')}
                        >
                          Full Name {sortField === 'full_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          className={`col-email sortable ${sortField === 'email' ? `sort-${sortDirection}` : ''}`}
                          onClick={() => handleUserSort('email')}
                        >
                          Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="col-school">School</th>
                        <th 
                          className={`col-graduation sortable ${sortField === 'graduation_year' ? `sort-${sortDirection}` : ''}`}
                          onClick={() => handleUserSort('graduation_year')}
                        >
                          Graduation Year {sortField === 'graduation_year' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                          className={`col-requested sortable ${sortField === 'created_at' ? `sort-${sortDirection}` : ''}`}
                          onClick={() => handleUserSort('created_at')}
                        >
                          Registered {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="col-actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((a) => (
                        <tr key={a.id} className="registration-row">
                          <td className="col-select">
                            <input
                              type="checkbox"
                              checked={selectedUsers.has(a.id)}
                              onChange={(e) => handleSelectUser(a.id, e.target.checked)}
                              title="Select User"
                            />
                          </td>
                          <td className="col-id">{a.id}</td>
                          <td className="col-name">{a.full_name || '—'}</td>
                          <td className="col-email">{a.email || 'No email'}</td>
                          <td className="col-school">{a.schools?.name || '—'}</td>
                          <td className="col-graduation">{a.graduation_year || '—'}</td>
                          <td className="col-requested">
                            {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}
                          </td>
                          <td className="col-actions">
                            <div className="action-buttons">
                              <button 
                                className="action-btn approve"
                                onClick={() => alert(`Viewing user: ${a.full_name}`)}
                                title="View User Profile"
                              >
                                👁 View
                              </button>
                              <button 
                                className="action-btn decline"
                                onClick={() => alert(`Editing user: ${a.full_name}`)}
                                title="Edit User"
                              >
                                ✏ Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  {totalUsers > usersPerPage && (
                    <div className="pagination-container">
                      <div className="pagination-info">
                        Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers.toLocaleString()} users
                      </div>
                      <div className="pagination-controls">
                        <button
                          className="pagination-btn"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          ← Previous
                        </button>
                        <span className="pagination-page">
                          Page {currentPage} of {Math.ceil(totalUsers / usersPerPage)}
                        </span>
                        <button
                          className="pagination-btn"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= Math.ceil(totalUsers / usersPerPage)}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="tab-content">
          <div className="admin-sections">
            <section className="panel">
              <div className="panel-header">
                <h2>Platform Analytics</h2>
                <div className="analytics-filters">
                  <select className="filter-select">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
              <div className="panel-body">
                <div className="analytics-grid">
                  <div className="analytics-card">
                    <h3>📊 Registration Trends</h3>
                    <div className="chart-container">
                      <div className="mini-chart">
                        <div className="chart-bars">
                          <div className="bar" style={{height: '60%'}}></div>
                          <div className="bar" style={{height: '80%'}}></div>
                          <div className="bar" style={{height: '45%'}}></div>
                          <div className="bar" style={{height: '90%'}}></div>
                          <div className="bar" style={{height: '75%'}}></div>
                          <div className="bar" style={{height: '85%'}}></div>
                          <div className="bar" style={{height: '70%'}}></div>
                        </div>
                        <div className="chart-labels">
                          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                        </div>
                      </div>
                    </div>
                    <div className="analytics-stats">
                      <div className="analytics-item">
                        <span className="label">Total Registrations:</span>
                        <span className="value">{stats.completedRegistrations + stats.pendingRegistrations + stats.rejectedRegistrations}</span>
                      </div>
                      <div className="analytics-item">
                        <span className="label">Success Rate:</span>
                        <span className="value success">
                          {stats.completedRegistrations + stats.pendingRegistrations + stats.rejectedRegistrations > 0 
                            ? Math.round((stats.completedRegistrations / (stats.completedRegistrations + stats.pendingRegistrations + stats.rejectedRegistrations)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="analytics-item">
                        <span className="label">Avg. Processing Time:</span>
                        <span className="value">2.3 days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h3>📧 Email System Status</h3>
                    <div className="email-status">
                      <div className="status-indicator active"></div>
                      <span>System Active</span>
                    </div>
                    <div className="analytics-stats">
                      <div className="analytics-item">
                        <span className="label">Emails Queued:</span>
                        <span className="value">{stats.emailsQueued}</span>
                      </div>
                      <div className="analytics-item">
                        <span className="label">Delivery Rate:</span>
                        <span className="value success">98.5%</span>
                      </div>
                      <div className="analytics-item">
                        <span className="label">Avg. Send Time:</span>
                        <span className="value">2.1s</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h3>🏫 School Distribution</h3>
                    <div className="school-distribution">
                      <div className="distribution-item">
                        <div className="school-type">Universities</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '45%'}}></div>
                        </div>
                        <div className="percentage">45%</div>
                      </div>
                      <div className="distribution-item">
                        <div className="school-type">Polytechnics</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '30%'}}></div>
                        </div>
                        <div className="percentage">30%</div>
                      </div>
                      <div className="distribution-item">
                        <div className="school-type">High Schools</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '20%'}}></div>
                        </div>
                        <div className="percentage">20%</div>
                      </div>
                      <div className="distribution-item">
                        <div className="school-type">Primary Schools</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '5%'}}></div>
                        </div>
                        <div className="percentage">5%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="analytics-card">
                    <h3>📈 Growth Metrics</h3>
                    <div className="growth-metrics">
                      <div className="metric-item">
                        <div className="metric-icon">👥</div>
                        <div className="metric-content">
                          <div className="metric-label">Alumni Growth</div>
                          <div className="metric-value">+12.5%</div>
                          <div className="metric-period">vs last month</div>
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-icon">🏫</div>
                        <div className="metric-content">
                          <div className="metric-label">School Growth</div>
                          <div className="metric-value">+8.3%</div>
                          <div className="metric-period">vs last month</div>
                        </div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-icon">📧</div>
                        <div className="metric-content">
                          <div className="metric-label">Email Engagement</div>
                          <div className="metric-value">+15.2%</div>
                          <div className="metric-period">vs last month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Email Queue Tab */}
      {activeTab === 'emailQueue' && (
        <div className="tab-content">
          <div className="admin-sections">
            <section className="panel">
              <div className="panel-header">
                <h2>Email Queue Management</h2>
                <div className="panel-actions">
                  <button className="btn-primary">Refresh Queue</button>
                  <button className="btn-secondary">Clear Failed</button>
                </div>
              </div>
              <div className="panel-body">
                <div className="email-queue-stats">
                  <div className="queue-stat">
                    <div className="queue-stat-number">{stats.emailsQueued}</div>
                    <div className="queue-stat-label">Queued</div>
                  </div>
                  <div className="queue-stat">
                    <div className="queue-stat-number">0</div>
                    <div className="queue-stat-label">Processing</div>
                  </div>
                  <div className="queue-stat">
                    <div className="queue-stat-number">0</div>
                    <div className="queue-stat-label">Failed</div>
                  </div>
                  <div className="queue-stat">
                    <div className="queue-stat-number">0</div>
                    <div className="queue-stat-label">Sent Today</div>
                  </div>
                </div>
                
                <div className="email-queue-table-container">
                  <table className="email-queue-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Recipient</th>
                        <th>Subject</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Attempts</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="no-data-row">
                        <td colSpan="8" className="no-data">
                          <div className="no-data-content">
                            <span className="no-data-icon">📧</span>
                            <p>No emails in queue</p>
                            <small>Email queue is empty or emails are being processed</small>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default Admin;