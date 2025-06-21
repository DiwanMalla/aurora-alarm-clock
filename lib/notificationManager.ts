import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { audioManager } from './simpleAudioManager';

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

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return false;
      }

      // Request notification permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      this.isInitialized = true;
      console.log('✅ NotificationManager initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize NotificationManager:', error);
      return false;
    }
  }

  async scheduleAlarmNotification(alarm: AlarmNotification): Promise<string | null> {
    try {
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
      await this.initialize();

      // Calculate trigger time for when timer completes
      // For now using immediate trigger - will be enhanced later
      // const triggerDate = new Date(Date.now() + duration * 1000);

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
        trigger: null, // Trigger immediately for now
      });

      console.log(`⏲️ Scheduled timer notification: ${notificationId}`);
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
