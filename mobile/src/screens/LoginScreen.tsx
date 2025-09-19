import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../contexts/AuthContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const {signIn, signInWithEmail, isLoading} = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'therapist'>('patient');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Therapist fields
    licenseNumber: '',
    specialty: '',
    yearsExperience: '',
  });

  const handleGoogleSignIn = async () => {
    try {
      await signIn(selectedRole);
      if (selectedRole === 'therapist') {
        navigation.navigate('TherapistDashboard' as never);
      } else {
        navigation.navigate('Dashboard' as never);
      }
    } catch (error) {
      Alert.alert('Sign-In Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  const handleEmailSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      await signInWithEmail(formData.email, formData.password, selectedRole);
      if (selectedRole === 'therapist') {
        navigation.navigate('TherapistDashboard' as never);
      } else {
        navigation.navigate('Dashboard' as never);
      }
    } catch (error) {
      Alert.alert('Authentication Error', 'Failed to authenticate. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>💙</Text>
          </View>
          <Text style={styles.title}>
            {isSignUp ? 'Join Tranquil Support' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp 
              ? 'Choose your role and create your account'
              : 'Sign in to continue your mental health journey'
            }
          </Text>
        </View>

        <View style={styles.form}>
          {/* Role Selection for Sign Up */}
          {isSignUp && (
            <View style={styles.roleContainer}>
              <Text style={styles.roleTitle}>I am registering as:</Text>
              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'patient' && styles.roleButtonActive,
                  ]}
                  onPress={() => setSelectedRole('patient')}
                >
                  <Text style={styles.roleButtonText}>💙 Patient</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    selectedRole === 'therapist' && styles.roleButtonActive,
                  ]}
                  onPress={() => setSelectedRole('therapist')}
                >
                  <Text style={styles.roleButtonText}>🛡️ Therapist</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Google Sign-In */}
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
            <Text style={styles.dividerText}>Or continue with email</Text>
          </View>

          {/* Email Form */}
          {isSignUp && (
            <View style={styles.nameContainer}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({...formData, firstName: text})}
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Last name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({...formData, lastName: text})}
              />
            </View>
          )}

          {/* Therapist Fields */}
          {isSignUp && selectedRole === 'therapist' && (
            <View style={styles.therapistFields}>
              <Text style={styles.therapistTitle}>Professional Information</Text>
              <TextInput
                style={styles.input}
                placeholder="License Number"
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData({...formData, licenseNumber: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Specialty (e.g., Anxiety, Depression, PTSD)"
                value={formData.specialty}
                onChangeText={(text) => setFormData({...formData, specialty: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Years of Experience"
                value={formData.yearsExperience}
                onChangeText={(text) => setFormData({...formData, yearsExperience: text})}
                keyboardType="numeric"
              />
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry
          />

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry
            />
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleEmailSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchButtonText}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#2563eb',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  roleButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  googleButton: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  nameContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  nameInput: {
    flex: 1,
  },
  therapistFields: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  therapistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;