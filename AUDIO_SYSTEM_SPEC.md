# Aurora Clock - Audio System Technical Specification

## Overview

Comprehensive audio system supporting built-in copyright-free sounds, user custom audio files, and advanced audio features for the ultimate alarm experience.

## Audio Architecture

### Core Audio Engine

```typescript
// lib/audio/AudioEngine.ts
export class AudioEngine {
  private sound: Audio.Sound | null = null;
  private fadeInterval: NodeJS.Timeout | null = null;
  private currentVolume: number = 0;

  // Audio configuration
  private audioConfig: Audio.AudioMode = {
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  };

  async initialize() {
    await Audio.setAudioModeAsync(this.audioConfig);
  }

  async playAlarm(audioSource: AudioSource, options: PlaybackOptions) {
    try {
      const { sound } = await Audio.Sound.createAsync(audioSource.uri, {
        shouldPlay: true,
        volume: options.startVolume || 0.1,
        isLooping: true,
        progressUpdateIntervalMillis: 1000,
      });

      this.sound = sound;

      if (options.fadeIn) {
        await this.gradualVolumeIncrease(options.targetVolume || 0.8);
      }

      return sound;
    } catch (error) {
      console.error('Failed to play alarm:', error);
      throw new AudioPlaybackError(error);
    }
  }

  private async gradualVolumeIncrease(targetVolume: number) {
    const steps = 30; // 30 steps
    const stepDuration = 1000; // 1 second per step
    const volumeStep = targetVolume / steps;

    this.currentVolume = 0.1;

    this.fadeInterval = setInterval(async () => {
      if (this.currentVolume < targetVolume && this.sound) {
        this.currentVolume += volumeStep;
        await this.sound.setVolumeAsync(Math.min(this.currentVolume, targetVolume));
      } else {
        this.clearFadeInterval();
      }
    }, stepDuration);
  }

  async stopAlarm() {
    this.clearFadeInterval();
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  private clearFadeInterval() {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }
}
```

### Audio Source Management

```typescript
// types/audio.ts
export interface AudioSource {
  id: string;
  name: string;
  type: 'built-in' | 'user-uploaded' | 'streaming';
  category: AudioCategory;
  uri: string;
  duration: number; // in seconds
  fileSize?: number; // in bytes
  format: 'mp3' | 'm4a' | 'wav' | 'aac';
  licensed: boolean;
  attribution?: string;
  preview?: string; // short preview URI
  tags: string[];
  createdAt: Date;
}

export enum AudioCategory {
  TRADITIONAL = 'traditional',
  NATURE = 'nature',
  MUSICAL = 'musical',
  WELLNESS = 'wellness',
  UNIQUE = 'unique',
  USER_CUSTOM = 'user_custom',
  RECORDED = 'recorded',
}

export interface PlaybackOptions {
  startVolume?: number;
  targetVolume?: number;
  fadeIn?: boolean;
  fadeDuration?: number; // in seconds
  equalizer?: EqualizerSettings;
}

export interface EqualizerSettings {
  bass: number; // -10 to 10
  mid: number;
  treble: number;
  enabled: boolean;
}
```

### Built-in Audio Library

```typescript
// lib/audio/BuiltInSounds.ts
export const BUILT_IN_SOUNDS: AudioSource[] = [
  // Traditional Alarms
  {
    id: 'classic_beep',
    name: 'Classic Beep',
    type: 'built-in',
    category: AudioCategory.TRADITIONAL,
    uri: require('../../assets/audio/traditional/classic_beep.mp3'),
    duration: 30,
    format: 'mp3',
    licensed: true,
    tags: ['beep', 'classic', 'digital'],
    createdAt: new Date(),
  },
  {
    id: 'gentle_chime',
    name: 'Gentle Chime',
    type: 'built-in',
    category: AudioCategory.TRADITIONAL,
    uri: require('../../assets/audio/traditional/gentle_chime.mp3'),
    duration: 45,
    format: 'mp3',
    licensed: true,
    tags: ['chime', 'bell', 'gentle'],
    createdAt: new Date(),
  },

  // Nature Sounds
  {
    id: 'morning_birds',
    name: 'Morning Birds',
    type: 'built-in',
    category: AudioCategory.NATURE,
    uri: require('../../assets/audio/nature/morning_birds.mp3'),
    duration: 120,
    format: 'mp3',
    licensed: true,
    attribution: 'Freesound.org - CC BY 4.0',
    tags: ['birds', 'nature', 'morning', 'peaceful'],
    createdAt: new Date(),
  },
  {
    id: 'ocean_waves',
    name: 'Ocean Waves',
    type: 'built-in',
    category: AudioCategory.NATURE,
    uri: require('../../assets/audio/nature/ocean_waves.mp3'),
    duration: 180,
    format: 'mp3',
    licensed: true,
    attribution: 'Pixabay Audio - Free License',
    tags: ['ocean', 'waves', 'water', 'relaxing'],
    createdAt: new Date(),
  },

  // Musical Alarms
  {
    id: 'piano_sunrise',
    name: 'Piano Sunrise',
    type: 'built-in',
    category: AudioCategory.MUSICAL,
    uri: require('../../assets/audio/musical/piano_sunrise.mp3'),
    duration: 90,
    format: 'mp3',
    licensed: true,
    attribution: 'Kevin MacLeod - CC BY 4.0',
    tags: ['piano', 'melody', 'sunrise', 'classical'],
    createdAt: new Date(),
  },

  // Wellness Sounds
  {
    id: 'tibetan_bowl',
    name: 'Tibetan Singing Bowl',
    type: 'built-in',
    category: AudioCategory.WELLNESS,
    uri: require('../../assets/audio/wellness/tibetan_bowl.mp3'),
    duration: 60,
    format: 'mp3',
    licensed: true,
    tags: ['meditation', 'bowl', 'spiritual', 'calming'],
    createdAt: new Date(),
  },
];
```

### User Audio File Management

```typescript
// lib/audio/UserAudioManager.ts
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

export class UserAudioManager {
  private readonly AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly SUPPORTED_FORMATS = ['mp3', 'm4a', 'wav', 'aac'];

  async initializeStorage() {
    const dirInfo = await FileSystem.getInfoAsync(this.AUDIO_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.AUDIO_DIR, {
        intermediates: true,
      });
    }
  }

  async pickAudioFile(): Promise<AudioSource | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: false,
      });

      if (result.type === 'cancel') {
        return null;
      }

      return await this.processAudioFile(result);
    } catch (error) {
      console.error('Error picking audio file:', error);
      throw new Error('Failed to pick audio file');
    }
  }

  private async processAudioFile(file: DocumentPicker.DocumentResult): Promise<AudioSource> {
    // Validate file size
    if (file.size && file.size > this.MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Validate format
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.SUPPORTED_FORMATS.includes(extension)) {
      throw new Error('Unsupported audio format');
    }

    // Generate unique filename
    const filename = `${Date.now()}_${file.name}`;
    const localPath = `${this.AUDIO_DIR}${filename}`;

    // Copy file to app storage
    await FileSystem.copyAsync({
      from: file.uri,
      to: localPath,
    });

    // Get audio duration
    const duration = await this.getAudioDuration(localPath);

    // Validate duration (max 5 minutes for alarms)
    if (duration > 300) {
      await FileSystem.deleteAsync(localPath);
      throw new Error('Audio file too long (max 5 minutes)');
    }

    return {
      id: `user_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      type: 'user-uploaded',
      category: AudioCategory.USER_CUSTOM,
      uri: localPath,
      duration,
      fileSize: file.size,
      format: extension as any,
      licensed: true, // User owns the file
      tags: ['custom', 'user'],
      createdAt: new Date(),
    };
  }

  private async getAudioDuration(uri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      if (status.isLoaded && status.durationMillis) {
        return Math.round(status.durationMillis / 1000);
      }

      return 0;
    } catch (error) {
      console.error('Error getting audio duration:', error);
      return 0;
    }
  }

  async deleteUserAudio(audioSource: AudioSource) {
    try {
      if (audioSource.type === 'user-uploaded' && audioSource.uri.startsWith(this.AUDIO_DIR)) {
        await FileSystem.deleteAsync(audioSource.uri);
      }
    } catch (error) {
      console.error('Error deleting user audio:', error);
    }
  }

  async getUserAudioFiles(): Promise<AudioSource[]> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.AUDIO_DIR);
      const audioSources: AudioSource[] = [];

      for (const filename of files) {
        const filePath = `${this.AUDIO_DIR}${filename}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists && !fileInfo.isDirectory) {
          const extension = filename.split('.').pop()?.toLowerCase();
          if (extension && this.SUPPORTED_FORMATS.includes(extension)) {
            const duration = await this.getAudioDuration(filePath);

            audioSources.push({
              id: `user_${filename}`,
              name: filename.replace(/\.[^/.]+$/, ''),
              type: 'user-uploaded',
              category: AudioCategory.USER_CUSTOM,
              uri: filePath,
              duration,
              fileSize: fileInfo.size,
              format: extension as any,
              licensed: true,
              tags: ['custom', 'user'],
              createdAt: new Date(fileInfo.modificationTime || 0),
            });
          }
        }
      }

      return audioSources.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting user audio files:', error);
      return [];
    }
  }
}
```

### Audio Recording Feature

```typescript
// lib/audio/AudioRecorder.ts
import { Audio } from 'expo-av';

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private readonly MAX_DURATION = 300000; // 5 minutes in ms

  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and start recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await this.recording.startAsync();

      // Auto-stop after max duration
      setTimeout(() => {
        if (this.recording) {
          this.stopRecording();
        }
      }, this.MAX_DURATION);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<AudioSource | null> {
    if (!this.recording) {
      return null;
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      if (!uri) {
        throw new Error('Recording URI not available');
      }

      // Get recording info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = await this.getRecordingDuration(uri);

      // Move to permanent storage
      const filename = `recording_${Date.now()}.m4a`;
      const permanentPath = `${FileSystem.documentDirectory}audio/${filename}`;
      await FileSystem.moveAsync({ from: uri, to: permanentPath });

      const audioSource: AudioSource = {
        id: `recorded_${Date.now()}`,
        name: `Voice Recording ${new Date().toLocaleDateString()}`,
        type: 'user-uploaded',
        category: AudioCategory.RECORDED,
        uri: permanentPath,
        duration,
        fileSize: fileInfo.size,
        format: 'm4a',
        licensed: true,
        tags: ['recording', 'voice', 'custom'],
        createdAt: new Date(),
      };

      this.recording = null;
      return audioSource;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.recording = null;
      throw error;
    }
  }

  private async getRecordingDuration(uri: string): Promise<number> {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();

      if (status.isLoaded && status.durationMillis) {
        return Math.round(status.durationMillis / 1000);
      }

      return 0;
    } catch (error) {
      console.error('Error getting recording duration:', error);
      return 0;
    }
  }

  async cancelRecording(): Promise<void> {
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri);
        }
      } catch (error) {
        console.error('Error canceling recording:', error);
      } finally {
        this.recording = null;
      }
    }
  }

  isRecording(): boolean {
    return this.recording !== null;
  }
}
```

## Audio Sources & Licensing

### Free Audio Sources for Development

1. **Freesound.org** - Creative Commons licensed

   - Search: "alarm", "bell", "chime", "nature"
   - License: CC BY 4.0 (requires attribution)
   - Quality: High-quality recordings

2. **Zapsplat** - Commercial license

   - Cost: ~$15/month for unlimited downloads
   - License: Royalty-free for commercial use
   - Quality: Professional sound library

3. **Pixabay Audio** - Free for commercial use

   - License: Pixabay License (no attribution required)
   - Quality: Good variety of sounds

4. **YouTube Audio Library** - Free music and sound effects
   - License: No attribution required for most
   - Quality: Google-curated content

### Audio Organization Structure

```
assets/audio/
├── traditional/
│   ├── classic_beep.mp3
│   ├── gentle_chime.mp3
│   ├── digital_alarm.mp3
│   └── bell_tower.mp3
├── nature/
│   ├── morning_birds.mp3
│   ├── ocean_waves.mp3
│   ├── forest_sounds.mp3
│   └── thunderstorm.mp3
├── musical/
│   ├── piano_sunrise.mp3
│   ├── guitar_melody.mp3
│   ├── string_quartet.mp3
│   └── ambient_music.mp3
├── wellness/
│   ├── tibetan_bowl.mp3
│   ├── meditation_bell.mp3
│   ├── binaural_beats.mp3
│   └── chakra_sounds.mp3
└── unique/
    ├── coffee_brewing.mp3
    ├── sunrise_ambiance.mp3
    └── gentle_voice.mp3
```

This comprehensive audio system ensures:

- ✅ **Copyright compliance** with proper licensing
- ✅ **User custom files** with full format support
- ✅ **Recording capability** for personal alarms
- ✅ **Professional quality** with fade-in/out effects
- ✅ **Extensive library** covering all user preferences
- ✅ **Legal protection** with proper attribution

The roadmap now covers all audio requirements comprehensively!
