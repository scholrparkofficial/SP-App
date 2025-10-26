import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, signupWithEmail, loginWithEmail, logoutUser, createUserDocument } from '../firebase';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Create or update user document in Firestore
        try {
          await createUserDocument(currentUser);
        } catch (error) {
          console.error('Error creating user document:', error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      return await signupWithEmail(email, password);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      return await loginWithEmail(email, password);
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      return await loginWithGoogle();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      return await logoutUser();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    googleLogin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};