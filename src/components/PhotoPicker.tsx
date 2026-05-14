import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  onPhotoSelected: (uri: string) => void;
  initialUri?: string;
};

export default function PhotoPicker({ onPhotoSelected, initialUri }: Props) {
  const [uri, setUri] = useState(initialUri ?? '');

  useEffect(() => {
    setUri(initialUri ?? '');
  }, [initialUri]);

  const ensurePermission = async (kind: 'camera' | 'library') => {
    const permission =
      kind === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Brak uprawnień', 'Aplikacja nie ma dostępu do aparatu lub galerii.');
      return false;
    }

    return true;
  };

  const pickFromCamera = async () => {
    if (!(await ensurePermission('camera'))) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const nextUri = result.assets[0]?.uri ?? '';
      setUri(nextUri);
      onPhotoSelected(nextUri);
    }
  };

  const pickFromLibrary = async () => {
    if (!(await ensurePermission('library'))) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const nextUri = result.assets[0]?.uri ?? '';
      setUri(nextUri);
      onPhotoSelected(nextUri);
    }
  };

  const openActionSheet = () => {
    Alert.alert('Dodaj zdjęcie', 'Wybierz źródło zdjęcia', [
      { text: 'Aparat', onPress: pickFromCamera },
      { text: 'Galeria', onPress: pickFromLibrary },
      { text: 'Anuluj', style: 'cancel' },
    ]);
  };

  const clearPhoto = () => {
    setUri('');
    onPhotoSelected('');
  };

  return (
    <View style={styles.container}>
      <Button mode="outlined" onPress={openActionSheet} style={styles.button}>
        📷 Dodaj zdjęcie
      </Button>

      {uri ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri }} style={styles.preview} />
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