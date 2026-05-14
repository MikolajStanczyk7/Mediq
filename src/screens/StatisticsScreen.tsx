import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { Card, Divider, Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { getAllPatients, getResultsByPatient } from '../database/db';
import { getResultColor } from '../utils/resultNorms';
import type { Patient, Result, RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'Statistics'>;

// Stałe dla statystyk
const BLOOD_TYPES_ALL = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

export default function StatisticsScreen({ navigation }: Props) {
  const screenWidth = Dimensions.get('window').width;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [allResults, setAllResults] = useState<(Result & { patientId: number })[]>([]);
  const [loading, setLoading] = useState(true);

  // Ładujemy dane przy każdym wejściu na ekran.
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const listaPacjentow = await getAllPatients();
      setPatients(listaPacjentow);

      // Pobieramy wyniki wszystkich pacjentów
      const wszystkieWyniki: (Result & { patientId: number })[] = [];
      for (const pacjent of listaPacjentow) {
        const wyniki = await getResultsByPatient(pacjent.id ?? 0);
        wszystkieWyniki.push(...wyniki.map((w) => ({ ...w, patientId: pacjent.id ?? 0 })));
      }
      setAllResults(wszystkieWyniki);
    } catch (error) {
      console.error('Failed to load statistics data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Obliczamy statystyki
  const statistics = useMemo(() => {
    const totalPatients = patients.length;
    const totalResults = allResults.length;

    // Wyniki poza normą (co najmniej jedno pole poza prawidłowym zakresem)
    let abnormalCount = 0;
    for (const result of allResults) {
      let isAbnormal = false;

      if (result.glucose != null && getResultColor('glucose', result.glucose) !== 'green') {
        isAbnormal = true;
      }
      if (result.systolic != null && getResultColor('systolic', result.systolic) !== 'green') {
        isAbnormal = true;
      }
      if (result.diastolic != null && getResultColor('diastolic', result.diastolic) !== 'green') {
        isAbnormal = true;
      }
      if (result.cholesterol != null && getResultColor('cholesterol', result.cholesterol) !== 'green') {
        isAbnormal = true;
      }
      if (result.weight != null && result.height != null) {
        const bmi = result.weight / Math.pow(result.height / 100, 2);
        if (getResultColor('bmi', bmi) !== 'green') {
          isAbnormal = true;
        }
      }

      if (isAbnormal) {
        abnormalCount += 1;
      }
    }

    // Pacjenci ze zbadanymi wynikami
    const patientsWithResults = new Set(allResults.map((r) => r.patientId)).size;

    return {
      totalPatients,
      totalResults,
      abnormalCount,
      patientsWithResults,
    };
  }, [patients, allResults]);

  // Rozkład grup krwi
  const bloodTypeDistribution = useMemo(() => {
    const distribution = BLOOD_TYPES_ALL.map((bloodType) => ({
      type: bloodType,
      count: patients.filter((p) => p.bloodType === bloodType).length,
    }));
    return distribution.filter((d) => d.count > 0);
  }, [patients]);

  // Ostatnie 5 badań
  const recentResults = useMemo(() => {
    const sorted = [...allResults]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return sorted.map((result) => {
      const pacjent = patients.find((p) => p.id === result.patientId);
      const keyValue = result.glucose ?? result.systolic ?? null;
      const keyLabel = result.glucose != null ? 'Glukoza' : result.systolic != null ? 'Ciśnienie' : null;

      return {
        patientName: pacjent ? `${pacjent.firstName} ${pacjent.lastName}` : 'Nieznany',
        date: new Date(result.date),
        keyValue,
        keyLabel,
      };
    });
  }, [allResults, patients]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* SECTION 1: Summary Cards */}
        <View style={styles.cardsGrid}>
          <Card style={[styles.summaryCard, { flex: 1 }]} mode="elevated">
            <Card.Content style={styles.cardCenter}>
              <Text style={styles.largeNumber}>{statistics.totalPatients}</Text>
              <Text style={styles.cardLabel}>Pacjentów</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, { flex: 1 }]} mode="elevated">
            <Card.Content style={styles.cardCenter}>
              <Text style={styles.largeNumber}>{statistics.totalResults}</Text>
              <Text style={styles.cardLabel}>Badań</Text>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.cardsGrid}>
          <Card style={[styles.summaryCard, { flex: 1, borderLeftWidth: 3, borderLeftColor: '#D32F2F' }]} mode="elevated">
            <Card.Content style={styles.cardCenter}>
              <Text style={[styles.largeNumber, { color: '#D32F2F' }]}>{statistics.abnormalCount}</Text>
              <Text style={styles.cardLabel}>Poza normą</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, { flex: 1, borderLeftWidth: 3, borderLeftColor: '#388E3C' }]} mode="elevated">
            <Card.Content style={styles.cardCenter}>
              <Text style={[styles.largeNumber, { color: '#388E3C' }]}>{statistics.patientsWithResults}</Text>
              <Text style={styles.cardLabel}>Zbadanych</Text>
            </Card.Content>
          </Card>
        </View>

        {/* SECTION 2: Blood Type Distribution */}
        <Text style={styles.sectionTitle}>🩸 Grupy krwi pacjentów</Text>
        {bloodTypeDistribution.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Brak danych — dodaj pacjentów</Text>
          </View>
        ) : (
          <Card style={styles.cardDefault} mode="elevated">
            <Card.Content>
              <BarChart
                data={{
                  labels: bloodTypeDistribution.map((d) => d.type),
                  datasets: [{ data: bloodTypeDistribution.map((d) => d.count) }],
                }}
                width={screenWidth - 32}
                height={220}
                yAxisSuffix=""
                chartConfig={{
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: () => '#1976D2',
                  labelColor: () => '#616161',
                  propsForBackgroundLines: { stroke: '#E0E0E0' },
                }}
                style={styles.chart}
              />
            </Card.Content>
          </Card>
        )}

        {/* SECTION 3: Recent Activity */}
        <Text style={styles.sectionTitle}>📋 Ostatnie badania</Text>
        {recentResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Brak badań</Text>
          </View>
        ) : (
          <Card style={styles.cardDefault} mode="elevated">
            <Card.Content>
              {recentResults.map((item, index) => (
                <View key={index}>
                  <View style={styles.recentRow}>
                    <View style={styles.recentText}>
                      <Text style={styles.recentPatient}>{item.patientName}</Text>
                      <Text style={styles.recentDate}>{item.date.toLocaleDateString('pl-PL')} {String(item.date.getHours()).padStart(2, '0')}:{String(item.date.getMinutes()).padStart(2, '0')}</Text>
                    </View>
                    {item.keyValue != null && (
                      <Text style={styles.recentValue}>
                        {item.keyLabel}: {item.keyValue}
                      </Text>
                    )}
                  </View>
                  {index < recentResults.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
  cardsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  summaryCard: {
    borderRadius: 12,
    elevation: 3,
    padding: 16,
    marginHorizontal: 6,
  },
  cardCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 13,
    color: '#616161',
  },
  cardDefault: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentText: {
    flex: 1,
  },
  recentPatient: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  recentDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  recentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 0,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#616161',
  },
});
