import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  deleteRecordsByUuids,
  getSdkStatus,
  initialize,
  insertRecords,
  MealType,
  openHealthConnectSettings,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

import type { Meal } from '@/context/meals-context';

const NUTRITION_WRITE_PERMISSION = { accessType: 'write', recordType: 'Nutrition' } as const;
const ENABLED_STORAGE_KEY = 'edazdrav.healthConnect.enabled';
const LAST_SYNC_ERROR_KEY = 'edazdrav.healthConnect.lastSyncError';

export const isHealthConnectSupported = Platform.OS === 'android';

export async function getLastSyncError(): Promise<string | null> {
  if (!isHealthConnectSupported) return null;
  return AsyncStorage.getItem(LAST_SYNC_ERROR_KEY);
}

export async function getHealthConnectSyncEnabled(): Promise<boolean> {
  if (!isHealthConnectSupported) return false;
  const raw = await AsyncStorage.getItem(ENABLED_STORAGE_KEY);
  return raw === 'true';
}

export function disableHealthConnectSync(): Promise<void> {
  return AsyncStorage.setItem(ENABLED_STORAGE_KEY, 'false');
}

export type EnableResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'unsupported' | 'not-installed' | 'update-required' | 'permission-denied' | 'error';
      message?: string;
    };

// Нативный healthConnectClient живёт только в рамках текущего процесса
// приложения — после перезапуска (или если приложение выгрузили из памяти)
// он снова не инициализирован, даже если разрешение уже выдано и тумблер
// включён. initialize() достаточно дёшев, чтобы просто звать перед каждой
// операцией, а не полагаться на то, что он уже был вызван при включении тумблера.
async function ensureInitialized(): Promise<boolean> {
  try {
    return await initialize();
  } catch {
    return false;
  }
}

export async function enableHealthConnectSync(): Promise<EnableResult> {
  if (!isHealthConnectSupported) return { ok: false, reason: 'unsupported' };

  const status = await getSdkStatus();
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) return { ok: false, reason: 'not-installed' };
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    return { ok: false, reason: 'update-required' };
  }

  if (!(await ensureInitialized())) return { ok: false, reason: 'not-installed' };

  let granted: Awaited<ReturnType<typeof requestPermission>>;
  try {
    granted = await requestPermission([NUTRITION_WRITE_PERMISSION]);
  } catch (e) {
    return { ok: false, reason: 'error', message: e instanceof Error ? e.message : String(e) };
  }

  const hasPermission = granted.some(
    (permission) => permission.recordType === 'Nutrition' && permission.accessType === 'write'
  );
  if (!hasPermission) return { ok: false, reason: 'permission-denied' };

  await AsyncStorage.setItem(ENABLED_STORAGE_KEY, 'true');
  return { ok: true };
}

export function openHealthConnectApp() {
  if (!isHealthConnectSupported) return;
  openHealthConnectSettings();
}

function inferMealType(iso: string): number {
  const hour = new Date(iso).getHours();
  if (hour < 11) return MealType.BREAKFAST;
  if (hour < 16) return MealType.LUNCH;
  if (hour < 21) return MealType.DINNER;
  return MealType.SNACK;
}

// Лучшая попытка синхронизации — ошибки не должны ломать сохранение приёма пищи
// в самом приложении, поэтому промис всегда разрешается, а не отклоняется.
// Реальная причина сбоя (если был) сохраняется отдельно — см. getLastSyncError().
export async function syncMealToHealthConnect(meal: Meal): Promise<string | null> {
  if (!(await getHealthConnectSyncEnabled())) return null;

  try {
    if (!(await ensureInitialized())) {
      await AsyncStorage.setItem(LAST_SYNC_ERROR_KEY, 'Health Connect client is not initialized');
      return null;
    }

    const name = meal.ingredients.map((ingredient) => ingredient.nameRu).join(', ') || 'Приём пищи';
    // Nutrition — это IntervalRecord: Health Connect требует startTime < endTime,
    // а приём пищи в приложении — мгновенное событие, поэтому просто берём минуту.
    const endTime = new Date(new Date(meal.createdAt).getTime() + 60_000).toISOString();
    const [recordId] = await insertRecords([
      {
        recordType: 'Nutrition',
        startTime: meal.createdAt,
        endTime,
        energy: { value: meal.totals.calories, unit: 'kilocalories' },
        protein: { value: meal.totals.protein, unit: 'grams' },
        totalFat: { value: meal.totals.fat, unit: 'grams' },
        totalCarbohydrate: { value: meal.totals.carbs, unit: 'grams' },
        dietaryFiber: { value: meal.totals.fiber, unit: 'grams' },
        name,
        mealType: inferMealType(meal.createdAt),
      },
    ]);
    await AsyncStorage.removeItem(LAST_SYNC_ERROR_KEY);
    return recordId ?? null;
  } catch (e) {
    await AsyncStorage.setItem(LAST_SYNC_ERROR_KEY, e instanceof Error ? e.message : String(e));
    return null;
  }
}

export async function deleteMealFromHealthConnect(recordId: string): Promise<void> {
  if (!isHealthConnectSupported) return;
  try {
    if (!(await ensureInitialized())) return;
    await deleteRecordsByUuids('Nutrition', [recordId], []);
  } catch {
    // не получилось удалить старую запись — оставляем как есть, не блокируем редактирование
  }
}
