import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('nexvest_token') || null);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState([]);
  const [currentSimulation, setCurrentSimulation] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('nexvest_token');
    const savedUser = sessionStorage.getItem('nexvest_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback((newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    sessionStorage.setItem('nexvest_token', newToken);
    sessionStorage.setItem('nexvest_user', JSON.stringify(userData));
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
    sessionStorage.setItem('nexvest_user', JSON.stringify(userData));
  }, []);

  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const refreshSimulations = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/simulations`);
      setSimulations(res.data || []);
    } catch (e) {
      console.error('Failed to refresh simulations:', e);
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setSimulations([]);
    setCurrentSimulation(null);
    sessionStorage.removeItem('nexvest_token');
    sessionStorage.removeItem('nexvest_user');
  }, []);

  const isAuthenticated = !!user && !!token;
  const profile = user ? { full_name: user.full_name, email: user.email } : null;

  const value = useMemo(() => ({
    user,
    profile,
    token,
    loading,
    isAuthenticated,
    simulations,
    currentSimulation,
    setCurrentSimulation,
    login,
    updateUser,
    getAuthHeaders,
    signOut,
    refreshSimulations,
  }), [user, profile, token, loading, isAuthenticated, simulations, currentSimulation, login, updateUser, getAuthHeaders, signOut, refreshSimulations]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
