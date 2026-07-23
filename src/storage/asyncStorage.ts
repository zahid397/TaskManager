import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin, typed wrapper around AsyncStorage. This is the ONLY file that talks
 * to AsyncStorage's raw string API directly — everything else (services/cache.ts)
 * goes through here, so JSON parsing/stringifying and error handling live in
 * exactly one place instead of being copy-pasted at every call site.
 */

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    // A corrupt or unreadable cache entry should never crash the app — the
    // caller falls back to treating it as "nothing cached yet".
    console.warn(`[storage] Failed to read/parse key "${key}":`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Failed to write key "${key}":`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] Failed to remove key "${key}":`, error);
  }
}
