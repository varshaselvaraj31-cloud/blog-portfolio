import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// Recognized admin emails
const ADMIN_EMAILS = [
  (process.env.REACT_APP_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
  'admin@blog.com',
  'admin@portfolio.com',
  'admin@admin.com'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to check if email has admin privileges
  const checkIsAdmin = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().startsWith('admin@');
  };

  useEffect(() => {
    // 1. Check local session storage fallback first
    const savedUser = localStorage.getItem('blog_auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('blog_auth_user');
      }
    }

    // 2. Subscribe to Firebase Auth state changes
    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const authUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            isAdmin: checkIsAdmin(firebaseUser.email)
          };
          setUser(authUser);
          localStorage.setItem('blog_auth_user', JSON.stringify(authUser));
        } else {
          // If Firebase says no user and no local fallback
          if (!localStorage.getItem('blog_auth_user')) {
            setUser(null);
          }
        }
        setLoading(false);
      });
    } catch (err) {
      console.warn("Firebase Auth listener error:", err.message);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // Signup with Firebase Authentication
  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        isAdmin: checkIsAdmin(userCredential.user.email)
      };
      setUser(authUser);
      localStorage.setItem('blog_auth_user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    } catch (firebaseError) {
      // If Firebase key is dummy / invalid-api-key / project-not-found / network offline,
      // provide local authentication support so the application functions even before cloud project setup
      const isPlaceholderConfig = !process.env.REACT_APP_FIREBASE_API_KEY ||
        firebaseError.code === 'auth/invalid-api-key' ||
        firebaseError.code === 'auth/api-key-not-valid' ||
        firebaseError.code === 'auth/network-request-failed';

      if (isPlaceholderConfig) {
        console.info("Using local authentication mode:", firebaseError.message);
        // Save user to mock store in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const existing = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          throw new Error('An account with this email already exists.');
        }

        const newUser = {
          uid: 'usr_' + Date.now(),
          email: email,
          password: password,
          isAdmin: checkIsAdmin(email)
        };
        storedUsers.push(newUser);
        localStorage.setItem('registered_users', JSON.stringify(storedUsers));

        const authUser = {
          uid: newUser.uid,
          email: newUser.email,
          displayName: email.split('@')[0],
          isAdmin: newUser.isAdmin
        };
        setUser(authUser);
        localStorage.setItem('blog_auth_user', JSON.stringify(authUser));
        return { success: true, user: authUser, note: 'Local Auth Mode Active' };
      }

      // Format clean error message from Firebase error code
      let message = firebaseError.message;
      if (firebaseError.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please log in.';
      } else if (firebaseError.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        message = 'Please provide a valid email address.';
      }
      throw new Error(message);
    }
  };

  // Login with Firebase Authentication
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        isAdmin: checkIsAdmin(userCredential.user.email)
      };
      setUser(authUser);
      localStorage.setItem('blog_auth_user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    } catch (firebaseError) {
      // Fallback for local testing or placeholder keys
      const isPlaceholderConfig = !process.env.REACT_APP_FIREBASE_API_KEY ||
        firebaseError.code === 'auth/invalid-api-key' ||
        firebaseError.code === 'auth/api-key-not-valid' ||
        firebaseError.code === 'auth/network-request-failed';

      if (isPlaceholderConfig) {
        console.info("Attempting local authentication login:", firebaseError.message);
        // Check default admin shortcut
        if (checkIsAdmin(email) && password.length >= 4) {
          const adminUser = {
            uid: 'admin_master_1',
            email: email,
            displayName: 'Administrator',
            isAdmin: true
          };
          setUser(adminUser);
          localStorage.setItem('blog_auth_user', JSON.stringify(adminUser));
          return { success: true, user: adminUser, note: 'Admin Login Active' };
        }

        // Check local registered users
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const matched = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (matched) {
          const authUser = {
            uid: matched.uid,
            email: matched.email,
            displayName: matched.email.split('@')[0],
            isAdmin: matched.isAdmin
          };
          setUser(authUser);
          localStorage.setItem('blog_auth_user', JSON.stringify(authUser));
          return { success: true, user: authUser };
        } else {
          throw new Error('Invalid email or password.');
        }
      }

      let message = firebaseError.message;
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (firebaseError.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      }
      throw new Error(message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signOut error:", err.message);
    }
    setUser(null);
    localStorage.removeItem('blog_auth_user');
  };

  const value = {
    user,
    isAdmin: !!(user && (user.isAdmin || checkIsAdmin(user.email))),
    loading,
    signup,
    login,
    logout,
    adminEmail: process.env.REACT_APP_ADMIN_EMAIL || 'admin@gmail.com'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
