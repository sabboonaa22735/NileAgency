import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  selectRole: async () => {},
  updateRegistrationStatus: () => {},
  refreshUser: async () => {},
  logout: () => {}
});

const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const oauthToken = urlParams.get('token');
        
        if (oauthToken) {
          localStorage.setItem('token', oauthToken);
          window.history.replaceState({}, '', window.location.pathname);
        }
        
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (!token || !savedUser) {
          if (token) {
            try {
              const { data } = await authApi.me();
              localStorage.setItem('user', JSON.stringify(data));
              setUser(data);
              setLoading(false);
              return;
            } catch (err) {
              clearAuthData();
              setLoading(false);
              return;
            }
          }
          setLoading(false);
          return;
        }
        
        let parsedUser;
        try {
          parsedUser = JSON.parse(savedUser);
        } catch (e) {
          clearAuthData();
          setLoading(false);
          return;
        }
        
        if (!parsedUser || typeof parsedUser !== 'object' || !parsedUser.email) {
          clearAuthData();
          setLoading(false);
          return;
        }
        
        setUser(parsedUser);
        
        if (parsedUser.registrationStatus === 'approved') {
          try {
            const { data } = await authApi.me();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
              clearAuthData();
              setUser(null);
            }
          }
        }
      } catch (err) {
        clearAuthData();
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (email, password) => {
    const { data } = await authApi.register({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const selectRole = useCallback(async (role) => {
    const { data } = await authApi.selectRole({ role });
    const updatedUser = { ...user, role, registrationStatus: data.user.registrationStatus };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  }, [user]);

  const updateRegistrationStatus = useCallback((status) => {
    const updatedUser = { ...user, registrationStatus: status };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    register,
    selectRole,
    updateRegistrationStatus,
    refreshUser,
    logout,
    loading
  }), [user, login, register, selectRole, updateRegistrationStatus, refreshUser, logout, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};