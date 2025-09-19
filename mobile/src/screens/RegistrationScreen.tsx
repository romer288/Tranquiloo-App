import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../contexts/AuthContext';

interface RegistrationScreenProps {
  navigation: any;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigation }) => {
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient' as 'patient' | 'therapist',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  React.useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID', // Uses environment variable
      offlineAccess: true,
      hostedDomain: '',
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.user) {
        const user = {
          id: userInfo.user.id,
          email: userInfo.user.email,
          name: userInfo.user.name,
          photo: userInfo.user.photo,
        };
        
        await signIn(user);
        navigation.replace('Dashboard');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign-in cancelled', 'Google sign-in was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign-in in progress', 'Sign-in is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services not available', 'Google Play Services is not available');
      } else {
        Alert.alert('Sign-in error', error.message || 'Unknown error occurred');
      }
    }
    setIsLoading(false);
  };

  const handleEmailSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Missing fields', 'Please fill in email and password');
      return;
    }

    setIsLoading(true);
    try {
      // For now, simulate email sign-in
      const user = {
        id: `user_${Date.now()}`,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
      };
      
      await signIn(user);
      navigation.replace('Dashboard');
    } catch (error: any) {
      Alert.alert('Sign-in error', error.message || 'Failed to sign in');
    }
    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>💙</Text>
        </View>
        <Text style={styles.title}>
          {isSignInMode ? 'Welcome Back' : 'Create Your Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignInMode 
            ? 'Sign in to continue your mental health journey' 
            : 'Start your personalized mental health journey today'
          }
        </Text>
      </View>

      {/* Role Selection for Sign Up */}
      {!isSignInMode && (
        <View style={styles.roleSection}>
          <Text style={styles.sectionTitle}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'patient' && styles.roleButtonActive
              ]}
              onPress={() => setFormData({ ...formData, role: 'patient' })}
            >
              <Text style={[
                styles.roleButtonText,
                formData.role === 'patient' && styles.roleButtonTextActive
              ]}>
                Patient seeking support
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'therapist' && styles.roleButtonActive
              ]}
              onPress={() => setFormData({ ...formData, role: 'therapist' })}
            >
              <Text style={[
                styles.roleButtonText,
                formData.role === 'therapist' && styles.roleButtonTextActive
              ]}>
                Mental health professional
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        <Text style={styles.googleButtonText}>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with email</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Form */}
      <View style={styles.form}>
        {!isSignInMode && (
          <>
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
              />
            </View>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder={isSignInMode ? "Enter your password" : "Create a secure password"}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        {!isSignInMode && (
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
          />
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleEmailSignIn}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading 
              ? (isSignInMode ? 'Signing In...' : 'Creating Account...')
              : (isSignInMode ? 'Sign In' : 'Create Account')
            }
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsSignInMode(!isSignInMode)}
      >
        <Text style={styles.toggleButtonText}>
          {isSignInMode ? "Don't have an account? " : "Already have an account? "}
          <Text style={styles.toggleButtonTextAccent}>
            {isSignInMode ? 'Create one here' : 'Sign in'}
          </Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 24,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  roleSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  roleButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  roleButtonTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  toggleButtonTextAccent: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default RegistrationScreen;