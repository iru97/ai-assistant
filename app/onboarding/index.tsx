import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { OnboardingScreen } from '~/components/OnboardingScreen';
import { FeatureCard } from '~/components/FeatureCard';
import { setOnboardingComplete } from '~/utils/onboardingManager';
import {
  saveUserPreferences,
  requestNotificationPermissions,
  type Language,
} from '~/utils/initialSetup';

const { width } = Dimensions.get('window');

type Screen = 'welcome' | 'features' | 'personalize' | 'permissions' | 'ready';

/**
 * Onboarding Flow
 * 5-screen carousel for first-time users
 */
export default function OnboardingFlow() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // User preferences state
  const [language, setLanguage] = useState<Language>('en');
  const [affirmationsEnabled, setAffirmationsEnabled] = useState(true);
  const [affirmationTime, setAffirmationTime] = useState('09:00');

  // Screen configuration
  const screens: Screen[] = ['welcome', 'features', 'personalize', 'permissions', 'ready'];

  const goToNext = () => {
    if (currentScreen < screens.length - 1) {
      const nextScreen = currentScreen + 1;
      setCurrentScreen(nextScreen);
      flatListRef.current?.scrollToIndex({ index: nextScreen, animated: true });
    }
  };

  const skipToEnd = async () => {
    // Save default preferences and complete onboarding
    await completeOnboarding(false);
  };

  const completeOnboarding = async (requestNotifications: boolean = false) => {
    try {
      // Request notifications if user chose to
      let notificationsEnabled = false;
      if (requestNotifications) {
        notificationsEnabled = await requestNotificationPermissions();
      }

      // Save user preferences
      await saveUserPreferences({
        language,
        affirmationsEnabled,
        affirmationTime: affirmationsEnabled ? affirmationTime : undefined,
        notificationsEnabled,
      });

      // Mark onboarding as complete
      await setOnboardingComplete();

      // Navigate to main app
      router.replace('/(tabs)/assistant');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  const renderScreen = ({ item }: { item: Screen }) => {
    switch (item) {
      case 'welcome':
        return (
          <View style={{ width }}>
            <OnboardingScreen
              title="Welcome to Journal Safe"
              subtitle="A safe space for your thoughts and feelings"
              illustration="💜"
              onNext={goToNext}
              onSkip={skipToEnd}
              showSkip
              nextButtonText="Get Started"
              backgroundColor="bg-purple-50"
            />
          </View>
        );

      case 'features':
        return (
          <View style={{ width }}>
            <OnboardingScreen
              title="What is Journal Safe?"
              subtitle="Your wellness companion for recovery and self-care"
              onNext={goToNext}
              onSkip={skipToEnd}
              showSkip
              backgroundColor="bg-white">
              <View className="mt-4">
                <FeatureCard
                  icon="📝"
                  title="Private Journaling"
                  description="Your thoughts stay private and secure. Write freely in your personal safe space."
                />
                <FeatureCard
                  icon="😌"
                  title="Mood Tracking"
                  description="Check in with yourself daily. Track patterns and celebrate progress."
                />
                <FeatureCard
                  icon="💜"
                  title="Recovery Support"
                  description="ED-safe prompts and affirmations designed to support your journey."
                />

                {/* Disclaimer */}
                <View className="mt-6 rounded-lg bg-purple-50 p-4">
                  <Text className="text-center text-sm font-medium text-purple-900">
                    ⚕️ Important: Journal Safe is a wellness tool, not medical treatment. Always
                    consult healthcare professionals for medical advice.
                  </Text>
                </View>
              </View>
            </OnboardingScreen>
          </View>
        );

      case 'personalize':
        return (
          <View style={{ width }}>
            <OnboardingScreen
              title="Personalize Your Experience"
              subtitle="Let's customize Journal Safe for you"
              illustration="⚙️"
              onNext={goToNext}
              onSkip={skipToEnd}
              showSkip
              backgroundColor="bg-purple-50">
              <View className="mt-4">
                {/* Language Selection */}
                <View className="mb-6">
                  <Text className="mb-3 text-base font-semibold text-gray-900">Language</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setLanguage('en')}
                      className={`flex-1 rounded-lg border-2 px-4 py-3 ${
                        language === 'en'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-center text-base font-medium ${
                          language === 'en' ? 'text-purple-600' : 'text-gray-700'
                        }`}>
                        English
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setLanguage('es')}
                      className={`flex-1 rounded-lg border-2 px-4 py-3 ${
                        language === 'es'
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 bg-white'
                      }`}>
                      <Text
                        className={`text-center text-base font-medium ${
                          language === 'es' ? 'text-purple-600' : 'text-gray-700'
                        }`}>
                        Español
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Daily Affirmations */}
                <View className="mb-6">
                  <View className="mb-3 flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        Daily Affirmations
                      </Text>
                      <Text className="mt-1 text-sm text-gray-600">
                        Receive gentle reminders and positive affirmations
                      </Text>
                    </View>
                    <Switch
                      value={affirmationsEnabled}
                      onValueChange={setAffirmationsEnabled}
                      trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                      thumbColor={affirmationsEnabled ? '#7c3aed' : '#f3f4f6'}
                    />
                  </View>

                  {/* Time Picker (simplified for MVP) */}
                  {affirmationsEnabled && (
                    <View className="mt-2">
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Preferred time
                      </Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => setAffirmationTime('09:00')}
                          className={`flex-1 rounded-lg border px-3 py-2 ${
                            affirmationTime === '09:00'
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-300 bg-white'
                          }`}>
                          <Text
                            className={`text-center text-sm ${
                              affirmationTime === '09:00' ? 'text-purple-600' : 'text-gray-700'
                            }`}>
                            9:00 AM
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setAffirmationTime('12:00')}
                          className={`flex-1 rounded-lg border px-3 py-2 ${
                            affirmationTime === '12:00'
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-300 bg-white'
                          }`}>
                          <Text
                            className={`text-center text-sm ${
                              affirmationTime === '12:00' ? 'text-purple-600' : 'text-gray-700'
                            }`}>
                            12:00 PM
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setAffirmationTime('20:00')}
                          className={`flex-1 rounded-lg border px-3 py-2 ${
                            affirmationTime === '20:00'
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-300 bg-white'
                          }`}>
                          <Text
                            className={`text-center text-sm ${
                              affirmationTime === '20:00' ? 'text-purple-600' : 'text-gray-700'
                            }`}>
                            8:00 PM
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </OnboardingScreen>
          </View>
        );

      case 'permissions':
        return (
          <View style={{ width }}>
            <OnboardingScreen
              title="Stay Connected"
              subtitle="Enable notifications to receive your daily affirmations and gentle reminders"
              illustration="🔔"
              onNext={() => completeOnboarding(true)}
              nextButtonText="Allow Notifications"
              backgroundColor="bg-white">
              <View className="mt-4">
                <View className="rounded-lg bg-purple-50 p-4">
                  <Text className="mb-2 text-center text-base font-medium text-purple-900">
                    Why we need notifications:
                  </Text>
                  <Text className="text-center text-sm leading-relaxed text-purple-800">
                    • Daily affirmations at your chosen time{'\n'}• Gentle check-in reminders
                    {'\n'}• Important wellness tips{'\n\n'}You can change this anytime in Settings
                  </Text>
                </View>

                {/* Skip Option */}
                <TouchableOpacity
                  onPress={() => completeOnboarding(false)}
                  className="mt-6 py-3">
                  <Text className="text-center text-base font-medium text-gray-600">
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            </OnboardingScreen>
          </View>
        );

      case 'ready':
        return (
          <View style={{ width }}>
            <OnboardingScreen
              title="You're All Set!"
              subtitle="Welcome to your safe space for wellness and recovery"
              illustration="✨"
              onNext={() => completeOnboarding(false)}
              nextButtonText="Start Journaling"
              backgroundColor="bg-purple-50">
              <View className="mt-4">
                <View className="rounded-lg bg-white p-5 shadow-sm">
                  <Text className="mb-2 text-base font-semibold text-gray-900">💡 Quick Tip</Text>
                  <Text className="text-base leading-relaxed text-gray-700">
                    Need immediate support? Access crisis resources anytime from the{' '}
                    <Text className="font-semibold text-purple-600">Help tab</Text>.{'\n\n'}
                    Remember: You're not alone on this journey. 💜
                  </Text>
                </View>
              </View>
            </OnboardingScreen>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Screens Carousel */}
      <FlatList
        ref={flatListRef}
        data={screens}
        renderItem={renderScreen}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      />

      {/* Progress Dots */}
      <View className="absolute bottom-24 left-0 right-0 flex-row justify-center pb-4">
        {screens.map((_, index) => (
          <View
            key={index}
            className={`mx-1 h-2 w-2 rounded-full ${
              index === currentScreen ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
