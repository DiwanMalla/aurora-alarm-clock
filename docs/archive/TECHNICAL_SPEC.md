# Aurora Clock - Technical Specification

## Architecture Overview

### App Structure

```
aurora-clock/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   ├── index.tsx      # Home/Clock screen
│   │   ├── alarms.tsx     # Alarms management
│   │   ├── sleep.tsx      # Sleep tracking
│   │   └── settings.tsx   # App settings
│   ├── alarm/             # Alarm screens
│   │   ├── create.tsx     # Create/edit alarm
│   │   └── ringing.tsx    # Active alarm screen
│   └── onboarding/        # First-time user flow
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
├── stores/                # State management
├── types/                 # TypeScript definitions
└── assets/                # Images, sounds, fonts
```

### Core Technologies

#### Primary Stack

- **React Native 0.73+** - Latest stable version
- **Expo SDK 50+** - For rapid development and deployment
- **Expo Router** - File-based routing system
- **TypeScript** - Type safety and better DX
- **React Native Reanimated 3** - 60fps animations

#### State Management

- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **AsyncStorage** - Local data persistence
- **MMKV** - High-performance key-value storage

#### Audio & Media

- **Expo AV** - Audio playback and recording
- **react-native-sound** - Advanced audio control
- **Expo Haptics** - Tactile feedback
- **react-native-video** - Video playback for animations

#### Background Processing

- **Expo TaskManager** - Background task execution
- **Expo Notifications** - Local and push notifications
- **Expo BackgroundFetch** - Periodic data updates
- **Expo KeepAwake** - Prevent screen sleep during alarms

#### External Integrations

- **Firebase** - Authentication, analytics, crashlytics
- **OpenWeatherMap API** - Weather data
- **Spotify Web API** - Music streaming
- **Google Calendar API** - Calendar integration
- **Apple HealthKit / Google Fit** - Health data

## Data Models

### Alarm Model

```typescript
interface Alarm {
  id: string;
  label: string;
  time: string; // HH:mm format
  enabled: boolean;
  repeat: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  sound: {
    type: 'built-in' | 'custom' | 'spotify';
    uri: string;
    name: string;
    volume: number; // 0-100
  };
  snooze: {
    enabled: boolean;
    duration: number; // minutes
    maxCount: number;
  };
  vibration: {
    enabled: boolean;
    pattern: number[];
  };
  smartWakeup: {
    enabled: boolean;
    window: number; // minutes before set time
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Sleep Session Model

```typescript
interface SleepSession {
  id: string;
  userId: string;
  bedtime: Date;
  wakeupTime: Date;
  sleepDuration: number; // minutes
  sleepQuality: number; // 1-10 scale
  movements: Array<{
    timestamp: Date;
    intensity: number;
  }>;
  heartRate?: Array<{
    timestamp: Date;
    bpm: number;
  }>;
  environment: {
    temperature?: number;
    humidity?: number;
    noise?: number;
  };
  notes?: string;
  mood: 'terrible' | 'poor' | 'okay' | 'good' | 'excellent';
}
```

### User Settings Model

```typescript
interface UserSettings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  timeFormat: '12h' | '24h';
  notifications: {
    bedtimeReminder: boolean;
    sleepInsights: boolean;
    weatherAlerts: boolean;
  };
  smartHome: {
    enabled: boolean;
    philipsHue?: {
      bridgeIP: string;
      username: string;
      lightIds: string[];
    };
    googleHome?: {
      accessToken: string;
      deviceIds: string[];
    };
  };
  health: {
    healthKitEnabled: boolean;
    googleFitEnabled: boolean;
    sleepGoal: number; // hours
  };
  premium: {
    isActive: boolean;
    expiresAt?: Date;
    features: string[];
  };
}
```

## Core Features Implementation

### 1. Alarm Management

#### Alarm Creation & Editing

```typescript
// hooks/useAlarmManager.ts
export const useAlarmManager = () => {
  const [alarms, setAlarms] = useAlarmStore();

  const createAlarm = async (alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => {
    const alarm: Alarm = {
      ...alarmData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await scheduleNotification(alarm);
    setAlarms((prev) => [...prev, alarm]);
    return alarm;
  };

  const updateAlarm = async (id: string, updates: Partial<Alarm>) => {
    const updatedAlarm = {
      ...alarms.find((a) => a.id === id),
      ...updates,
      updatedAt: new Date(),
    };
    await cancelNotification(id);
    if (updatedAlarm.enabled) {
      await scheduleNotification(updatedAlarm);
    }
    setAlarms((prev) => prev.map((a) => (a.id === id ? updatedAlarm : a)));
  };

  const deleteAlarm = async (id: string) => {
    await cancelNotification(id);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  return { alarms, createAlarm, updateAlarm, deleteAlarm };
};
```

#### Notification Scheduling

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';

export const scheduleNotification = async (alarm: Alarm) => {
  const trigger = createAlarmTrigger(alarm);

  await Notifications.scheduleNotificationAsync({
    identifier: alarm.id,
    content: {
      title: alarm.label || 'Alarm',
      body: `It's time to wake up!`,
      sound: alarm.sound.uri,
      priority: Notifications.AndroidNotificationPriority.MAX,
      categoryIdentifier: 'alarm',
    },
    trigger,
  });
};

const createAlarmTrigger = (alarm: Alarm) => {
  const [hour, minute] = alarm.time.split(':').map(Number);

  if (isRepeatingAlarm(alarm)) {
    return {
      type: 'calendar' as const,
      repeats: true,
      hour,
      minute,
      weekday: getWeekdaysFromRepeat(alarm.repeat),
    };
  }

  const nextAlarmDate = getNextAlarmDate(hour, minute);
  return {
    type: 'date' as const,
    date: nextAlarmDate,
  };
};
```

### 2. Sleep Tracking

#### Motion Detection

```typescript
// hooks/useSleepTracking.ts
import { Accelerometer } from 'expo-sensors';

export const useSleepTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);

  const startTracking = async () => {
    const { status } = await Accelerometer.requestPermissionsAsync();
    if (status !== 'granted') return;

    setIsTracking(true);

    Accelerometer.setUpdateInterval(1000); // 1 second intervals
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const movement: Movement = {
        timestamp: new Date(),
        intensity: magnitude,
      };

      setMovements((prev) => [...prev, movement]);
    });

    return () => {
      subscription?.remove();
      setIsTracking(false);
    };
  };

  const analyzeSleepQuality = (movements: Movement[]) => {
    // Implement sleep quality algorithm
    const averageMovement = movements.reduce((sum, m) => sum + m.intensity, 0) / movements.length;
    const restlessness = movements.filter((m) => m.intensity > MOVEMENT_THRESHOLD).length;

    return calculateQualityScore(averageMovement, restlessness);
  };

  return { isTracking, movements, startTracking, analyzeSleepQuality };
};
```

### 3. Smart Wake-up

#### Optimal Wake Time Calculation

```typescript
// lib/smartWakeup.ts
export const calculateOptimalWakeTime = (
  targetTime: Date,
  window: number, // minutes
  movements: Movement[]
): Date => {
  const windowStart = new Date(targetTime.getTime() - window * 60000);
  const recentMovements = movements.filter(
    (m) => m.timestamp >= windowStart && m.timestamp <= targetTime
  );

  // Find the period with least movement (deepest sleep)
  const lightSleepPeriods = findLightSleepPeriods(recentMovements);

  if (lightSleepPeriods.length > 0) {
    // Wake during lightest sleep period
    return lightSleepPeriods[0].timestamp;
  }

  // Fallback to original time
  return targetTime;
};

const findLightSleepPeriods = (movements: Movement[]) => {
  return movements
    .filter((m) => m.intensity > LIGHT_SLEEP_THRESHOLD)
    .sort((a, b) => a.intensity - b.intensity)
    .slice(0, 3); // Top 3 lightest sleep moments
};
```

### 4. Audio System

#### Dynamic Audio Management

```typescript
// lib/audioManager.ts
import { Audio } from 'expo-av';

export class AudioManager {
  private sound: Audio.Sound | null = null;
  private fadeInterval: NodeJS.Timeout | null = null;

  async playAlarm(soundUri: string, volume: number = 0.5) {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: soundUri },
        { shouldPlay: true, volume, isLooping: true }
      );

      this.sound = sound;
      await this.gradualVolumeIncrease(volume);
    } catch (error) {
      console.error('Failed to play alarm:', error);
    }
  }

  private async gradualVolumeIncrease(targetVolume: number) {
    let currentVolume = 0.1;
    const step = targetVolume / 30; // 30 steps over 30 seconds

    this.fadeInterval = setInterval(async () => {
      if (currentVolume < targetVolume && this.sound) {
        currentVolume += step;
        await this.sound.setVolumeAsync(Math.min(currentVolume, targetVolume));
      } else {
        this.clearFadeInterval();
      }
    }, 1000);
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

### 5. Smart Home Integration

#### Philips Hue Integration

```typescript
// lib/smartHome/philipsHue.ts
export class PhilipsHueController {
  private bridgeIP: string;
  private username: string;

  constructor(bridgeIP: string, username: string) {
    this.bridgeIP = bridgeIP;
    this.username = username;
  }

  async triggerWakeUpLighting(lightIds: string[]) {
    try {
      // Gradually increase brightness over 5 minutes
      for (const lightId of lightIds) {
        await this.gradualBrightnessIncrease(lightId);
      }
    } catch (error) {
      console.error('Failed to control Hue lights:', error);
    }
  }

  private async gradualBrightnessIncrease(lightId: string) {
    const steps = 30; // 30 steps over 5 minutes
    const interval = 10000; // 10 seconds per step

    for (let i = 0; i <= steps; i++) {
      const brightness = Math.round((i / steps) * 254); // Hue brightness range
      const colorTemp = 153 + Math.round((i / steps) * (500 - 153)); // Warm to cool

      await fetch(`http://${this.bridgeIP}/api/${this.username}/lights/${lightId}/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          on: true,
          bri: brightness,
          ct: colorTemp,
          transitiontime: 100, // 10 seconds transition
        }),
      });

      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}
```

## Performance Optimizations

### 1. Background Processing

```typescript
// lib/backgroundTasks.ts
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_ALARM_TASK = 'background-alarm-task';

TaskManager.defineTask(BACKGROUND_ALARM_TASK, ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }

  // Check for alarms that should trigger
  checkPendingAlarms();
});

export const registerBackgroundTasks = async () => {
  await TaskManager.registerTaskAsync(BACKGROUND_ALARM_TASK);
};
```

### 2. Memory Management

```typescript
// hooks/useMemoryOptimization.ts
export const useMemoryOptimization = () => {
  useEffect(() => {
    const memoryWarningListener = () => {
      // Clear unnecessary caches
      ImageCache.clearCache();
      AudioCache.clearCache();

      // Force garbage collection (if available)
      if (global.gc) {
        global.gc();
      }
    };

    // Listen for memory warnings (iOS)
    const subscription = AppState.addEventListener('memoryWarning', memoryWarningListener);

    return () => subscription?.remove();
  }, []);
};
```

### 3. Battery Optimization

```typescript
// lib/batteryOptimization.ts
export const optimizeBatteryUsage = () => {
  // Reduce sensor polling when battery is low
  if (getBatteryLevel() < 0.2) {
    Accelerometer.setUpdateInterval(5000); // Reduce to 5 seconds
  } else {
    Accelerometer.setUpdateInterval(1000); // Normal 1 second
  }

  // Disable unnecessary background features
  if (getBatteryLevel() < 0.1) {
    disableBackgroundFetch();
    disableSleepTracking();
  }
};
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/alarmManager.test.ts
describe('AlarmManager', () => {
  test('should create alarm with correct properties', () => {
    const alarmData = {
      label: 'Work',
      time: '07:00',
      enabled: true,
      repeat: { monday: true, tuesday: true },
    };

    const alarm = createAlarm(alarmData);
    expect(alarm.id).toBeDefined();
    expect(alarm.time).toBe('07:00');
    expect(alarm.enabled).toBe(true);
  });

  test('should calculate next alarm time correctly', () => {
    const alarm = createTestAlarm('09:00', { monday: true });
    const nextTime = getNextAlarmTime(alarm);
    expect(nextTime.getHours()).toBe(9);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/alarmFlow.test.ts
describe('Alarm Flow Integration', () => {
  test('should complete full alarm cycle', async () => {
    // Create alarm
    const alarm = await createAlarm(testAlarmData);

    // Schedule notification
    await scheduleNotification(alarm);

    // Verify notification was scheduled
    const notifications = await getScheduledNotifications();
    expect(notifications.find((n) => n.identifier === alarm.id)).toBeDefined();

    // Simulate alarm trigger
    await triggerAlarm(alarm.id);

    // Verify alarm is ringing
    expect(getAlarmState()).toBe('ringing');
  });
});
```

## Security & Privacy

### Data Protection

- All sensitive data encrypted using device keychain
- Biometric authentication for app access
- No personal data stored on external servers without consent
- GDPR and CCPA compliant data handling

### Permission Management

```typescript
// lib/permissions.ts
export const requestRequiredPermissions = async () => {
  const permissions = [
    'notifications',
    'location', // For weather
    'calendar', // For smart wake-up
    'health', // For sleep tracking
    'microphone', // For sleep sound analysis
  ];

  for (const permission of permissions) {
    const { status } = await requestPermission(permission);
    if (status !== 'granted') {
      // Handle graceful degradation
      disableFeatureRequiring(permission);
    }
  }
};
```

This technical specification provides the foundation for building a competitive alarm clock app. Would you like me to start implementing any specific component or feature?
