import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDraftMeal } from '@/context/draft-meal-context';

function mimeTypeFromAsset(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.mimeType) return asset.mimeType;
  return asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
}

export default function AddMealSourceScreen() {
  const { setPhoto, reset } = useDraftMeal();

  async function handlePhoto(source: 'camera' | 'library') {
    reset();
    const permission =
      source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Нет доступа', 'Разрешите доступ в настройках телефона, чтобы продолжить.');
      return;
    }

    const options: ImagePicker.ImagePickerOptions = { quality: 0.6, base64: true };
    const result = source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Не получилось обработать фото', 'Попробуйте выбрать другое фото.');
      return;
    }

    setPhoto({ uri: asset.uri, base64: asset.base64, mimeType: mimeTypeFromAsset(asset) });
    router.push('/add-meal/analyzing');
  }

  function handleManualEntry() {
    reset();
    router.push('/add-meal/review');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ThemedText type="default" style={styles.hint}>
          Сфотографируйте блюдо или выберите фото из галереи — приложение распознает ингредиенты и посчитает калории.
        </ThemedText>
        <View style={styles.buttons}>
          <Pressable style={styles.optionButton} onPress={() => handlePhoto('camera')}>
            <Ionicons name="camera-outline" size={32} color="#3c87f7" />
            <ThemedText type="smallBold">Сделать фото</ThemedText>
          </Pressable>
          <Pressable style={styles.optionButton} onPress={() => handlePhoto('library')}>
            <Ionicons name="images-outline" size={32} color="#3c87f7" />
            <ThemedText type="smallBold">Выбрать из галереи</ThemedText>
          </Pressable>
          <Pressable style={styles.optionButton} onPress={handleManualEntry}>
            <Ionicons name="create-outline" size={32} color="#3c87f7" />
            <ThemedText type="smallBold">Добавить вручную</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.four, gap: Spacing.four },
  hint: { lineHeight: 22 },
  buttons: { gap: Spacing.three, marginTop: Spacing.three },
  optionButton: {
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.3)',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
});
