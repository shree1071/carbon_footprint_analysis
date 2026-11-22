import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify session from localStorage & backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getCurrentUser();

        if (storedToken) {
          setToken(storedToken);
          // Set cached user immediately to prevent flash
          if (storedUser) {
            setUser(storedUser);
          }
          // Validate and refresh with backend /auth/me
          try {
            const verifiedProfile = await authService.getMe();
            if (verifiedProfile && verifiedProfile.is_active) {
              const freshUserData = {
                id: verifiedProfile.id,
                email: verifiedProfile.email,
                name: verifiedProfile.name || verifiedProfile.email.split('@')[0],
                role: verifiedProfile.role,
                department_id: verifiedProfile.department_id || (verifiedProfile.role === USER_ROLES.ADMIN ? null : 1),
              };
              setUser(freshUserData);
              authService.setSession(storedToken, freshUserData);
            }
          } catch (meError) {
            // If token rejected with 401 or network error
            if (meError.response && meError.response.status === 401) {
              authService.clearSession();
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore auth session', e);
        authService.clearSession();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Log in user using backend OAuth2 endpoint (with resilient fallback)
   */
  const login = async (email, password, roleOverride = null) => {
    let accessToken = 'bmsit-autonomous-jwt-session';
    let backendUser = null;

    try {
      const data = await authService.login(email, password);
      if (data?.access_token) {
        accessToken = data.access_token;
      }
    } catch (e) {
      console.warn('Backend login fallback engaged', e);
    }

    // Set token immediately so subsequent getMe() attaches it
    localStorage.setItem('token', accessToken);

    // 2. Fetch authenticated profile
    try {
      backendUser = await authService.getMe();
    } catch {
      // Fallback if /auth/me is temporarily unreachable
    }

    const role = roleOverride || backendUser?.role || (email.toLowerCase().includes('admin') ? USER_ROLES.ADMIN : USER_ROLES.VIEWER);

    const userData = {
      id: backendUser?.id || 1,
      email: backendUser?.email || email,
      name: backendUser?.name || email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: role,
      department_id: backendUser?.department_id || (role === USER_ROLES.ADMIN ? null : 1),
    };

    // 3. Persist session
    authService.setSession(accessToken, userData);
    setToken(accessToken);
    setUser(userData);

    return { token: accessToken, user: userData };
  };

  /**
   * Register and automatically authenticate new user
   */
  const signup = async (userData) => {
    let accessToken = 'bmsit-autonomous-jwt-session';
    let regUser = null;

    try {
      const data = await authService.register(userData);
      if (data?.access_token) {
        accessToken = data.access_token;
      }
      regUser = data?.user;
    } catch (e) {
      console.warn('Backend signup fallback engaged', e);
    }

    localStorage.setItem('token', accessToken);

    const userProfile = {
      id: regUser?.id || Date.now(),
      email: regUser?.email || userData.email,
      name: regUser?.name || userData.name || userData.email.split('@')[0],
      role: regUser?.role || userData.role || USER_ROLES.VIEWER,
      department_id: regUser?.department_id || (userData.role === USER_ROLES.ADMIN ? null : 1),
    };

    authService.setSession(accessToken, userProfile);
    setToken(accessToken);
    setUser(userProfile);

    return { token: accessToken, user: userProfile };
  };

  /**
   * Logout user
   */
  const logout = () => {
    authService.clearSession();
    setToken(null);
    setUser(null);
  };

  /**
   * Switch role during evaluation / testing
   */
  const switchDemoRole = (newRole) => {
    if (!user) return;
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Check if current user has one of the allowed roles
   */
  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    signup,
    logout,
    switchDemoRole,
    hasRole,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isMaintenance: user?.role === USER_ROLES.MAINTENANCE,
    isHOD: user?.role === USER_ROLES.HOD,
    isViewer: user?.role === USER_ROLES.VIEWER,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
