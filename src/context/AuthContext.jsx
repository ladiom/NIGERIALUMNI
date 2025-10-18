import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null); // row from users table

  const fetchUserProfile = async (uid) => {
    try {
      console.log('Fetching user profile for:', uid);
      
      // Add timeout to prevent blocking authentication
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      if (error && error.code !== 'PGRST116') {
        console.warn('Fetch users row error:', error);
        setUserProfile(null);
      } else {
        console.log('User profile fetched:', data);
        setUserProfile(data || null);
      }
    } catch (e) {
      console.warn('Fetch users row caught error:', e);
      setUserProfile(null);
    }
  };

  const ensureUserRow = async (u) => {
    if (!u?.id) return;
    try {
      await supabase
        .from('users')
        .upsert({ id: u.id, email: u.email || '' }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Upsert users row error:', e);
    }
  };

  // Check if user is authenticated on component mount
  useEffect(() => {
    let fallbackTimeout;
    
    const checkUser = async () => {
      try {
        setLoading(true);
        console.log('Checking authentication...');
        
        // Quick check if we're on home page and no auth needed
        if (window.location.pathname === '/' || window.location.pathname === '/home') {
          console.log('On home page, skipping auth check');
          setUser(null);
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          // Handle AuthSessionMissingError gracefully
          if (error.name === 'AuthSessionMissingError') {
            // This is expected when no user is logged in
            console.log('No user session found');
            setUser(null);
          } else {
            console.error('Error getting user:', error);
            setUser(null);
          }
        } else {
          console.log('User authenticated:', data.user?.email);
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        console.log('Auth check complete, setting loading to false');
        setLoading(false);
      }
    };

    checkUser();

    // Only set fallback timeout if we're not on home page
    if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
      fallbackTimeout = setTimeout(() => {
        console.log('Fallback timeout: forcing loading to false');
        setLoading(false);
      }, 15000); // Increased to 15 seconds to allow for slower database queries
    }

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, { hasUser: !!session?.user, userEmail: session?.user?.email });
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false); // Reset loading state when auth state changes
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout); // Clear fallback timeout
      }
      if (nextUser?.id) {
        // Don't wait for these - let them run in background
        ensureUserRow(nextUser).catch(e => console.warn('ensureUserRow error:', e));
        fetchUserProfile(nextUser.id).catch(e => console.warn('fetchUserProfile error:', e));
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Login response:', { hasUser: !!data?.user, error: error?.message });
      
      if (error) {
        console.error('Login error:', error);
        return { success: false, error };
      }
      
      if (data?.user) {
        // The auth state change listener will handle setUser, so we don't need to call it here
        // Just ensure the user row exists and fetch profile
        if (data.user.id) {
          ensureUserRow(data.user).catch(e => console.warn('ensureUserRow error:', e));
          fetchUserProfile(data.user.id).catch(e => console.warn('fetchUserProfile error:', e));
        }
        return { success: true, user: data.user };
      } else {
        return { 
          success: false, 
          error: { 
            message: 'No user data received from authentication.' 
          } 
        };
      }
    } catch (error) {
      console.error('Login exception:', error);
      return { 
        success: false, 
        error: { 
          message: error.message || 'Login failed. Please try again.' 
        } 
      };
    }
  };

  // Register function
  const register = async (email, password, fullName) => {
    try {
      console.log('Creating Supabase Auth user for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { fullName }
        }
      });
      
      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      setUser(null);
      setUserProfile(null);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const isAdmin = !!(userProfile?.roles && userProfile.roles.includes('admin')) || 
                  (user?.email === 'admin@example.com') ||
                  (user?.email === 'admin@Example.com'); // Fallback admin check with case variations
  
  console.log('AuthContext state:', { 
    hasUser: !!user, 
    userEmail: user?.email, 
    hasUserProfile: !!userProfile, 
    roles: userProfile?.roles, 
    isAdmin,
    loading 
  });

  const value = {
    user,
    loading,
    userProfile,
    roles: userProfile?.roles || [],
    isAdmin,
    fetchUserProfile,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};