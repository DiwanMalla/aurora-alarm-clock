import { useAlarmStore, Alarm } from '@/stores/alarmStore';
import { workingAudioManager } from '@/lib/workingAudioManager';
import { notificationManager } from '@/lib/notificationManager';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

// Type declarations
declare const setInterval: (callback: () => void, ms: number) => number;
declare const clearInterval: (id: number) => void;
declare const console: {
  log: (message?: string, ...optionalParams: unknown[]) => void;
  error: (message?: string, ...optionalParams: unknown[]) => void;
};

class AlarmScheduler {
  private static instance: AlarmScheduler;
  private checkInterval: number | null = null;
  private isRunning = false;

  static getInstance(): AlarmScheduler {
    if (!AlarmScheduler.instance) {
      AlarmScheduler.instance = new AlarmScheduler();
    }
    return AlarmScheduler.instance;
  }

  start(): void {
    if (this.isRunning) return;

    console.log('🔔 Starting alarm scheduler...');
    this.isRunning = true;

    // Check for alarms every 30 seconds for more accurate triggering
    this.checkInterval = setInterval(() => {
      this.checkAlarms();
    }, 30000) as unknown as number;

    // Initial check
    this.checkAlarms();
  }

  stop(): void {
    if (!this.isRunning) return;

    console.log('🔇 Stopping alarm scheduler...');
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkAlarms(): void {
    const alarmStore = useAlarmStore.getState();
    const enabledAlarms = alarmStore.alarms.filter((alarm) => alarm.enabled);

    if (enabledAlarms.length === 0) return;

    const now = new Date();
    const currentTime = this.formatTime(now);
    const currentDay = this.getCurrentDay();

    for (const alarm of enabledAlarms) {
      if (this.shouldTriggerAlarm(alarm, currentTime, currentDay, now)) {
        this.triggerAlarm(alarm);
        break; // Only trigger one alarm at a time
      }
    }
  }

  private shouldTriggerAlarm(
    alarm: Alarm,
    currentTime: string,
    currentDay: string,
    _now: Date
  ): boolean {
    // Parse alarm time
    const [alarmHours, alarmMinutes] = alarm.time.split(':').map(Number);
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number);

    // Check if we're in the same minute as the alarm
    const isTimeMatch = alarmHours === currentHours && alarmMinutes === currentMinutes;

    if (!isTimeMatch) return false;

    // Check if it's a recurring alarm
    const hasRecurrence = Object.values(alarm.repeat).some((day: boolean) => day);

    if (hasRecurrence) {
      // Check if today is one of the selected days
      return alarm.repeat[currentDay as keyof typeof alarm.repeat];
    } else {
      // One-time alarm - always trigger if time matches (will be disabled after triggering)
      return true;
    }
  }
  private triggerAlarm(alarm: Alarm): void {
    console.log(`🚨 Triggering alarm: ${alarm.label} at ${alarm.time}`);

    const alarmStore = useAlarmStore.getState();

    // Set the alarm as active and ringing
    alarmStore.setActiveAlarm(alarm);
    alarmStore.setAlarmRinging(true);

    // For one-time alarms, disable them after triggering
    const hasRecurrence = Object.values(alarm.repeat).some((day: boolean) => day);
    if (!hasRecurrence) {
      alarmStore.updateAlarm(alarm.id, { enabled: false });
      console.log(`⏰ Disabled one-time alarm: ${alarm.label}`);
    }

    // Start playing the alarm sound
    this.playAlarmSound(alarm);

    // Send notification
    this.sendAlarmNotification(alarm);

    // Navigate to alarm ringing screen
    try {
      router.push('/alarm-ringing');
    } catch (error) {
      console.log('Navigation to alarm ringing screen failed:', error);
    }
  }

  private async playAlarmSound(alarm: Alarm): Promise<void> {
    try {
      // Add strong haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Map sound name to ID for the audio manager
      const soundId = this.mapSoundNameToId(alarm.sound?.name || 'Emergency Alarm');

      await workingAudioManager.playAlarm(soundId, {
        loop: true,
        volume: (alarm.sound?.volume || 80) / 100,
      });

      console.log(
        `🔊 Playing alarm sound: ${alarm.sound?.name || 'Emergency Alarm'} (ID: ${soundId})`
      );
    } catch (error) {
      console.error('❌ Failed to play alarm sound:', error);
    }
  }

  private mapSoundNameToId(soundName: string): string {
    // Map sound names to IDs for the audio manager
    switch (soundName.toLowerCase()) {
      case 'emergency alarm':
        return 'emergency-alarm';
      case 'classic alarm':
        return 'alarm-classic';
      case 'gentle wake':
        return 'alarm-gentle';
      case 'notification':
        return 'notification';
      case 'system default':
        return 'system-default';
      default:
        return 'emergency-alarm'; // Default fallback
    }
  }

  private async sendAlarmNotification(alarm: Alarm): Promise<void> {
    try {
      await notificationManager.scheduleAlarmNotification({
        id: alarm.id,
        title: '⏰ Alarm',
        body: alarm.label || 'Wake up!',
        trigger: new Date(), // Immediate notification
        data: { alarmId: alarm.id, type: 'alarm' },
      });

      console.log(`📱 Sent alarm notification: ${alarm.label}`);
    } catch (error) {
      console.error('❌ Failed to send alarm notification:', error);
    }
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private getCurrentDay(): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }

  // Method to manually stop current alarm
  async stopCurrentAlarm(): Promise<void> {
    try {
      await workingAudioManager.stopAlarm();

      const alarmStore = useAlarmStore.getState();
      alarmStore.setAlarmRinging(false);
      alarmStore.setActiveAlarm(null);

      console.log('🔇 Stopped current alarm');
    } catch (error) {
      console.error('❌ Failed to stop current alarm:', error);
    }
  }

  // Method to snooze current alarm
  async snoozeCurrentAlarm(): Promise<void> {
    try {
      await workingAudioManager.stopAlarm();

      const alarmStore = useAlarmStore.getState();
      alarmStore.snoozeAlarm();

      console.log('😴 Snoozed current alarm');
    } catch (error) {
      console.error('❌ Failed to snooze current alarm:', error);
    }
  }
}

// Export singleton instance
export const alarmScheduler = AlarmScheduler.getInstance();

// Auto-start the scheduler when imported
alarmScheduler.start();
