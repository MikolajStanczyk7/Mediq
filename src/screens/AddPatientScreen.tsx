import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HelperText, Snackbar, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackScreenProps } from '@react-navigation/stack';

import { insertPatient } from '../database/db';
import type { RootStackParamList } from '../types';

type Props = StackScreenProps<RootStackParamList, 'AddPatient'>;

// Stałe do walidacji formularza
const MIN_NAME_LENGTH = 2;
const PESEL_LENGTH = 11;
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];

type BledyWalidacjiPacjenta = {
  firstName?: string;
  lastName?: string;
  pesel?: string;
  birthDate?: string;
  bloodType?: string;
};

// Sprawdzamy, czy wpis zawiera tylko litery i spacje.
function maTylkoLiteryIZnakiSpacji(wartosc: string): boolean {
  return /^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż\s]+$/.test(wartosc);
}

// Sprawdzamy, czy data ma czytelny format DD.MM.RRRR.
function jestPoprawnaData(wartosc: string): boolean {
  return /^\d{2}\.\d{2}\.\d{4}$/.test(wartosc);
}

// Sprawdzamy, czy grupa krwi znajduje się na dozwolonej liście.
function jestPoprawnaGrupaKrwi(wartosc: string): boolean {
  return BLOOD_TYPES.includes(wartosc.trim().toUpperCase());
}

export default function AddPatientScreen({ navigation }: Props) {
  // Przechowujemy wartości formularza w stanie lokalnym.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pesel, setPesel] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diseases, setDiseases] = useState('');
  const [errors, setErrors] = useState<BledyWalidacjiPacjenta>({});
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Zrzucamy fokus z pól, gdy ekran się zamyka.
  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  // Walidujemy dane pacjenta przed zapisem.
  const validate = (): boolean => {
    const noweBledy: BledyWalidacjiPacjenta = {};

    if (firstName.trim().length < MIN_NAME_LENGTH || !maTylkoLiteryIZnakiSpacji(firstName.trim())) {
      noweBledy.firstName = `Imię musi mieć minimum ${MIN_NAME_LENGTH} litery`;
    }

    if (lastName.trim().length < MIN_NAME_LENGTH || !maTylkoLiteryIZnakiSpacji(lastName.trim())) {
      noweBledy.lastName = `Nazwisko musi mieć minimum ${MIN_NAME_LENGTH} litery`;
    }

    if (!/^\d{11}$/.test(pesel.trim())) {
      noweBledy.pesel = `PESEL musi składać się z dokładnie ${PESEL_LENGTH} cyfr`;
    }

    if (birthDate.trim() && !jestPoprawnaData(birthDate.trim())) {
      noweBledy.birthDate = 'Podaj datę w formacie DD.MM.RRRR';
    }

    if (bloodType.trim() && !jestPoprawnaGrupaKrwi(bloodType)) {
      noweBledy.bloodType = 'Nieprawidłowa grupa krwi (np. A+, 0-, AB+)';
    }

    setErrors(noweBledy);
    return Object.keys(noweBledy).length === 0;
  };

  // Zapisujemy pacjenta tylko wtedy, gdy formularz przejdzie walidację.
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
        bloodType: bloodType.trim().toUpperCase(),
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
            <TextInput label="Imię *" placeholder="np. Jan" mode="outlined" value={firstName} onChangeText={setFirstName} style={styles.input} error={Boolean(errors.firstName)} />
            <HelperText type="error" visible={Boolean(errors.firstName)}>{errors.firstName}</HelperText>

            <TextInput label="Nazwisko *" placeholder="np. Kowalski" mode="outlined" value={lastName} onChangeText={setLastName} style={styles.input} error={Boolean(errors.lastName)} />
            <HelperText type="error" visible={Boolean(errors.lastName)}>{errors.lastName}</HelperText>

            <TextInput label="PESEL *" placeholder="np. 90010112345" mode="outlined" value={pesel} onChangeText={setPesel} keyboardType="number-pad" style={styles.input} error={Boolean(errors.pesel)} />
            <HelperText type="error" visible={Boolean(errors.pesel)}>{errors.pesel}</HelperText>

            <TextInput label="Data urodzenia (DD.MM.RRRR)" placeholder="np. 01.01.1990" mode="outlined" value={birthDate} onChangeText={setBirthDate} style={styles.input} error={Boolean(errors.birthDate)} />
            <HelperText type="error" visible={Boolean(errors.birthDate)}>{errors.birthDate}</HelperText>

            <TextInput label="Grupa krwi" placeholder="np. A+, 0-, AB+" mode="outlined" value={bloodType} onChangeText={setBloodType} style={styles.input} error={Boolean(errors.bloodType)} />
            <HelperText type="error" visible={Boolean(errors.bloodType)}>{errors.bloodType}</HelperText>

            <TextInput label="Alergie" placeholder="np. penicylina, pyłki, orzechy" mode="outlined" value={allergies} onChangeText={setAllergies} multiline style={styles.input} />
            <TextInput label="Choroby przewlekłe" placeholder="np. cukrzyca typu 2, nadciśnienie" mode="outlined" value={diseases} onChangeText={setDiseases} multiline style={styles.input} />

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