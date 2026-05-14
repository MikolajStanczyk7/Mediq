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

export default function ColoredResult({ field, value, label }: Props) {
  const colorKey = getResultColor(field, value);
  const color = colors[colorKey];

  return (
    <View style={[styles.container, { backgroundColor: `${color}14`, borderColor: `${color}40` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
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