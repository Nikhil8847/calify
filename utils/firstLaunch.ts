import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_LAUNCH_KEY = 'calify_first_launch';

/**
 * Checks if this is the first time the app is being launched
 * @returns Promise<boolean> - true if this is the first launch, false otherwise
 */
export async function isFirstLaunch(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    // If value is null, this is the first launch
    return value === null;
  } catch (error) {
    console.error('Error checking first launch status:', error);
    // Default to showing onboarding if there's an error
    return true;
  }
}

/**
 * Marks the app as having been launched before
 * This should be called after the first launch is detected
 */
export async function markAppAsLaunched(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
  } catch (error) {
    console.error('Error marking app as launched:', error);
  }
}

/**
 * Resets the first launch status (for testing purposes)
 * This can be used to force the onboarding screens to show again
 */
export async function resetFirstLaunchStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
  } catch (error) {
    console.error('Error resetting first launch status:', error);
  }
}