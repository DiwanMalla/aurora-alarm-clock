import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Native OS Ringtones and Sounds
export const NATIVE_SOUNDS = {
  ios: {
    // iOS System Sounds - these will use iOS native sound IDs
    alarm: { systemSoundID: 1005, name: 'Alarm' },
    bells: { systemSoundID: 1013, name: 'Bells' },
    anticipate: { systemSoundID: 1020, name: 'Anticipate' },
    bloom: { systemSoundID: 1021, name: 'Bloom' },
    calypso: { systemSoundID: 1022, name: 'Calypso' },
    choo_choo: { systemSoundID: 1023, name: 'Choo Choo' },
    descent: { systemSoundID: 1024, name: 'Descent' },
    fanfare: { systemSoundID: 1025, name: 'Fanfare' },
    ladder: { systemSoundID: 1026, name: 'Ladder' },
    minuet: { systemSoundID: 1027, name: 'Minuet' },
    news_flash: { systemSoundID: 1028, name: 'News Flash' },
    noir: { systemSoundID: 1029, name: 'Noir' },
    sherwood_forest: { systemSoundID: 1030, name: 'Sherwood Forest' },
    spell: { systemSoundID: 1031, name: 'Spell' },
    suspense: { systemSoundID: 1032, name: 'Suspense' },
    telegraph: { systemSoundID: 1033, name: 'Telegraph' },
    tiptoes: { systemSoundID: 1034, name: 'Tiptoes' },
    typewriters: { systemSoundID: 1035, name: 'Typewriters' },
    update: { systemSoundID: 1036, name: 'Update' },
  },
  android: {
    // Android System Ringtones - these will use Android's RingtoneManager
    alarm: { uri: 'content://settings/system/alarm_alert', name: 'Default Alarm' },
    notification: {
      uri: 'content://settings/system/notification_sound',
      name: 'Default Notification',
    },
    ringtone: { uri: 'content://settings/system/ringtone', name: 'Default Ringtone' },
    // Additional Android alarms
    oxygen: { name: 'Oxygen' },
    helium: { name: 'Helium' },
    carbon: { name: 'Carbon' },
    neon: { name: 'Neon' },
    krypton: { name: 'Krypton' },
    argon: { name: 'Argon' },
  },
};

// Built-in app sounds (cross-platform)
export const BUILTIN_SOUNDS = {
  classic: {
    name: 'Classic Alarm',
    file: require('../sounds/classic-alarm.mp3'),
    description: 'Traditional alarm clock sound',
  },
  gentle: {
    name: 'Gentle Wake',
    file: require('../sounds/gentle-wake.mp3'),
    description: 'Soft melodic wake-up tone',
  },
  chimes: {
    name: 'Chimes',
    file: require('../sounds/chimes.mp3'),
    description: 'Peaceful bell chimes',
  },
  digital: {
    name: 'Digital Beep',
    file: require('../sounds/digital-beep.mp3'),
    description: 'Modern digital alarm sound',
  },
  nature: {
    name: 'Nature Sounds',
    file: require('../sounds/nature-birds.mp3'),
    description: 'Gentle bird sounds',
  },
  timer: {
    name: 'Timer Complete',
    file: require('../sounds/timer-complete.mp3'),
    description: 'Timer completion sound',
  },
};

export interface SoundConfig {
  type: 'native' | 'builtin' | 'custom';
  id: string;
  name: string;
  uri?: string;
  systemSoundID?: number;
  volume: number;
  fadeIn: boolean;
  fadeDuration: number;
}

class AudioManager {
  private static instance: AudioManager;
  private soundObjects: Map<string, Audio.Sound> = new Map();
  private isInitialized = false;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Configure audio for alarm/timer app
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true, // Important for alarms!
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: false,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('AudioManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
    }
  }

  async preloadBuiltinSounds() {
    try {
      for (const [key, soundConfig] of Object.entries(BUILTIN_SOUNDS)) {
        const { sound } = await Audio.Sound.createAsync(soundConfig.file, {
          shouldPlay: false,
          isLooping: false,
        });
        this.soundObjects.set(`builtin_${key}`, sound);
      }
      console.log('Built-in sounds preloaded');
    } catch (error) {
      console.error('Failed to preload built-in sounds:', error);
    }
  }

  async playSound(config: SoundConfig): Promise<void> {
    try {
      await this.initialize();

      if (config.type === 'native') {
        await this.playNativeSound(config);
      } else if (config.type === 'builtin') {
        await this.playBuiltinSound(config);
      } else if (config.type === 'custom') {
        await this.playCustomSound(config);
      }
    } catch (error) {
      console.error('Failed to play sound:', error);
      // Fallback to system notification sound
      await this.playFallbackSound();
    }
  }

  private async playNativeSound(config: SoundConfig) {
    if (Platform.OS === 'ios' && config.systemSoundID) {
      // Use iOS System Sound Services
      const { Audio } = require('expo-av');
      // For now, we'll use a built-in sound as fallback
      // In a real implementation, you'd use react-native-sound or similar
      await this.playFallbackSound();
    } else if (Platform.OS === 'android' && config.uri) {
      // Use Android RingtoneManager
      const { sound } = await Audio.Sound.createAsync(
        { uri: config.uri },
        {
          shouldPlay: true,
          isLooping: false,
          volume: config.volume,
        }
      );
      await sound.playAsync();
    }
  }

  private async playBuiltinSound(config: SoundConfig) {
    const soundKey = `builtin_${config.id}`;
    let sound = this.soundObjects.get(soundKey);

    if (!sound) {
      // Load on-demand if not preloaded
      const soundConfig = BUILTIN_SOUNDS[config.id as keyof typeof BUILTIN_SOUNDS];
      if (soundConfig) {
        const { sound: newSound } = await Audio.Sound.createAsync(soundConfig.file);
        sound = newSound;
        this.soundObjects.set(soundKey, sound);
      }
    }

    if (sound) {
      await sound.setVolumeAsync(config.volume);

      if (config.fadeIn) {
        // Implement fade-in
        await sound.setVolumeAsync(0);
        await sound.playAsync();

        // Gradually increase volume
        const steps = 20;
        const stepDuration = config.fadeDuration / steps;
        const volumeStep = config.volume / steps;

        for (let i = 1; i <= steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration));
          await sound.setVolumeAsync(volumeStep * i);
        }
      } else {
        await sound.playAsync();
      }
    }
  }

  private async playCustomSound(config: SoundConfig) {
    if (config.uri) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: config.uri },
        {
          shouldPlay: !config.fadeIn,
          isLooping: false,
          volume: config.fadeIn ? 0 : config.volume,
        }
      );

      if (config.fadeIn) {
        await sound.playAsync();
        // Implement fade-in similar to builtin sounds
        const steps = 20;
        const stepDuration = config.fadeDuration / steps;
        const volumeStep = config.volume / steps;

        for (let i = 1; i <= steps; i++) {
          await new Promise((resolve) => setTimeout(resolve, stepDuration));
          await sound.setVolumeAsync(volumeStep * i);
        }
      }
    }
  }

  private async playFallbackSound() {
    try {
      // Play a simple system notification sound as fallback
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Alarm',
          body: "Time's up!",
          sound: true,
        },
        trigger: null, // Play immediately
      });
    } catch (error) {
      console.error('Fallback sound failed:', error);
    }
  }

  async stopAllSounds() {
    try {
      for (const sound of this.soundObjects.values()) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.error('Failed to stop sounds:', error);
    }
  }

  async cleanup() {
    try {
      for (const sound of this.soundObjects.values()) {
        await sound.unloadAsync();
      }
      this.soundObjects.clear();
    } catch (error) {
      console.error('Failed to cleanup sounds:', error);
    }
  }

  // Utility methods for common use cases
  async playAlarmSound(volume: number = 1.0, fadeIn: boolean = false) {
    const config: SoundConfig = {
      type: Platform.OS === 'ios' ? 'native' : 'builtin',
      id: Platform.OS === 'ios' ? 'alarm' : 'classic',
      name: Platform.OS === 'ios' ? 'iOS Alarm' : 'Classic Alarm',
      volume,
      fadeIn,
      fadeDuration: 3000, // 3 seconds fade-in
      ...(Platform.OS === 'ios' && { systemSoundID: 1005 }),
    };

    await this.playSound(config);
  }

  async playTimerSound(volume: number = 0.8) {
    const config: SoundConfig = {
      type: 'builtin',
      id: 'timer',
      name: 'Timer Complete',
      volume,
      fadeIn: false,
      fadeDuration: 0,
    };

    await this.playSound(config);
  }

  // Get available sounds for user selection
  getAvailableSounds() {
    const nativeSounds =
      Platform.OS === 'ios'
        ? Object.entries(NATIVE_SOUNDS.ios).map(([key, sound]) => ({
            type: 'native' as const,
            id: key,
            name: sound.name,
            category: 'Native iOS',
          }))
        : Object.entries(NATIVE_SOUNDS.android).map(([key, sound]) => ({
            type: 'native' as const,
            id: key,
            name: sound.name,
            category: 'Native Android',
          }));

    const builtinSounds = Object.entries(BUILTIN_SOUNDS).map(([key, sound]) => ({
      type: 'builtin' as const,
      id: key,
      name: sound.name,
      description: sound.description,
      category: 'Built-in',
    }));

    return {
      native: nativeSounds,
      builtin: builtinSounds,
    };
  }
}

export default AudioManager.getInstance();
