import { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { initDB } from './src/database/db';
import AddPatientScreen from './src/screens/AddPatientScreen';
import AddResultScreen from './src/screens/AddResultScreen';
import HomeScreen from './src/screens/HomeScreen';
import PatientDetailScreen from './src/screens/PatientDetailScreen';
import PatientListScreen from './src/screens/PatientListScreen';
import HomeButton from './src/components/HomeButton';
import type { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',
    secondary: '#FF6F00',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#D32F2F',
  },
};

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976D2',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#212121',
    border: '#E0E0E0',
    notification: '#D32F2F',
  },
};

export default function App() {
  useEffect(() => {
    initDB().catch((error) => {
      console.error('Failed to initialize database', error);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerTitleAlign: 'center',
              headerTintColor: '#1976D2',
              headerStyle: { backgroundColor: '#FFFFFF' },
              headerShadowVisible: false,
              cardStyle: { backgroundColor: '#F5F5F5' },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: 'Pacjenci', headerRight: () => <HomeButton /> }} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Pacjent', headerRight: () => <HomeButton /> }} />
            <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'Nowy Pacjent', headerRight: () => <HomeButton /> }} />
            <Stack.Screen name="AddResult" component={AddResultScreen} options={{ title: 'Nowe Wyniki', headerRight: () => <HomeButton /> }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
