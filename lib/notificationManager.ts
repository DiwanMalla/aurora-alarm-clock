import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { audioManager } from './simpleAudioManager';
import { useSettingsStore } from '@/stores/settingsStore';

// Type declarations
declare const console: {
  log: (message?: string, ...optionalParams: unknown[]) => void;
  error: (message?: string, ...optionalParams: unknown[]) => void;
  warn: (message?: string, ...optionalParams: unknown[]) => void;
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface AlarmNotification {
  id: string;
  title: string;
  body: string;
  trigger: Date;
  data?: Record<string, unknown>;
}

class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private getSettings() {
    // Get settings from store
    return useSettingsStore.getState().settings;
  }

  private areNotificationsEnabled(): boolean {
    const settings = this.getSettings();
    const { notifications } = settings;

    // Check if global notifications are enabled and permission is granted
    return notifications.enabled && notifications.permissionStatus === 'granted';
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Update the permission status in settings
      const { setNotificationPermissionStatus, markPermissionAsAsked } =
        useSettingsStore.getState();

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        markPermissionAsAsked();
      }

      // Update the settings store with the final status
      setNotificationPermissionStatus(finalStatus as 'granted' | 'denied' | 'undetermined');

      if (finalStatus === 'granted') {
        console.log('✅ Notification permissions granted');
        return true;
      } else {
        console.warn('❌ Notification permissions denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to request notification permissions:', error);
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      const permissionGranted = await this.requestPermissions();

      if (permissionGranted) {
        this.isInitialized = true;
        console.log('✅ NotificationManager initialized');
        return true;
      } else {
        console.warn('❌ NotificationManager initialization failed - no permissions');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize NotificationManager:', error);
      return false;
    }
  }

  async scheduleAlarmNotification(alarm: AlarmNotification): Promise<string | null> {
    try {
      // Check if alarm notifications are enabled
      if (!this.areNotificationsEnabled()) {
        console.log('📴 Alarm notifications are disabled in settings');
        return null;
      }

      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.title,
          body: alarm.body,
          sound: true,
          priority: 'high',
          data: {
            type: 'alarm',
            alarmId: alarm.id,
            ...alarm.data,
          },
        },
        trigger: null, // Trigger immediately for now
      });

      console.log(`📅 Scheduled alarm notification: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to schedule alarm notification:', error);
      return null;
    }
  }

  async scheduleTimerNotification(
    duration: number,
    title: string = 'Timer'
  ): Promise<string | null> {
    try {
      // Check if timer notifications are enabled
      if (!this.areNotificationsEnabled()) {
        console.log('📴 Timer notifications are disabled in settings');
        return null;
      }

      await this.initialize();

      // Debug logging - removed due to type restrictions
      if (duration <= 0) {
        console.warn('⚠️ Invalid duration for timer notification:', duration);
        return null;
      }

      if (duration < 1) {
        console.warn('⚠️ Duration too short for notification:', duration);
        return null;
      }

      // Calculate the exact time when notification should trigger
      const triggerDate = new Date(Date.now() + duration * 1000);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: 'Your timer has finished!',
          sound: true,
          priority: 'high',
          data: {
            type: 'timer',
            duration,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      // Schedule notification for the future
      console.log('⏲️ Scheduled timer notification:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('❌ Failed to schedule timer notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`🗑️ Cancelled notification: ${notificationId}`);
    } catch (error) {
      console.error('❌ Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ Cancelled all notifications');
    } catch (error) {
      console.error('❌ Failed to cancel all notifications:', error);
    }
  }

  async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    const { data } = notification.request.content;

    if (data?.type === 'alarm') {
      // Play alarm sound
      await audioManager.playAlarm('system-default', {
        loop: true,
        duration: 60000, // 1 minute alarm
      });
    } else if (data?.type === 'timer') {
      // Play timer sound
      await audioManager.playTimerSound();
    }
  }

  setupNotificationListeners(): void {
    // Listen for notifications received while app is in foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived.bind(this));
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('❌ Failed to get scheduled notifications:', error);
      return [];
    }
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Initialize on import
notificationManager.initialize().catch(console.error);
