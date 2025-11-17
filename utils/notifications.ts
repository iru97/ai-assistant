/**
 * Notification Utilities
 *
 * Handles push notification permissions, scheduling, and navigation for affirmations.
 * Uses local notifications (scheduled on device) to comply with HIPAA - no PHI in notifications.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseTime } from './affirmationSettings';

const NOTIFICATION_IDENTIFIER = 'daily-affirmation';
const LAST_NOTIFICATION_ID_KEY = '@journal_safe:last_notification_id';

/**
 * Configure notification behavior
 * This determines how notifications are displayed when the app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions from the user
 * Must be called before scheduling notifications
 *
 * @returns Object with status and granted boolean
 */
export async function requestNotificationPermissions(): Promise<{
  status: Notifications.PermissionStatus;
  granted: boolean;
}> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('affirmations', {
        name: 'Daily Affirmations',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7c3aed',
        description: 'Daily affirmation reminders',
      });
    }

    return {
      status: finalStatus,
      granted: finalStatus === 'granted',
    };
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return {
      status: 'denied' as Notifications.PermissionStatus,
      granted: false,
    };
  }
}

/**
 * Check if notification permissions are granted
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Schedule daily affirmation notification
 * Creates a repeating notification at the specified time
 *
 * HIPAA COMPLIANT: Notification body is generic and contains no PHI
 *
 * @param time - Time in "HH:mm" format (24-hour)
 * @returns Notification identifier or null if failed
 */
export async function scheduleDailyAffirmation(time: string): Promise<string | null> {
  try {
    // Cancel any existing notifications first
    await cancelDailyAffirmation();

    // Check permissions
    const hasPermission = await hasNotificationPermissions();
    if (!hasPermission) {
      const { granted } = await requestNotificationPermissions();
      if (!granted) {
        console.warn('Notification permissions not granted');
        return null;
      }
    }

    // Parse the time
    const { hour, minute } = parseTime(time);

    // Schedule the notification
    // IMPORTANT: This is a LOCAL notification scheduled on the device
    // The actual affirmation text is NOT in the notification (HIPAA compliant)
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Journal Safe',
        body: 'Your daily affirmation is ready',
        data: { type: 'daily-affirmation' },
        sound: true,
        // Android specific
        ...(Platform.OS === 'android' && {
          channelId: 'affirmations',
        }),
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        // Note: On iOS, repeating notifications require either:
        // - Daily (using hour/minute)
        // - Weekly (using weekday)
        // - Monthly (using day)
      },
    });

    // Store the notification ID for later cancellation
    await AsyncStorage.setItem(LAST_NOTIFICATION_ID_KEY, notificationId);

    console.log(`Daily affirmation scheduled for ${time} with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily affirmation:', error);
    return null;
  }
}

/**
 * Cancel the daily affirmation notification
 */
export async function cancelDailyAffirmation(): Promise<void> {
  try {
    // Get the last notification ID
    const lastNotificationId = await AsyncStorage.getItem(LAST_NOTIFICATION_ID_KEY);

    if (lastNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(lastNotificationId);
      await AsyncStorage.removeItem(LAST_NOTIFICATION_ID_KEY);
      console.log(`Cancelled notification: ${lastNotificationId}`);
    }

    // Also cancel all notifications with our identifier (just in case)
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === 'daily-affirmation') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error cancelling daily affirmation:', error);
  }
}

/**
 * Reschedule the daily affirmation notification
 * Cancels existing and schedules a new one
 *
 * @param time - Time in "HH:mm" format (24-hour)
 */
export async function rescheduleDailyAffirmation(time: string): Promise<string | null> {
  await cancelDailyAffirmation();
  return await scheduleDailyAffirmation(time);
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Check if daily affirmation notification is scheduled
 */
export async function isDailyAffirmationScheduled(): Promise<boolean> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    return scheduledNotifications.some(
      (notification) => notification.content.data?.type === 'daily-affirmation'
    );
  } catch (error) {
    console.error('Error checking if notification is scheduled:', error);
    return false;
  }
}

/**
 * Handle notification tap/press
 * This should be called from the main app component to set up navigation
 *
 * @param navigation - Navigation object from React Navigation
 * @returns Subscription that should be cleaned up on unmount
 */
export function setupNotificationHandler(
  onNotificationTap: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  // This subscription triggers when user taps a notification
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const notification = response.notification;
    if (notification.request.content.data?.type === 'daily-affirmation') {
      onNotificationTap(notification);
    }
  });
}

/**
 * Send a test notification (for debugging/testing)
 */
export async function sendTestNotification(): Promise<void> {
  try {
    const hasPermission = await hasNotificationPermissions();
    if (!hasPermission) {
      const { granted } = await requestNotificationPermissions();
      if (!granted) {
        console.warn('Notification permissions not granted');
        return;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Journal Safe',
        body: 'Your daily affirmation is ready',
        data: { type: 'daily-affirmation' },
      },
      trigger: {
        seconds: 2,
      },
    });

    console.log('Test notification scheduled for 2 seconds from now');
  } catch (error) {
    console.error('Error sending test notification:', error);
  }
}
