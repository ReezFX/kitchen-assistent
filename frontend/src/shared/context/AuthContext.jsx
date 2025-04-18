import React, { createContext, useState, useEffect } from 'react';
import api from '../../core/api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on app init
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Validate token by getting profile data
          try {
            const { data } = await api.get('/auth/profile');
            setUser(prevUser => ({
              ...prevUser,
              ...data
            }));
          } catch (error) {
            // Token might be expired, log out user
            logout();
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register user
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/register', {
        username,
        email,
        password
      });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with API URL:', api.defaults.baseURL);
      
      const { data } = await api.post('/auth/login', {
        email,
        password,
        rememberMe
      });
      
      console.log('Login successful');
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = 'Login fehlgeschlagen';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || `Login fehlgeschlagen (${error.response.status})`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Server nicht erreichbar. Bitte überprüfen Sie Ihre Internetverbindung.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Ein unbekannter Fehler ist aufgetreten.';
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await api.put('/auth/profile', userData);
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 