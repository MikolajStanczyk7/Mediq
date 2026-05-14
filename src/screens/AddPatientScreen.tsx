import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HelperText, Snackbar, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import { insertPatient } from '../database/db';
import type { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'AddPatient'>;

export default function AddPatientScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pesel, setPesel] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diseases, setDiseases] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; pesel?: string }>({});
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const validate = () => {
    const nextErrors: { firstName?: string; lastName?: string; pesel?: string } = {};

    if (!firstName.trim()) {
      nextErrors.firstName = 'Imię jest wymagane';
    }

    if (!lastName.trim()) {
      nextErrors.lastName = 'Nazwisko jest wymagane';
    }

    if (!pesel.trim()) {
      nextErrors.pesel = 'PESEL jest wymagany';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      await insertPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        pesel: pesel.trim(),
        birthDate: birthDate.trim(),
        bloodType: bloodType.trim(),
        allergies: allergies.trim(),
        diseases: diseases.trim(),
      });
      setSnackbarMessage('✅ Pacjent został zapisany');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.navigate('PatientList');
      }, 1000);
    } catch (error) {
      console.error('Failed to save patient', error);
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
            <TextInput label="Imię *" mode="outlined" value={firstName} onChangeText={setFirstName} style={styles.input} error={Boolean(errors.firstName)} />
            <HelperText type="error" visible={Boolean(errors.firstName)}>{errors.firstName}</HelperText>

            <TextInput label="Nazwisko *" mode="outlined" value={lastName} onChangeText={setLastName} style={styles.input} error={Boolean(errors.lastName)} />
            <HelperText type="error" visible={Boolean(errors.lastName)}>{errors.lastName}</HelperText>

            <TextInput label="PESEL *" mode="outlined" value={pesel} onChangeText={setPesel} keyboardType="number-pad" style={styles.input} error={Boolean(errors.pesel)} />
            <HelperText type="error" visible={Boolean(errors.pesel)}>{errors.pesel}</HelperText>

            <TextInput label="Data urodzenia (DD.MM.RRRR)" mode="outlined" value={birthDate} onChangeText={setBirthDate} style={styles.input} />
            <TextInput label="Grupa krwi" mode="outlined" value={bloodType} onChangeText={setBloodType} style={styles.input} />
            <TextInput label="Alergie" mode="outlined" value={allergies} onChangeText={setAllergies} multiline style={styles.input} />
            <TextInput label="Choroby przewlekłe" mode="outlined" value={diseases} onChangeText={setDiseases} multiline style={styles.input} />

            <Button mode="contained" onPress={handleSave} style={styles.button} contentStyle={styles.buttonContent} disabled={saving}>
              {saving ? <ActivityIndicator animating color="#FFFFFF" /> : 'Zapisz pacjenta'}
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
  button: {
    borderRadius: 8,
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorSnackbar: {
    backgroundColor: '#D32F2F',
  },
});