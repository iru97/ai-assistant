import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { useAuth } from '~/providers/AuthProvider';
import { ThemeProvider } from '~/themes/ThemeProvider';
import { supabase } from '~/utils/supabase';
import { hasCompletedOnboarding } from '~/utils/onboardingManager';

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
    const initializeApp = async () => {
      try {
        // Check authentication
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
    };
  }, []);

  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
