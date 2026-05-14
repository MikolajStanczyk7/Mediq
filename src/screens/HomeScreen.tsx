import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../types';

type Navigation = StackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  // Kierujemy użytkownika do głównych akcji z ekranu startowego.
  const navigation = useNavigation<Navigation>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mediq</Text>
        <IconButton icon="cog" iconColor="#1976D2" size={24} onPress={() => navigation.navigate('Settings')} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.emoji}>🏥</Text>
        <Text style={styles.title}>Mediq</Text>
        <Text style={styles.subtitle}>Mobilna Karta Pacjenta</Text>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" contentStyle={styles.buttonContent} style={styles.button} onPress={() => navigation.navigate('PatientList')}>
          👥 Lista Pacjentów
        </Button>
        <Button mode="contained" contentStyle={styles.buttonContent} style={styles.button} onPress={() => navigation.navigate('AddPatient')}>
          ➕ Dodaj Pacjenta
        </Button>
        <Button mode="contained" contentStyle={styles.buttonContent} style={styles.button} onPress={() => navigation.navigate('Statistics')}>
          📊 Statystyki
        </Button>
        <Divider style={styles.divider} />
      </View>

      <Text style={styles.credit}>Złota Apka 2025 • Kalisz</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2',
  },
  hero: {
    alignItems: 'center',
    marginTop: 32,
  },
  emoji: {
    fontSize: 68,
    marginBottom: 12,
  },
  title: {
    color: '#1976D2',
    fontSize: 36,
    fontWeight: '700',
  },
  subtitle: {
    color: '#757575',
    fontSize: 16,
    marginTop: 8,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
  },
  credit: {
    color: '#9E9E9E',
    fontSize: 13,
  },
});
