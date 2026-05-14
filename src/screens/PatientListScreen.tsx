import { useCallback, useState } from 'react';
import { FlatList, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Card, FAB, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { getAllPatients } from '../database/db';
import type { Patient, RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'PatientList'>;

export default function PatientListScreen({ navigation }: Props) {
  // Przechowujemy pobraną listę pacjentów i filtrujemy ją lokalnie.
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Ładujemy dane przy każdym wejściu na ekran.
  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const listaPacjentow = await getAllPatients();
      setPatients(listaPacjentow);
    } catch (error) {
      console.error('Failed to load patient list', error);
      setSnackbarMessage('❌ Wystąpił błąd. Spróbuj ponownie.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, [loadPatients]),
  );

  // Filtrowanie działa po nazwisku lub PESEL bez dodatkowego odpytywania bazy.
  const filteredPatients = patients.filter((pacjent) => {
    const frazaWyszukiwania = searchTerm.trim().toLowerCase();

    if (!frazaWyszukiwania) {
      return true;
    }

    return pacjent.lastName.toLowerCase().includes(frazaWyszukiwania) || pacjent.pesel.toLowerCase().includes(frazaWyszukiwania);
  });

  // Renderujemy stan ładowania, pusty widok albo listę kart.
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator animating color="#1976D2" size="large" />
          <Text style={styles.loadingText}>Ładowanie...</Text>
        </View>
      );
    }

    if (filteredPatients.length === 0) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.emptyEmoji}>🏥</Text>
          <Text style={styles.emptyText}>Brak pacjentów{`\n`}Dodaj pierwszego pacjenta</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredPatients}
        keyExtractor={(pacjent) => String(pacjent.id ?? pacjent.pesel)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: pacjent }) => (
          <Card style={styles.card} mode="elevated" onPress={() => navigation.navigate('PatientDetail', { patientId: pacjent.id ?? 0 })}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{`${pacjent.lastName} ${pacjent.firstName}`}</Text>
                <Text style={styles.cardSubtitle}>{`PESEL: ${pacjent.pesel}`}</Text>
                {pacjent.bloodType ? <Text style={styles.cardSubtitle}>{`Grupa krwi: ${pacjent.bloodType}`}</Text> : null}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={28} color="#9E9E9E" />
            </Card.Content>
          </Card>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Pressable style={styles.flex} onPress={Keyboard.dismiss}>
        <View style={styles.flex}>
          <TextInput
            mode="outlined"
            placeholder="🔍 Szukaj po nazwisku lub PESEL..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.search}
            autoCapitalize="none"
          />
          {renderContent()}
        </View>
      </Pressable>

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('AddPatient')} />

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={2000} style={snackbarMessage.startsWith('❌') ? styles.errorSnackbar : undefined}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  flex: {
    flex: 1,
  },
  search: {
    margin: 16,
    marginBottom: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 96,
  },
  card: {
    borderRadius: 8,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#616161',
    marginTop: 2,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#616161',
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#616161',
    fontSize: 16,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1976D2',
  },
  errorSnackbar: {
    backgroundColor: '#D32F2F',
  },
});