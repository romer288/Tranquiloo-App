import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin, User} from '@react-native-google-signin/google-signin';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'patient' | 'therapist';
  authMethod: 'google' | 'email';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (role: 'patient' | 'therapist') => Promise<void>;
  signInWithEmail: (email: string, password: string, role: 'patient' | 'therapist') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already signed in
    const checkSignInStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking sign-in status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSignInStatus();
  }, []);

  const signIn = async (role: 'patient' | 'therapist') => {
    try {
      setIsLoading(true);
      
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      
      const authUser: AuthUser = {
        id: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name || userInfo.user.email,
        picture: userInfo.user.photo || undefined,
        role,
        authMethod: 'google',
      };

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string,
    role: 'patient' | 'therapist'
  ) => {
    try {
      setIsLoading(true);
      
      // For now, simulate email authentication
      // In production, you would validate with your backend
      const authUser: AuthUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role,
        authMethod: 'email',
      };

      // Store user data
      await AsyncStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } catch (error) {
      console.error('Email Sign-In error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Google if signed in with Google
      if (user?.authMethod === 'google') {
        await GoogleSignin.signOut();
      }
      
      // Clear stored user data
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Sign-Out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signInWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};