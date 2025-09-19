import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TherapistDashboardScreen from './src/screens/TherapistDashboardScreen';
import {AuthProvider} from './src/contexts/AuthContext';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '522576524084-pr5i8ucn0o6r4ckd0967te9orpiigkt2.apps.googleusercontent.com', // Web client ID
  iosClientId: '522576524084-28q57dbq1hk0b5e24oaklp9hkn0v6jra.apps.googleusercontent.com', // iOS client ID
  androidClientId: '522576524084-sdbirsc4aitpet16h9pcsk8kdobv30bu.apps.googleusercontent.com', // Android client ID
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

const Stack = createStackNavigator();

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2563eb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              title: 'Tranquil Support',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              title: 'Patient Dashboard',
              headerLeft: () => null,
            }}
          />
          <Stack.Screen 
            name="TherapistDashboard" 
            component={TherapistDashboardScreen}
            options={{
              title: 'Therapist Dashboard',
              headerLeft: () => null,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;