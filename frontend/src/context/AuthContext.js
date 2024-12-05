import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (userData) => {
    if (userData) {
      const userToStore = {
        ...userData,
        addresses: userData.addresses || []
      };
      localStorage.setItem('userData', JSON.stringify(userToStore));
      setUserState(userToStore);
    } else {
      localStorage.removeItem('userData');
      setUserState(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (!parsedUser.addresses) {
            parsedUser.addresses = [];
          }
          setUserState(parsedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 