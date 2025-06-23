import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { emergencyAlarmSound } from '@/constants/AudioAssets';

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

// Available sounds for the app - all using the same MP3 for now
export const AVAILABLE_SOUNDS: SoundOption[] = [
  {
    id: 'emergency-alarm',
    name: 'Emergency Alarm',
    type: 'builtin',
    description: 'Futuristic sonic alarm sound',
  },
  {
    id: 'alarm-classic',
    name: 'Classic Alarm',
    type: 'builtin',
    description: 'Traditional alarm sound',
  },
  {
    id: 'alarm-gentle',
    name: 'Gentle Wake',
    type: 'builtin',
    description: 'Soft wake-up sound',
  },
  {
    id: 'notification',
    name: 'Notification',
    type: 'notification',
    description: 'Standard notification sound',
  },
  {
    id: 'system-default',
    name: 'System Default',
    type: 'system',
    description: 'Use device default alarm sound',
  },
];

class WorkingAudioManager {
  private static instance: WorkingAudioManager;
  private currentAlarm: Audio.Sound | null = null;
  private isInitialized = false;
  private alarmInterval: number | null = null;

  static getInstance(): WorkingAudioManager {
    if (!WorkingAudioManager.instance) {
      WorkingAudioManager.instance = new WorkingAudioManager();
    }
    return WorkingAudioManager.instance;
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
      console.log('✅ WorkingAudioManager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize WorkingAudioManager:', error);
    }
  }

  // Get the alarm sound source based on the sound ID
  private getAlarmSoundSource(soundId?: string) {
    // For now, all alarms use the same emergency alarm sound
    // This can be expanded later to support multiple sound files
    switch (soundId) {
      case 'emergency-alarm':
      case 'alarm-classic':
      case 'alarm-gentle':
      case 'system-default':
      default:
        return emergencyAlarmSound;
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

      const { loop = true, volume = 1.0, duration } = options || {};

      console.log(`🔔 Playing alarm: ${soundId}`);

      // Add haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      if (soundId === 'system-default' || soundId === 'notification') {
        // Use system notification sound
        await this.playSystemSound(loop, duration);
      } else {
        // Use generated beep sounds
        await this.playGeneratedSound(soundId, loop, volume, duration);
      }
    } catch (error) {
      console.error('❌ Failed to play alarm:', error);
      // Fallback to system notification
      await this.playSystemSound(false);
    }
  }

  private async playGeneratedSound(
    soundId: string,
    loop: boolean,
    volume: number,
    duration?: number
  ): Promise<void> {
    try {
      // Use our MP3 file for all built-in sounds
      const soundSource = this.getAlarmSoundSource(soundId);

      const { sound } = await Audio.Sound.createAsync(soundSource as number, {
        shouldPlay: true,
        isLooping: loop,
        volume,
      });

      this.currentAlarm = sound;

      // If duration is specified, stop after that time
      if (duration) {
        setTimeout(() => {
          this.stopAlarm();
        }, duration);
      }

      console.log(`🎵 Playing generated sound: ${soundId}`);
    } catch (error) {
      console.error(`❌ Failed to play generated sound ${soundId}:`, error);
      // Fallback to system sound
      await this.playSystemSound(loop, duration);
    }
  }

  private async playSystemSound(loop: boolean = false, duration?: number): Promise<void> {
    try {
      // Use notification for system sound
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

      // If looping is requested, set up repeated notifications
      if (loop && !duration) {
        this.scheduleRepeatingAlarm();
      } else if (duration) {
        setTimeout(() => {
          this.stopAlarm();
        }, duration);
      }

      console.log('🔔 Playing system notification sound');
    } catch (error) {
      console.error('❌ Failed to play system sound:', error);
    }
  }

  private scheduleRepeatingAlarm(): void {
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
    }, 30000) as unknown as number;
  }

  async playTimerSound(): Promise<void> {
    try {
      await this.initialize();

      // Add haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Try to play our MP3 alarm sound
      try {
        const soundSource = this.getAlarmSoundSource();
        const { sound } = await Audio.Sound.createAsync(soundSource as number, {
          shouldPlay: true,
          volume: 0.8,
        });

        // Auto-cleanup after 2 seconds
        setTimeout(async () => {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch {
            console.log('Audio cleanup completed');
          }
        }, 2000);

        console.log('⏲️ Timer beep sound played');
      } catch {
        console.log('Audio playback failed, using notification fallback');

        // Fallback to notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⏲️ Timer Complete',
            body: 'Your timer has finished!',
            sound: true,
            vibrate: [0, 100, 100, 100],
          },
          trigger: null,
        });
      }

      console.log('⏲️ Timer completion alert triggered');
    } catch (error) {
      console.error('❌ Failed to play timer sound:', error);
    }
  }

  async playTestSound(soundId: string, volume: number = 0.7): Promise<void> {
    try {
      console.log(`🧪 Testing sound: ${soundId} at volume ${volume}`);
      await this.playAlarm(soundId, {
        loop: false,
        duration: 3000, // 3 seconds
        volume: volume,
      });
    } catch (error) {
      console.error('❌ Failed to play test sound:', error);
    }
  }

  async stopAlarm(): Promise<void> {
    try {
      console.log('🔇 Stopping all alarm audio...');

      // Clear repeating alarm interval
      if (this.alarmInterval) {
        clearInterval(this.alarmInterval);
        this.alarmInterval = null;
        console.log('✅ Cleared alarm interval');
      }

      // Stop any playing audio with better error handling
      if (this.currentAlarm) {
        try {
          const status = await this.currentAlarm.getStatusAsync();
          if (status.isLoaded) {
            await this.currentAlarm.stopAsync();
            console.log('✅ Audio stopped');
          }
        } catch (stopError) {
          console.log('Audio stop error (might already be stopped):', stopError);
        }

        try {
          await this.currentAlarm.unloadAsync();
          console.log('✅ Audio unloaded');
        } catch (unloadError) {
          console.log('Audio unload error (might already be unloaded):', unloadError);
        }

        this.currentAlarm = null;
      }

      // Cancel any scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Cancelled all notifications');

      console.log('🔇 Alarm stopped completely');
    } catch (error) {
      console.error('❌ Failed to stop alarm:', error);
      // Force cleanup even if there are errors
      this.currentAlarm = null;
      this.alarmInterval = null;
    }
  }

  async forceStopAllAudio(): Promise<void> {
    console.log('🚨 FORCE STOPPING ALL AUDIO');

    try {
      // Clear any intervals first
      if (this.alarmInterval) {
        clearInterval(this.alarmInterval);
        this.alarmInterval = null;
        console.log('✅ Force: Cleared interval');
      }

      // Force stop current alarm with multiple attempts
      if (this.currentAlarm) {
        console.log('🛑 Force: Stopping current alarm...');

        try {
          await this.currentAlarm.setPositionAsync(0);
          console.log('✅ Force: Reset position');
        } catch (positionError) {
          console.log('Force: Position reset failed:', positionError);
        }

        try {
          await this.currentAlarm.pauseAsync();
          console.log('✅ Force: Paused audio');
        } catch (pauseError) {
          console.log('Force: Pause failed:', pauseError);
        }

        try {
          await this.currentAlarm.stopAsync();
          console.log('✅ Force: Stopped audio');
        } catch (stopError) {
          console.log('Force: Stop failed:', stopError);
        }

        try {
          await this.currentAlarm.unloadAsync();
          console.log('✅ Force: Unloaded audio');
        } catch (unloadError) {
          console.log('Force: Unload failed:', unloadError);
        }

        this.currentAlarm = null;
      }

      // Cancel all notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Force: Cancelled notifications');

      // Reset audio mode to ensure clean state
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      console.log('✅ Force: Reset audio mode');

      console.log('🚨 FORCE STOP COMPLETED');
    } catch (error) {
      console.error('❌ Force stop failed:', error);
      // Always clear references even if operations fail
      this.currentAlarm = null;
      this.alarmInterval = null;
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
export const workingAudioManager = WorkingAudioManager.getInstance();

// Initialize on import
workingAudioManager.initialize().catch(console.error);
