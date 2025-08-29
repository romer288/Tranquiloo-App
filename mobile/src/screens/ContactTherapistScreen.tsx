import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

const ContactTherapistScreen: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'connect' | 'self-guided'>('connect');
  const [contactForm, setContactForm] = useState({
    therapistName: '',
    contactMethod: 'email',
    contactValue: '',
    notes: '',
  });

  const handleSubmit = () => {
    if (selectedMode === 'connect') {
      if (!contactForm.therapistName || !contactForm.contactValue) {
        Alert.alert('Missing Information', 'Please fill in all required fields.');
        return;
      }
      Alert.alert(
        'Therapist Contact Added',
        'Your therapist contact has been saved. You can now easily reach out when needed.',
      );
    } else {
      Alert.alert(
        'Self-Guided Mode Activated',
        'You\'ve chosen self-guided support. Continue with your AI companion and tracking tools.',
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Professional Support</Text>
        <Text style={styles.headerSubtitle}>
          Choose how you'd like to receive mental health support
        </Text>
      </View>

      <View style={styles.modeSelection}>
        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === 'connect' && styles.modeCardActive,
          ]}
          onPress={() => setSelectedMode('connect')}
        >
          <Text style={styles.modeTitle}>🤝 Connect with a Therapist</Text>
          <Text style={styles.modeDescription}>
            Add your therapist's contact information for easy access when you need professional support.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeCard,
            selectedMode === 'self-guided' && styles.modeCardActive,
          ]}
          onPress={() => setSelectedMode('self-guided')}
        >
          <Text style={styles.modeTitle}>🌱 Self-Guided Support</Text>
          <Text style={styles.modeDescription}>
            Continue with AI-powered support, progress tracking, and self-help tools.
          </Text>
        </TouchableOpacity>
      </View>

      {selectedMode === 'connect' && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Therapist Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Therapist Name *</Text>
            <TextInput
              style={styles.textInput}
              value={contactForm.therapistName}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, therapistName: text })
              }
              placeholder="Enter therapist's full name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Preferred Contact Method *</Text>
            <View style={styles.radioGroup}>
              {['email', 'phone', 'other'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={styles.radioOption}
                  onPress={() =>
                    setContactForm({ ...contactForm, contactMethod: method })
                  }
                >
                  <View
                    style={[
                      styles.radioButton,
                      contactForm.contactMethod === method && styles.radioButtonActive,
                    ]}
                  />
                  <Text style={styles.radioLabel}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {contactForm.contactMethod === 'email' ? 'Email Address' : 
               contactForm.contactMethod === 'phone' ? 'Phone Number' : 
               'Contact Information'} *
            </Text>
            <TextInput
              style={styles.textInput}
              value={contactForm.contactValue}
              onChangeText={(text) =>
                setContactForm({ ...contactForm, contactValue: text })
              }
              placeholder={
                contactForm.contactMethod === 'email' ? 'therapist@example.com' :
                contactForm.contactMethod === 'phone' ? '(555) 123-4567' :
                'Enter contact information'
              }
              keyboardType={contactForm.contactMethod === 'email' ? 'email-address' : 'default'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Additional Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={contactForm.notes}
              onChangeText={(text) => setContactForm({ ...contactForm, notes: text })}
              placeholder="Any additional notes or preferences..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>
      )}

      {selectedMode === 'self-guided' && (
        <View style={styles.selfGuidedInfo}>
          <Text style={styles.infoTitle}>Self-Guided Support Includes:</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>✓ 24/7 AI companion conversations</Text>
            <Text style={styles.featureItem}>✓ Daily mood and anxiety tracking</Text>
            <Text style={styles.featureItem}>✓ Personalized coping strategies</Text>
            <Text style={styles.featureItem}>✓ Progress analytics and insights</Text>
            <Text style={styles.featureItem}>✓ Crisis support resources</Text>
          </View>
          <View style={styles.reminderCard}>
            <Text style={styles.reminderText}>
              Remember: Self-guided support is great for ongoing mental wellness, but if you're experiencing a crisis or need immediate professional help, please contact a mental health professional or crisis hotline.
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>
          {selectedMode === 'connect' ? 'Save Therapist Contact' : 'Continue with Self-Guided'}
        </Text>
      </TouchableOpacity>

      <View style={styles.emergencyInfo}>
        <Text style={styles.emergencyTitle}>Crisis Support</Text>
        <Text style={styles.emergencyText}>
          If you're in crisis, please contact 988 (Suicide & Crisis Lifeline) or text HOME to 741741 (Crisis Text Line) immediately.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  modeSelection: {
    padding: 16,
  },
  modeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  modeCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
  },
  radioButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 16,
    color: '#374151',
  },
  selfGuidedInfo: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  reminderCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  reminderText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyInfo: {
    backgroundColor: '#fee2e2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
});

export default ContactTherapistScreen;