import { useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { StackScreenProps } from '@react-navigation/stack';
import { ActivityIndicator, Button, HelperText, Snackbar, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import BMICalculator from '../components/BMICalculator';
import ColoredResult from '../components/ColoredResult';
import PhotoPicker from '../components/PhotoPicker';
import { insertResult } from '../database/db';
import { getResultLabel } from '../utils/resultNorms';
import type { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'AddResult'>;

type BledyWalidacjiWynikow = {
  glucose?: string;
  systolic?: string;
  diastolic?: string;
  cholesterol?: string;
  weight?: string;
  height?: string;
};

// Zamieniamy tekst wpisany przez użytkownika na wartość liczbową.
function toNumber(value: string): number | undefined {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function AddResultScreen({ navigation, route }: Props) {
  // Trzymamy surowe wartości formularza w lokalnym stanie.
  const { patientId } = route.params;
  const [glukoza, setGlukoza] = useState('');
  const [cisnienieSkurczowe, setCisnienieSkurczowe] = useState('');
  const [cisnienieRozkurczowe, setCisnienieRozkurczowe] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [waga, setWaga] = useState('');
  const [wzrost, setWzrost] = useState('');
  const [notatki, setNotatki] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [dotknietePola, setDotknietePola] = useState({ glucose: false, systolic: false, diastolic: false, cholesterol: false, weight: false, height: false });
  const [bledyWalidacji, setBledyWalidacji] = useState<BledyWalidacjiWynikow>({});

  // Wyliczamy pomocnicze wartości liczbowe z pól tekstowych.
  const wartosciLiczbowe = useMemo(() => ({
    glucose: toNumber(glukoza),
    systolic: toNumber(cisnienieSkurczowe),
    diastolic: toNumber(cisnienieRozkurczowe),
    cholesterol: toNumber(cholesterol),
    weight: toNumber(waga),
    height: toNumber(wzrost),
  }), [cholesterol, cisnienieRozkurczowe, cisnienieSkurczowe, glukoza, waga, wzrost]);

  // Sprawdzamy, czy użytkownik wpisał chociaż jeden wynik liczbowy.
  const czyWypelnionoChociazJednoPole = [glukoza, cisnienieSkurczowe, cisnienieRozkurczowe, cholesterol, waga, wzrost].some((wartosc) => wartosc.trim().length > 0);

  // Walidujemy pola badania przed zapisem.
  const validate = (): boolean => {
    const noweBledy: BledyWalidacjiWynikow = {};

    if (glukoza.trim() && (wartosciLiczbowe.glucose == null || wartosciLiczbowe.glucose < 20 || wartosciLiczbowe.glucose > 600)) {
      noweBledy.glucose = 'Glukoza musi być liczbą między 20 a 600';
    }

    if (cisnienieSkurczowe.trim() && (wartosciLiczbowe.systolic == null || wartosciLiczbowe.systolic < 60 || wartosciLiczbowe.systolic > 250)) {
      noweBledy.systolic = 'Wartość między 60 a 250';
    }

    if (cisnienieRozkurczowe.trim() && (wartosciLiczbowe.diastolic == null || wartosciLiczbowe.diastolic < 40 || wartosciLiczbowe.diastolic > 150)) {
      noweBledy.diastolic = 'Wartość między 40 a 150';
    }

    if (cholesterol.trim() && (wartosciLiczbowe.cholesterol == null || wartosciLiczbowe.cholesterol < 50 || wartosciLiczbowe.cholesterol > 600)) {
      noweBledy.cholesterol = 'Cholesterol musi być liczbą między 50 a 600';
    }

    if (waga.trim() && (wartosciLiczbowe.weight == null || wartosciLiczbowe.weight < 2 || wartosciLiczbowe.weight > 300)) {
      noweBledy.weight = 'Waga między 2 a 300 kg';
    }

    if (wzrost.trim() && (wartosciLiczbowe.height == null || wartosciLiczbowe.height < 50 || wartosciLiczbowe.height > 250)) {
      noweBledy.height = 'Wzrost między 50 a 250 cm';
    }

    setBledyWalidacji(noweBledy);
    return Object.keys(noweBledy).length === 0;
  };

  // Zapisujemy badanie dopiero po poprawnej walidacji.
  const handleSave = async () => {
    if (!czyWypelnionoChociazJednoPole) {
      setSnackbarMessage('Wypełnij przynajmniej jedno pole z wynikami');
      setSnackbarVisible(true);
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      await insertResult({
        patientId,
        date: new Date().toISOString(),
        glucose: wartosciLiczbowe.glucose,
        systolic: wartosciLiczbowe.systolic,
        diastolic: wartosciLiczbowe.diastolic,
        cholesterol: wartosciLiczbowe.cholesterol,
        weight: wartosciLiczbowe.weight,
        height: wartosciLiczbowe.height,
        notes: notatki.trim(),
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
            <TextInput label="Glukoza" placeholder="np. 95 (norma: 70–99)" mode="outlined" value={glukoza} onChangeText={setGlukoza} keyboardType="decimal-pad" style={styles.input} error={Boolean(bledyWalidacji.glucose)} onBlur={() => setDotknietePola((current) => ({ ...current, glucose: true }))} />
            <HelperText type="error" visible={Boolean(bledyWalidacji.glucose)}>{bledyWalidacji.glucose}</HelperText>
            {dotknietePola.glucose && wartosciLiczbowe.glucose != null ? <ColoredResult field="glucose" value={wartosciLiczbowe.glucose} label={getResultLabel('glucose', wartosciLiczbowe.glucose)} /> : null}

            <TextInput label="Ciśnienie skurczowe" placeholder="np. 120 (norma: 90–120)" mode="outlined" value={cisnienieSkurczowe} onChangeText={setCisnienieSkurczowe} keyboardType="number-pad" style={styles.input} error={Boolean(bledyWalidacji.systolic)} onBlur={() => setDotknietePola((current) => ({ ...current, systolic: true }))} />
            <HelperText type="error" visible={Boolean(bledyWalidacji.systolic)}>{bledyWalidacji.systolic}</HelperText>
            {dotknietePola.systolic && wartosciLiczbowe.systolic != null ? <ColoredResult field="systolic" value={wartosciLiczbowe.systolic} label={getResultLabel('systolic', wartosciLiczbowe.systolic)} /> : null}

            <TextInput label="Ciśnienie rozkurczowe" placeholder="np. 80 (norma: 60–80)" mode="outlined" value={cisnienieRozkurczowe} onChangeText={setCisnienieRozkurczowe} keyboardType="number-pad" style={styles.input} error={Boolean(bledyWalidacji.diastolic)} onBlur={() => setDotknietePola((current) => ({ ...current, diastolic: true }))} />
            <HelperText type="error" visible={Boolean(bledyWalidacji.diastolic)}>{bledyWalidacji.diastolic}</HelperText>
            {dotknietePola.diastolic && wartosciLiczbowe.diastolic != null ? <ColoredResult field="diastolic" value={wartosciLiczbowe.diastolic} label={getResultLabel('diastolic', wartosciLiczbowe.diastolic)} /> : null}

            <TextInput label="Cholesterol" placeholder="np. 180 (norma: poniżej 200)" mode="outlined" value={cholesterol} onChangeText={setCholesterol} keyboardType="decimal-pad" style={styles.input} error={Boolean(bledyWalidacji.cholesterol)} onBlur={() => setDotknietePola((current) => ({ ...current, cholesterol: true }))} />
            <HelperText type="error" visible={Boolean(bledyWalidacji.cholesterol)}>{bledyWalidacji.cholesterol}</HelperText>
            {dotknietePola.cholesterol && wartosciLiczbowe.cholesterol != null ? <ColoredResult field="cholesterol" value={wartosciLiczbowe.cholesterol} label={getResultLabel('cholesterol', wartosciLiczbowe.cholesterol)} /> : null}

            <TextInput label="Waga (kg)" placeholder="np. 70" mode="outlined" value={waga} onChangeText={setWaga} keyboardType="decimal-pad" style={styles.input} error={Boolean(bledyWalidacji.weight)} onBlur={() => setDotknietePola((current) => ({ ...current, weight: true }))} />
            <HelperText type="error" visible={Boolean(bledyWalidacji.weight)}>{bledyWalidacji.weight}</HelperText>
            {dotknietePola.weight && wartosciLiczbowe.weight != null ? <ColoredResult field="weight" value={wartosciLiczbowe.weight} label={getResultLabel('weight', wartosciLiczbowe.weight)} /> : null}

            <TextInput label="Wzrost (cm)" placeholder="np. 175" mode="outlined" value={wzrost} onChangeText={setWzrost} keyboardType="decimal-pad" style={styles.input} error={Boolean(bledyWalidacji.height)} onBlur={() => setDotknietePola((current) => ({ ...current, height: true }))} />
            <HelperText type="error" visible={Boolean(bledyWalidacji.height)}>{bledyWalidacji.height}</HelperText>
            {dotknietePola.height && wartosciLiczbowe.height != null ? <ColoredResult field="height" value={wartosciLiczbowe.height} label={getResultLabel('height', wartosciLiczbowe.height)} /> : null}

            <TextInput label="Notatki" placeholder="np. Pacjent skarży się na bóle głowy, zalecono kontrolę za 2 tygodnie" mode="outlined" value={notatki} onChangeText={setNotatki} multiline style={styles.input} />

            <PhotoPicker onPhotoSelected={setPhotoUri} initialUri={photoUri} />

            <View style={styles.bmiWrap}>
              <BMICalculator weight={wartosciLiczbowe.weight} height={wartosciLiczbowe.height} />
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
  helperError: {
    color: '#D32F2F',
    fontSize: 12,
    minHeight: 16,
    marginBottom: 8,
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