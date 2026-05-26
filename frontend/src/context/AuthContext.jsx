// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

// Create the global session context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read active session keys from localStorage when components boot
  useEffect(() => {
    try {
      const persistedUser = localStorage.getItem('user');
      if (persistedUser) {
        setUser(JSON.parse(persistedUser));
      }
    } catch (error) {
      console.error('Failed to parse active user context:', error);
      localStorage.removeItem('user'); // Clear corrupted storage
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log user session context in state and save keys to disk
   * @param {Object} userData - Session payload returned by API (contains token, role, email, name)
   */
  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Remove session references and clear active context variables
   */
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
