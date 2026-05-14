import { Dimensions, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

import type { Result } from '../types';

type Props = {
  results: Result[];
  field: keyof Result;
  label: string;
  color?: string;
};

export default function ResultChart({ results, field, label, color = '#1976D2' }: Props) {
  const chartResults = results
    .map((result) => ({
      value: typeof result[field] === 'number' ? (result[field] as number) : undefined,
      label: result.date,
    }))
    .filter((item): item is { value: number; label: string } => typeof item.value === 'number');

  if (chartResults.length < 2) {
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.empty}>Za mało danych do wykresu (min. 2 wyniki)</Text>
        </Card.Content>
      </Card>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const labels = chartResults.map((item) => {
    const date = new Date(item.label);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
  });

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text style={styles.title}>{label}</Text>
      </Card.Content>
      <LineChart
        data={{
          labels,
          datasets: [{ data: chartResults.map((item) => item.value) }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix=""
        chartConfig={{
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          decimalPlaces: 1,
          color: () => color,
          labelColor: () => '#616161',
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: color,
          },
          propsForBackgroundLines: {
            stroke: '#E0E0E0',
          },
        }}
        bezier
        style={styles.chart}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#212121',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  empty: {
    color: '#616161',
  },
});