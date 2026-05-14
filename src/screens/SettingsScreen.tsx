import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Button, Card, Chip, Dialog, Divider, Portal, Snackbar, Switch, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { deleteAllPatients, deleteAllResults, getAllPatients, getResultsByPatient } from '../database/db';
import type { Patient, RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dbStats, setDbStats] = useState({ patients: 0, results: 0 });

  // Ładujemy statystyki bazy przy wejściu na ekran
  const loadDbStats = useCallback(async () => {
    try {
      const listaPacjentow = await getAllPatients();
      let totalResults = 0;
      for (const pacjent of listaPacjentow) {
        const wyniki = await getResultsByPatient(pacjent.id ?? 0);
        totalResults += wyniki.length;
      }
      setDbStats({ patients: listaPacjentow.length, results: totalResults });
    } catch (error) {
      console.error('Failed to load DB stats', error);
    }
  }, []);

  // Wczytujemy statystyki przy montowaniu komponentu
  useState(() => {
    loadDbStats();
  });

  // Obsługujemy przełącznik trybu ciemnego
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    setSnackbarMessage('Tryb ciemny będzie dostępny wkrótce ');
    setSnackbarVisible(true);
  };

  // Obsługujemy czyszczenie bazy danych
  const handleClearDatabase = async () => {
    try {
      setDialogVisible(false);
      await deleteAllResults();
      await deleteAllPatients();
      setSnackbarMessage('🗑 Baza danych wyczyszczona');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('Home');
      }, 500);
    } catch (error) {
      console.error('Failed to clear database', error);
      setSnackbarMessage('❌ Błąd podczas czyszczenia bazy');
      setSnackbarVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* SECTION 1: About App */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>ℹ️ O aplikacji</Text>
            <Text style={styles.appName}>Mediq</Text>
            <Text style={styles.appSubtitle}>Mobilna Karta Pacjenta</Text>
            <Text style={styles.version}>Wersja 1.0.0</Text>
            <Text style={styles.description}>
              Aplikacja stworzona na konkurs Złota Apka 2025 w Kaliszu. Umożliwia lekarzom zarządzanie kartami pacjentów offline.
            </Text>
            <Divider style={styles.dividerStyle} />
            <View style={styles.creditRow}>
              <MaterialCommunityIcons name="school" size={18} color="#1976D2" />
              <Text style={styles.creditText}>Złota Apka 2025 • Kalisz</Text>
            </View>
          </Card.Content>
        </Card>

        {/* SECTION 2: Settings */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>⚙️ Ustawienia</Text>
            <View style={styles.settingRow}>
              <MaterialCommunityIcons name="weather-night" size={24} color="#1976D2" />
              <Text style={styles.settingLabel}>Tryb ciemny</Text>
              <Switch value={darkMode} onValueChange={handleDarkModeToggle} />
            </View>
          </Card.Content>
        </Card>

        {/* SECTION 3: Database */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text style={styles.sectionTitle}>🗄️ Baza danych</Text>

            <View style={styles.dbRow}>
              <View style={styles.dbInfo}>
                <MaterialCommunityIcons name="database" size={24} color="#1976D2" />
                <Text style={styles.dbLabel}>Lokalna baza SQLite</Text>
              </View>
              <Chip mode="flat" style={styles.activeChip} textStyle={styles.activeChipText}>
                Aktywna
              </Chip>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dbStats.patients}</Text>
                <Text style={styles.statLabel}>Pacjentów</Text>
              </View>
              <Divider style={styles.verticalDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{dbStats.results}</Text>
                <Text style={styles.statLabel}>Badań</Text>
              </View>
            </View>

            <Divider style={styles.dividerStyle} />

            <Text style={styles.dangerZoneTitle}>⚠️ Strefa zagrożenia</Text>
            <Button
              mode="outlined"
              textColor="#D32F2F"
              onPress={() => setDialogVisible(true)}
              style={styles.dangerButton}
              contentStyle={styles.buttonContent}
            >
              Wyczyść bazę danych
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>⚠️ Uwaga!</Dialog.Title>
          <Dialog.Content>
            <Text>
              Ta operacja usunie WSZYSTKICH pacjentów i ich wyniki. Tej operacji nie można cofnąć. Czy jesteś pewien?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Anuluj</Button>
            <Button textColor="#D32F2F" onPress={handleClearDatabase}>
              Potwierdź
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={2000}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1976D2',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 8,
  },
  version: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
    marginBottom: 12,
  },
  dividerStyle: {
    marginVertical: 12,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  creditText: {
    fontSize: 13,
    color: '#616161',
    marginLeft: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 15,
    color: '#212121',
    flex: 1,
    marginLeft: 12,
  },
  dbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 12,
  },
  dbInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dbLabel: {
    fontSize: 15,
    color: '#212121',
    marginLeft: 12,
  },
  activeChip: {
    backgroundColor: '#E8F5E9',
  },
  activeChipText: {
    color: '#388E3C',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  verticalDivider: {
    width: 1,
    height: 40,
  },
  dangerZoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 8,
    marginTop: 8,
  },
  dangerButton: {
    borderColor: '#D32F2F',
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
