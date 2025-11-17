import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

import { useAuth } from '~/providers/AuthProvider';
import { ThemeProvider } from '~/themes/ThemeProvider';
import { SettingsProvider, useSettings } from '~/contexts/SettingsContext';
import { supabase } from '~/utils/supabase';
import { hasCompletedOnboarding } from '~/utils/onboardingManager';
import { setupNotificationHandler } from '~/utils/notifications';
import { loadPrompts, refreshPrompts } from '~/utils/prompts';
import { loadAffirmations, refreshAffirmations } from '~/utils/affirmations';

import '../global.css';

import '../translation';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const { setUser } = useAuth();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Set up notification handler (this persists for the app lifecycle)
    const notificationSubscription = setupNotificationHandler((notification) => {
      // Navigate to affirmations when notification is tapped
      const data = notification.request.content.data;
      if (data?.type === 'daily-affirmation') {
        router.push('/(tabs)/affirmations');
      }
    });

    const initializeApp = async () => {
      try {
        // 1. Preload prompts and affirmations into memory cache
        // This ensures they're available immediately when needed
        console.log('Preloading prompts and affirmations...');
        await Promise.all([
          loadPrompts().catch(err => console.warn('Failed to preload prompts:', err)),
          loadAffirmations().catch(err => console.warn('Failed to preload affirmations:', err)),
        ]);
        console.log('Prompts and affirmations preloaded successfully');

        // 2. Check authentication
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setUser(session);

          // Check if user has completed onboarding
          const onboardingComplete = await hasCompletedOnboarding();

          if (!onboardingComplete) {
            // First-time user - show onboarding
            router.replace('/onboarding');
          } else {
            // Returning user - go to main app
            router.replace('/(tabs)/assistant');
          }
        } else {
          setUser();
          console.log('no user');
          // No session - go to login
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    initializeApp();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session);

        // Check onboarding status
        const onboardingComplete = await hasCompletedOnboarding();

        if (!onboardingComplete) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)/assistant');
        }
      } else {
        setUser();
        console.log('no user');
        router.replace('/(auth)/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
      notificationSubscription?.remove();
    };
  }, []);

  return (
    <SettingsProvider>
      <ThemeProviderWrapper>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProviderWrapper>
    </SettingsProvider>
  );
}

// Wrapper component to bridge SettingsContext and ThemeProvider
function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings();

  if (isLoading) {
    return null; // or a loading screen
  }

  return <ThemeProvider themePreference={settings.theme}>{children}</ThemeProvider>;
}
