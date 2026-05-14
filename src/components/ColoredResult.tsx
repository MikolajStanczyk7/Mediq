import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { getResultColor } from '../utils/resultNorms';

type Props = {
  field: string;
  value: number;
  label: string;
};

const colors = {
  green: '#388E3C',
  orange: '#F57C00',
  red: '#D32F2F',
} as const;

// Pokazujemy kolorową etykietę normy dla pojedynczego wyniku.
export default function ColoredResult({ field, value, label }: Props) {
  const kluczKoloru = getResultColor(field, value);
  const kolor = colors[kluczKoloru];

  return (
    <View style={[styles.container, { backgroundColor: `${kolor}14`, borderColor: `${kolor}40` }]}>
      <View style={[styles.dot, { backgroundColor: kolor }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    color: '#424242',
  },
});