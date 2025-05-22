import { router } from 'expo-router';

/**
 * Helper function to navigate between onboarding screens with forward animation
 * This handles the expo-router navigation pattern for nested routes
 */
export function navigateOnboarding(route: string) {
  // We need to prepend the group name for proper navigation
  router.push({
    pathname: `/(onboarding)/${route}`,
    params: { direction: 'forward' }
  } as any);
}

/**
 * Helper function to navigate backward between onboarding screens
 * Uses different animation direction parameter
 */
export function navigateOnboardingBack(route: string) {
  router.push({
    pathname: `/(onboarding)/${route}`,
    params: { direction: 'back' }
  } as any);
}

/**
 * Navigate to the tabs section (main app)
 */
export function navigateToMainApp() {
  router.replace('/(tabs)' as any);
}
