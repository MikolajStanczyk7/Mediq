import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { getResultColor } from '../utils/resultNorms';

// Stałe do obliczeń BMI
const BMI_MIN_DISPLAY = 10;
const BMI_MAX_RANGE = 30;
const BMI_UNDERWEIGHT = 18.5;
const BMI_NORMAL_MAX = 25;
const BMI_OVERWEIGHT_MAX = 30;

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
  if (bmi < BMI_UNDERWEIGHT) {
    return 'Niedowaga';
  }

  if (bmi < BMI_NORMAL_MAX) {
    return 'Prawidłowa waga';
  }

  if (bmi < BMI_OVERWEIGHT_MAX) {
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
  const szerokoscPaska = `${Math.max(0, Math.min(100, ((wskaznikBmi - BMI_MIN_DISPLAY) / BMI_MAX_RANGE) * 100))}%`;

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