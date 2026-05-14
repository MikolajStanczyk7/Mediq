import { useCallback, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Card, Dialog, Divider, Portal, Snackbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deletePatient, getPatientById, getResultsByPatient } from '../database/db';
import BMICalculator from '../components/BMICalculator';
import ResultChart from '../components/ResultChart';
import { getResultColor } from '../utils/resultNorms';
import type { Patient, Result, RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'PatientDetail'>;

const colorMap = {
  green: '#388E3C',
  orange: '#F57C00',
  red: '#D32F2F',
} as const;

// Formatujemy datę wyników na bardziej czytelny zapis z godziną.
function formatDate(value: string): string {
  const date = new Date(value);
  const dzien = String(date.getDate()).padStart(2, '0');
  const miesiac = String(date.getMonth() + 1).padStart(2, '0');
  const rok = date.getFullYear();
  const godzina = String(date.getHours()).padStart(2, '0');
  const minuta = String(date.getMinutes()).padStart(2, '0');
  return `${dzien}.${miesiac}.${rok} ${godzina}:${minuta}`;
}

export default function PatientDetailScreen({ navigation, route }: Props) {
  const { patientId } = route.params;

  // Trzymamy szczegóły pacjenta, historię wyników i stany pomocnicze widoku.
  const [patient, setPatient] = useState<Patient | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('');

  // Pobieramy pacjenta i jego wyniki za każdym wejściem na ekran.
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const zaladowanyPacjent = await getPatientById(patientId);
      const zaladowaneWyniki = await getResultsByPatient(patientId);
      setPatient(zaladowanyPacjent);
      setResults(zaladowaneWyniki);

      // Debugowanie: logujemy ID pacjenta i liczbę wyników
      console.log(`PatientDetailScreen loaded - patientId: ${patientId}, results count: ${zaladowaneWyniki.length}`);

      if (zaladowanyPacjent) {
        navigation.setOptions({ title: `${zaladowanyPacjent.firstName} ${zaladowanyPacjent.lastName}` });
      }
    } catch (error) {
      console.error(`Failed to load patient detail for ${patientId}`, error);
      setSnackbarMessage('❌ Wystąpił błąd. Spróbuj ponownie.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  }, [navigation, patientId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Ustawiamy wyniki od najnowszego do najstarszego.
  const posortowaneWyniki = useMemo(() => [...results].sort((pierwszyWynik, drugiWynik) => new Date(drugiWynik.date).getTime() - new Date(pierwszyWynik.date).getTime()), [results]);

  // Usuwamy pacjenta po potwierdzeniu użytkownika.
  const handleDelete = async () => {
    try {
      await deletePatient(patientId);
      setDialogVisible(false);
      navigation.navigate('PatientList');
    } catch (error) {
      console.error(`Failed to delete patient ${patientId}`, error);
      setSnackbarMessage('❌ Wystąpił błąd. Spróbuj ponownie.');
      setSnackbarVisible(true);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centerState}>
          <ActivityIndicator animating color="#1976D2" size="large" />
          <Text style={styles.loadingText}>Ładowanie...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centerState}>
          <Text style={styles.emptyEmoji}>🏥</Text>
          <Text style={styles.emptyText}>Nie znaleziono pacjenta</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <DetailRow label="Imię i nazwisko" value={`${patient.firstName} ${patient.lastName}`} />
            <Divider style={styles.divider} />
            <DetailRow label="PESEL" value={patient.pesel} />
            <Divider style={styles.divider} />
            <DetailRow label="Data urodzenia" value={patient.birthDate || '-'} />
            <Divider style={styles.divider} />
            <DetailRow label="Grupa krwi" value={patient.bloodType || '-'} />
            <Divider style={styles.divider} />
            <DetailRow label="Alergie" value={patient.allergies || '-'} />
            <Divider style={styles.divider} />
            <DetailRow label="Choroby przewlekłe" value={patient.diseases || '-'} />
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>📋 Historia wyników</Text>

        {posortowaneWyniki.length === 0 ? (
          <View style={styles.centerStateInline}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>Brak wyników{`\n`}Dodaj pierwsze badanie →</Text>
          </View>
        ) : (
          posortowaneWyniki.map((wynikBadania) => {
            const kolorGlukozy = wynikBadania.glucose != null ? colorMap[getResultColor('glucose', wynikBadania.glucose)] : undefined;
            const kolorCisnienia = wynikBadania.systolic != null ? colorMap[getResultColor('systolic', wynikBadania.systolic)] : undefined;
            const kolorCholestorolu = wynikBadania.cholesterol != null ? colorMap[getResultColor('cholesterol', wynikBadania.cholesterol)] : undefined;
            const wskaznikBmi = wynikBadania.weight && wynikBadania.height ? wynikBadania.weight / Math.pow(wynikBadania.height / 100, 2) : undefined;
            const kolorBmi = wskaznikBmi != null ? colorMap[getResultColor('bmi', wskaznikBmi)] : undefined;

            return (
              <Card key={wynikBadania.id ?? wynikBadania.date} style={styles.resultCard} mode="elevated">
                <Card.Content>
                  <Text style={styles.resultDate}>{formatDate(wynikBadania.date)}</Text>
                  
                  {wynikBadania.glucose != null ? (
                    <View style={styles.resultRow}>
                      <View style={[styles.dot, { backgroundColor: kolorGlukozy }]} />
                      <Text style={styles.resultText}>{`Glukoza: ${wynikBadania.glucose} mg/dL`}</Text>
                    </View>
                  ) : null}
                  
                  {wynikBadania.systolic != null || wynikBadania.diastolic != null ? (
                    <View style={styles.resultRow}>
                      <View style={[styles.dot, { backgroundColor: kolorCisnienia }]} />
                      <Text style={styles.resultText}>{`Ciśnienie: ${wynikBadania.systolic ?? '-'} / ${wynikBadania.diastolic ?? '-'} mmHg`}</Text>
                    </View>
                  ) : null}
                  
                  {wynikBadania.cholesterol != null ? (
                    <View style={styles.resultRow}>
                      <View style={[styles.dot, { backgroundColor: kolorCholestorolu }]} />
                      <Text style={styles.resultText}>{`Cholesterol: ${wynikBadania.cholesterol} mg/dL`}</Text>
                    </View>
                  ) : null}
                  
                  {wynikBadania.weight != null ? (
                    <View style={styles.resultRow}>
                      <View style={[styles.dot, { backgroundColor: '#9E9E9E' }]} />
                      <Text style={styles.resultText}>{`Waga: ${wynikBadania.weight} kg`}</Text>
                    </View>
                  ) : null}
                  
                  {wynikBadania.height != null ? (
                    <View style={styles.resultRow}>
                      <View style={[styles.dot, { backgroundColor: '#9E9E9E' }]} />
                      <Text style={styles.resultText}>{`Wzrost: ${wynikBadania.height} cm`}</Text>
                    </View>
                  ) : null}
                  
                  {wskaznikBmi != null ? (
                    <View style={styles.resultRow}>
                      <View style={[styles.dot, { backgroundColor: kolorBmi }]} />
                      <Text style={styles.resultText}>{`BMI: ${wskaznikBmi.toFixed(1)}`}</Text>
                    </View>
                  ) : null}
                  
                  {wynikBadania.notes ? (
                    <View style={styles.resultRow}>
                      <Text style={styles.resultText}>{`Notatki: ${wynikBadania.notes}`}</Text>
                    </View>
                  ) : null}
                  
                  {wynikBadania.photoUri ? (
                    <Pressable style={styles.photoThumbWrap} onPress={() => setSelectedPhoto(wynikBadania.photoUri ?? '')}>
                      <Image source={{ uri: wynikBadania.photoUri }} style={styles.photoThumb} />
                    </Pressable>
                  ) : null}
                </Card.Content>
              </Card>
            );
          })
        )}

        <ResultChart results={posortowaneWyniki} field="glucose" label="Glukoza (mg/dL)" color="#1976D2" />
        <ResultChart results={posortowaneWyniki} field="systolic" label="Ciśnienie skurczowe (mmHg)" color="#D32F2F" />

        <Button mode="contained" onPress={() => navigation.navigate('AddResult', { patientId })} style={styles.button} contentStyle={styles.buttonContent}>
          ➕ Dodaj wyniki
        </Button>
        <Button mode="outlined" textColor="#D32F2F" onPress={() => setDialogVisible(true)} style={styles.button} contentStyle={styles.buttonContent}>
          🗑 Usuń pacjenta
        </Button>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Usuń pacjenta</Dialog.Title>
          <Dialog.Content>
            <Text>Czy na pewno chcesz usunąć tego pacjenta?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Anuluj</Button>
            <Button textColor="#D32F2F" onPress={handleDelete}>Usuń</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Modal visible={Boolean(selectedPhoto)} transparent animationType="fade" onRequestClose={() => setSelectedPhoto('')}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedPhoto('')}>
          {selectedPhoto ? <Image source={{ uri: selectedPhoto }} style={styles.modalImage} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={2000} style={snackbarMessage.startsWith('❌') ? styles.errorSnackbar : undefined}>
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  resultCard: {
    borderRadius: 8,
    marginBottom: 12,
  },
  resultDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  resultText: {
    color: '#424242',
  },
  photoThumbWrap: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  photoThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  button: {
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#616161',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerStateInline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#616161',
    lineHeight: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
  errorSnackbar: {
    backgroundColor: '#D32F2F',
  },
});