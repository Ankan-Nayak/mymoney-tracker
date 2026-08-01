import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Load user and token on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Setup initial theme
        const currentTheme = parsedUser.darkTheme ? 'dark' : savedTheme;
        setTheme(currentTheme);
        applyTheme(currentTheme);
      } catch (e) {
        console.error(e);
      }
    } else {
      applyTheme(savedTheme);
      setTheme(savedTheme);
    }
    setLoading(false);
  }, []);

  const applyTheme = (t) => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', t);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    
    // Sync with backend if user is authenticated
    if (user) {
      try {
        const updated = { ...user, darkTheme: newTheme === 'dark' };
        await api.put('/api/profile', { darkTheme: newTheme === 'dark' });
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to sync theme with backend', err);
      }
    }
  };

  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { jwt, ...userData } = response.data;
    
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    
    const initialTheme = userData.darkTheme ? 'dark' : 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
    return userData;
  };

  const googleLoginHandler = async (googlePayload) => {
    const response = await api.post('/api/auth/google', googlePayload);
    const { jwt, ...userData } = response.data;
    
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    
    const initialTheme = userData.darkTheme ? 'dark' : 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
    return userData;
  };

  const register = async (username, email, password, phone) => {
    await api.post('/api/auth/register', { username, email, password, phone });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await api.put('/api/profile', profileData);
    const updatedUser = {
      ...user,
      phone: response.data.phone,
      currency: response.data.currency,
      darkTheme: response.data.darkTheme,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const updatedUser = {
      ...user,
      profilePicture: response.data.profilePicture,
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const changePassword = async (oldPassword, newPassword) => {
    await api.put('/api/profile/password', { oldPassword, newPassword });
  };

  const deleteAccount = async () => {
    await api.delete('/api/profile');
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        theme,
        toggleTheme,
        login,
        googleLogin: googleLoginHandler,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
