import { useNavigation } from '@react-navigation/native';
import { IconButton } from 'react-native-paper';

// Przycisk do powrotu na ekran główny, dostępny ze wszystkich ekranów.
export default function HomeButton() {
  const navigation = useNavigation();

  return (
    <IconButton
      icon="home"
      iconColor="#1976D2"
      size={24}
      onPress={() => {
        navigation.navigate('Home' as never);
      }}
    />
  );
}
