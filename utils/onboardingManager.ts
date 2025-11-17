import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage keys for onboarding
const ONBOARDING_COMPLETE_KEY = '@journal_safe/onboarding_complete';

/**
 * Onboarding Manager
 * Manages the onboarding state for first-time users
 */

/**
 * Check if user has completed onboarding
 * @returns Promise<boolean> - true if onboarding is complete
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return completed === 'true';
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as complete
 */
export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    console.log('Onboarding marked as complete');
  } catch (error) {
    console.error('Failed to set onboarding complete:', error);
    throw error;
  }
}

/**
 * Reset onboarding status (for testing/debugging)
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    console.log('Onboarding status reset');
  } catch (error) {
    console.error('Failed to reset onboarding:', error);
    throw error;
  }
}
