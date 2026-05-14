import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { getResultColor } from '../utils/resultNorms';

type Props = {
  weight?: number;
  height?: number;
};

const colors = {
  green: '#388E3C',
  orange: '#F57C00',
  red: '#D32F2F',
} as const;

// Dobieramy prosty opis BMI, żeby wynik był czytelny dla użytkownika.
function getBmiLabel(bmi: number): string {
  if (bmi < 18.5) {
    return 'Niedowaga';
  }

  if (bmi < 25) {
    return 'Prawidłowa waga';
  }

  if (bmi < 30) {
    return 'Nadwaga';
  }

  return 'Otyłość';
}

// Pokazujemy BMI wraz z kolorowym wskaźnikiem normy.
export default function BMICalculator({ weight, height }: Props) {
  if (!weight || !height) {
    return <Text style={styles.muted}>Uzupełnij wagę i wzrost aby obliczyć BMI</Text>;
  }

  const wskaznikBmi = weight / Math.pow(height / 100, 2);
  const kluczKoloru = getResultColor('bmi', wskaznikBmi);
  const kolor = colors[kluczKoloru];
  const szerokoscPaska = `${Math.max(0, Math.min(100, ((wskaznikBmi - 10) / 30) * 100))}%`;

  return (
    <View style={styles.container}>
      <Text style={[styles.value, { color: kolor }]}>BMI: {wskaznikBmi.toFixed(1)}</Text>
      <Text style={[styles.label, { color: kolor }]}>{getBmiLabel(wskaznikBmi)}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { backgroundColor: kolor, width: szerokoscPaska }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  muted: {
    color: '#757575',
    marginTop: 8,
  },
});