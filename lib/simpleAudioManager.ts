import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

// Type declarations for timer functions
declare const setInterval: (callback: () => void, ms: number) => number;
declare const clearInterval: (id: number) => void;
declare const setTimeout: (callback: () => void, ms: number) => number;
declare const console: {
  log: (message?: string, ...optionalParams: unknown[]) => void;
  error: (message?: string, ...optionalParams: unknown[]) => void;
};

export interface SoundOption {
  id: string;
  name: string;
  type: 'builtin' | 'system' | 'notification';
  description?: string;
}

// Available sounds for the app
export const AVAILABLE_SOUNDS: SoundOption[] = [
  {
    id: 'system-default',
    name: 'System Default',
    type: 'system',
    description: 'Use device default alarm sound',
  },
  {
    id: 'notification',
    name: 'Notification',
    type: 'notification',
    description: 'Standard notification sound',
  },
  {
    id: 'gentle',
    name: 'Gentle Alarm',
    type: 'notification',
    description: 'Soft wake-up sound',
  },
  {
    id: 'classic',
    name: 'Classic Bell',
    type: 'notification',
    description: 'Traditional alarm bell',
  },
  {
    id: 'digital',
    name: 'Digital Beep',
    type: 'notification',
    description: 'Modern digital alarm',
  },
];

class SimpleAudioManager {
  private static instance: SimpleAudioManager;
  private currentAlarm: Audio.Sound | null = null;
  private isInitialized = false;
  private alarmInterval: number | null = null;

  static getInstance(): SimpleAudioManager {
    if (!SimpleAudioManager.instance) {
      SimpleAudioManager.instance = new SimpleAudioManager();
    }
    return SimpleAudioManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio to play even when device is silent
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // Critical for alarms!
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });

      this.isInitialized = true;
      console.log('✅ AudioManager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AudioManager:', error);
    }
  }

  async playAlarm(
    soundId: string = 'system-default',
    options?: {
      loop?: boolean;
      volume?: number;
      duration?: number;
    }
  ): Promise<void> {
    try {
      await this.initialize();
      await this.stopAlarm(); // Stop any existing alarm

      const { loop = true, duration } = options || {};

      // Add haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      if (soundId === 'system-default' || soundId === 'notification') {
        // Use notification system for reliable alarm playback
        await this.playNotificationAlarm(loop, duration);
      } else {
        // For now, fall back to notification system
        // In the future, you could add custom sound files here
        await this.playNotificationAlarm(loop, duration);
      }

      console.log(`🔔 Playing alarm: ${soundId}`);
    } catch (error) {
      console.error('❌ Failed to play alarm:', error);
      // Fallback to basic notification
      await this.playFallbackNotification();
    }
  }

  private async playNotificationAlarm(loop: boolean = true, duration?: number): Promise<void> {
    if (loop && !duration) {
      // For continuous alarms, schedule repeated notifications
      this.scheduleRepeatingAlarm();
    } else {
      // Single notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm',
          body: 'Wake up! Your alarm is ringing.',
          sound: true,
          vibrate: [0, 250, 250, 250],
          priority: 'high',
        },
        trigger: null, // Play immediately
      });

      if (duration) {
        setTimeout(() => {
          this.stopAlarm();
        }, duration);
      }
    }
  }

  private scheduleRepeatingAlarm(): void {
    // Schedule immediate notification
    this.playNotificationAlarm(false);

    // Set up interval for repeated notifications every 30 seconds
    this.alarmInterval = setInterval(async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Alarm Still Ringing',
          body: 'Tap to stop the alarm.',
          sound: true,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null,
      });
    }, 30000) as unknown as number; // Type assertion for React Native
  }

  async playTimerSound(): Promise<void> {
    try {
      await this.initialize();

      // Add haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏲️ Timer Complete',
          body: 'Your timer has finished!',
          sound: true,
          vibrate: [0, 100, 100, 100],
        },
        trigger: null,
      });

      console.log('⏲️ Timer sound played');
    } catch (error) {
      console.error('❌ Failed to play timer sound:', error);
    }
  }

  async playTestSound(soundId: string): Promise<void> {
    try {
      await this.playAlarm(soundId, {
        loop: false,
        duration: 3000, // 3 seconds
      });
    } catch (error) {
      console.error('❌ Failed to play test sound:', error);
    }
  }

  async stopAlarm(): Promise<void> {
    try {
      // Clear repeating alarm interval
      if (this.alarmInterval) {
        clearInterval(this.alarmInterval);
        this.alarmInterval = null;
      }

      // Stop any playing audio
      if (this.currentAlarm) {
        await this.currentAlarm.stopAsync();
        await this.currentAlarm.unloadAsync();
        this.currentAlarm = null;
      }

      // Cancel any scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      console.log('🔇 Alarm stopped');
    } catch (error) {
      console.error('❌ Failed to stop alarm:', error);
    }
  }

  private async playFallbackNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Alarm',
          body: 'Wake up!',
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('❌ Fallback notification failed:', error);
    }
  }

  getAvailableSounds(): SoundOption[] {
    return AVAILABLE_SOUNDS;
  }

  async cleanup(): Promise<void> {
    await this.stopAlarm();
  }
}

// Export singleton instance
export const audioManager = SimpleAudioManager.getInstance();

// Initialize on import
audioManager.initialize().catch(console.error);
