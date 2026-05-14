import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  onPhotoSelected: (uri: string) => void;
  initialUri?: string;
};

// Pozwalamy użytkownikowi wybrać zdjęcie z aparatu albo galerii.
export default function PhotoPicker({ onPhotoSelected, initialUri }: Props) {
  const [photoUri, setPhotoUri] = useState(initialUri ?? '');

  useEffect(() => {
    setPhotoUri(initialUri ?? '');
  }, [initialUri]);

  // Sprawdzamy uprawnienia zanim otworzymy aparat lub galerię.
  const sprawdzUprawnienia = async (rodzaj: 'camera' | 'library') => {
    const permission =
      rodzaj === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Brak uprawnień', 'Aplikacja nie ma dostępu do aparatu lub galerii.');
      return false;
    }

    return true;
  };

  // Otwieramy aparat i zapisujemy wybrany plik lokalnie.
  const pickFromCamera = async () => {
    if (!(await sprawdzUprawnienia('camera'))) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const nowyAdresZdjecia = result.assets[0]?.uri ?? '';
      setPhotoUri(nowyAdresZdjecia);
      onPhotoSelected(nowyAdresZdjecia);
    }
  };

  // Otwieramy galerię i zapisujemy wybraną fotografię.
  const pickFromLibrary = async () => {
    if (!(await sprawdzUprawnienia('library'))) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const nowyAdresZdjecia = result.assets[0]?.uri ?? '';
      setPhotoUri(nowyAdresZdjecia);
      onPhotoSelected(nowyAdresZdjecia);
    }
  };

  // Pokazujemy prosty wybór źródła zdjęcia.
  const openActionSheet = () => {
    Alert.alert('Dodaj zdjęcie', 'Wybierz źródło zdjęcia', [
      { text: 'Aparat', onPress: pickFromCamera },
      { text: 'Galeria', onPress: pickFromLibrary },
      { text: 'Anuluj', style: 'cancel' },
    ]);
  };

  // Czyścimy aktualnie przypięte zdjęcie.
  const clearPhoto = () => {
    setPhotoUri('');
    onPhotoSelected('');
  };

  return (
    <View style={styles.container}>
      <Button mode="outlined" onPress={openActionSheet} style={styles.button}>
        📷 Dodaj zdjęcie
      </Button>

      {photoUri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Button mode="text" onPress={clearPhoto} textColor="#D32F2F">
            ❌ Usuń zdjęcie
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
  },
  previewWrap: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
});