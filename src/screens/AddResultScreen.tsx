import { useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenProps } from '@react-navigation/stack';
import { ActivityIndicator, Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import BMICalculator from '../components/BMICalculator';
import ColoredResult from '../components/ColoredResult';
import PhotoPicker from '../components/PhotoPicker';
import { insertResult } from '../database/db';
import { getResultLabel } from '../utils/resultNorms';
import type { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'AddResult'>;

function toNumber(value: string): number | undefined {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function AddResultScreen({ navigation, route }: Props) {
  const { patientId } = route.params;
  const [glucose, setGlucose] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [touched, setTouched] = useState({ glucose: false, systolic: false, diastolic: false, cholesterol: false, weight: false, height: false });

  const numericValues = useMemo(() => ({
    glucose: toNumber(glucose),
    systolic: toNumber(systolic),
    diastolic: toNumber(diastolic),
    cholesterol: toNumber(cholesterol),
    weight: toNumber(weight),
    height: toNumber(height),
  }), [cholesterol, diastolic, glucose, height, systolic, weight]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await insertResult({
        patientId,
        date: new Date().toISOString(),
        glucose: numericValues.glucose,
        systolic: numericValues.systolic,
        diastolic: numericValues.diastolic,
        cholesterol: numericValues.cholesterol,
        weight: numericValues.weight,
        height: numericValues.height,
        notes: notes.trim(),
        photoUri: photoUri || undefined,
      });
      setSnackbarMessage('✅ Wyniki zapisane');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error(`Failed to insert result for patient ${patientId}`, error);
      setSnackbarMessage('❌ Wystąpił błąd. Spróbuj ponownie.');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TextInput label="Glukoza" mode="outlined" value={glucose} onChangeText={setGlucose} keyboardType="decimal-pad" style={styles.input} onBlur={() => setTouched((current) => ({ ...current, glucose: true }))} />
            {touched.glucose && numericValues.glucose != null ? <ColoredResult field="glucose" value={numericValues.glucose} label={getResultLabel('glucose', numericValues.glucose)} /> : null}

            <TextInput label="Ciśnienie skurczowe" mode="outlined" value={systolic} onChangeText={setSystolic} keyboardType="number-pad" style={styles.input} onBlur={() => setTouched((current) => ({ ...current, systolic: true }))} />
            {touched.systolic && numericValues.systolic != null ? <ColoredResult field="systolic" value={numericValues.systolic} label={getResultLabel('systolic', numericValues.systolic)} /> : null}

            <TextInput label="Ciśnienie rozkurczowe" mode="outlined" value={diastolic} onChangeText={setDiastolic} keyboardType="number-pad" style={styles.input} onBlur={() => setTouched((current) => ({ ...current, diastolic: true }))} />
            {touched.diastolic && numericValues.diastolic != null ? <ColoredResult field="diastolic" value={numericValues.diastolic} label={getResultLabel('diastolic', numericValues.diastolic)} /> : null}

            <TextInput label="Cholesterol" mode="outlined" value={cholesterol} onChangeText={setCholesterol} keyboardType="decimal-pad" style={styles.input} onBlur={() => setTouched((current) => ({ ...current, cholesterol: true }))} />
            {touched.cholesterol && numericValues.cholesterol != null ? <ColoredResult field="cholesterol" value={numericValues.cholesterol} label={getResultLabel('cholesterol', numericValues.cholesterol)} /> : null}

            <TextInput label="Waga (kg)" mode="outlined" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" style={styles.input} onBlur={() => setTouched((current) => ({ ...current, weight: true }))} />
            {touched.weight && numericValues.weight != null ? <ColoredResult field="weight" value={numericValues.weight} label={getResultLabel('weight', numericValues.weight)} /> : null}

            <TextInput label="Wzrost (cm)" mode="outlined" value={height} onChangeText={setHeight} keyboardType="decimal-pad" style={styles.input} onBlur={() => setTouched((current) => ({ ...current, height: true }))} />
            {touched.height && numericValues.height != null ? <ColoredResult field="height" value={numericValues.height} label={getResultLabel('height', numericValues.height)} /> : null}

            <TextInput label="Notatki" mode="outlined" value={notes} onChangeText={setNotes} multiline style={styles.input} />

            <PhotoPicker onPhotoSelected={setPhotoUri} initialUri={photoUri} />

            <View style={styles.bmiWrap}>
              <BMICalculator weight={numericValues.weight} height={numericValues.height} />
            </View>

            <Button mode="contained" onPress={handleSave} style={styles.button} contentStyle={styles.buttonContent} disabled={saving}>
              {saving ? <ActivityIndicator animating color="#FFFFFF" /> : 'Zapisz wyniki'}
            </Button>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  input: {
    marginBottom: 12,
  },
  bmiWrap: {
    marginTop: 12,
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorSnackbar: {
    backgroundColor: '#D32F2F',
  },
});