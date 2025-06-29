import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';

// Settings interfaces
export interface NotificationSettings {
  // Global notification toggle - controls all notifications
  enabled: boolean;

  // Individual notification preferences (only used when global is enabled)
  bedtimeReminder: boolean;
  sleepInsights: boolean;
  weatherAlerts: boolean;

  // Permission state
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  permissionAsked: boolean;
}

export interface SmartHomeSettings {
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
}

export interface HealthSettings {
  healthKitEnabled: boolean;
  googleFitEnabled: boolean;
  sleepGoal: number; // hours
  trackSleepAutomatically: boolean;
}

export interface PremiumSettings {
  isActive: boolean;
  expiresAt?: Date;
  features: string[];
  subscriptionType: 'monthly' | 'yearly' | null;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  timeFormat: '12h' | '24h';
  notifications: NotificationSettings;
  smartHome: SmartHomeSettings;
  health: HealthSettings;
  premium: PremiumSettings;

  // Audio settings
  defaultAlarmVolume: number; // 0-100
  fadeInDuration: number; // seconds
  defaultSnoozeTime: number; // minutes

  // UI settings
  showWeather: boolean;
  showNextAlarm: boolean;
  quickAlarmTimes: number[]; // minutes: [15, 30, 45, 60]

  // Accessibility
  fontSize: 'small' | 'medium' | 'large' | 'extraLarge';
  reducedMotion: boolean;
  highContrast: boolean;

  // Privacy
  crashReporting: boolean;
  analytics: boolean;
  personalizedAds: boolean;
}

// Settings store interface
interface SettingsStore {
  settings: AppSettings;

  // Theme actions
  setTheme: (theme: AppSettings['theme']) => void;
  setTimeFormat: (format: AppSettings['timeFormat']) => void;

  // Notification actions
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  toggleNotifications: () => void;
  setNotificationPermissionStatus: (status: 'granted' | 'denied' | 'undetermined') => void;
  markPermissionAsAsked: () => void;

  // Smart home actions
  updateSmartHomeSettings: (updates: Partial<SmartHomeSettings>) => void;

  // Health actions
  updateHealthSettings: (updates: Partial<HealthSettings>) => void;

  // Premium actions
  updatePremiumSettings: (updates: Partial<PremiumSettings>) => void;

  // Audio actions
  setDefaultAlarmVolume: (volume: number) => void;
  setFadeInDuration: (duration: number) => void;
  setDefaultSnoozeTime: (time: number) => void;

  // UI actions
  toggleWeather: () => void;
  toggleNextAlarm: () => void;
  setQuickAlarmTimes: (times: number[]) => void;

  // Accessibility actions
  setFontSize: (size: AppSettings['fontSize']) => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;

  // Privacy actions
  updatePrivacySettings: (updates: {
    crashReporting?: boolean;
    analytics?: boolean;
    personalizedAds?: boolean;
  }) => void;

  // Utility actions
  resetToDefaults: () => void;
  exportSettings: () => AppSettings;
  importSettings: (settings: Partial<AppSettings>) => void;
}

// Default settings
const defaultSettings: AppSettings = {
  theme: 'auto',
  timeFormat: '12h',

  notifications: {
    enabled: true, // Default to enabled for better UX
    bedtimeReminder: true,
    sleepInsights: true,
    weatherAlerts: false,
    permissionStatus: 'undetermined',
    permissionAsked: false,
  },

  smartHome: {
    enabled: false,
  },

  health: {
    healthKitEnabled: false,
    googleFitEnabled: false,
    sleepGoal: 8,
    trackSleepAutomatically: false,
  },

  premium: {
    isActive: false,
    features: [],
    subscriptionType: null,
  },

  // Audio defaults
  defaultAlarmVolume: 80,
  fadeInDuration: 30,
  defaultSnoozeTime: 9,

  // UI defaults
  showWeather: true,
  showNextAlarm: true,
  quickAlarmTimes: [15, 30, 45, 60],

  // Accessibility defaults
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,

  // Privacy defaults
  crashReporting: true,
  analytics: true,
  personalizedAds: false,
};

// Create the settings store
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      // Theme actions
      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      setTimeFormat: (timeFormat) => {
        set((state) => ({
          settings: { ...state.settings, timeFormat },
        }));
      },

      // Notification actions
      updateNotificationSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...updates },
          },
        }));
      },

      toggleNotifications: () => {
        const currentState = get();
        const wasEnabled = currentState.settings.notifications.enabled;

        set((state) => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              enabled: !state.settings.notifications.enabled,
            },
          },
        }));

        // If notifications were just enabled and permission hasn't been asked, request it
        if (!wasEnabled && !currentState.settings.notifications.permissionAsked) {
          // Import notification manager dynamically to avoid circular dependencies
          import('../lib/notificationManager').then(({ notificationManager }) => {
            notificationManager.requestPermissions();
          });
        }
      },

      setNotificationPermissionStatus: (status) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, permissionStatus: status },
          },
        }));
      },

      markPermissionAsAsked: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, permissionAsked: true },
          },
        }));
      },

      // Smart home actions
      updateSmartHomeSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            smartHome: { ...state.settings.smartHome, ...updates },
          },
        }));
      },

      // Health actions
      updateHealthSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            health: { ...state.settings.health, ...updates },
          },
        }));
      },

      // Premium actions
      updatePremiumSettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            premium: { ...state.settings.premium, ...updates },
          },
        }));
      },

      // Audio actions
      setDefaultAlarmVolume: (defaultAlarmVolume) => {
        set((state) => ({
          settings: { ...state.settings, defaultAlarmVolume },
        }));
      },

      setFadeInDuration: (fadeInDuration) => {
        set((state) => ({
          settings: { ...state.settings, fadeInDuration },
        }));
      },

      setDefaultSnoozeTime: (defaultSnoozeTime) => {
        set((state) => ({
          settings: { ...state.settings, defaultSnoozeTime },
        }));
      },

      // UI actions
      toggleWeather: () => {
        set((state) => ({
          settings: { ...state.settings, showWeather: !state.settings.showWeather },
        }));
      },

      toggleNextAlarm: () => {
        set((state) => ({
          settings: { ...state.settings, showNextAlarm: !state.settings.showNextAlarm },
        }));
      },

      setQuickAlarmTimes: (quickAlarmTimes) => {
        set((state) => ({
          settings: { ...state.settings, quickAlarmTimes },
        }));
      },

      // Accessibility actions
      setFontSize: (fontSize) => {
        set((state) => ({
          settings: { ...state.settings, fontSize },
        }));
      },

      toggleReducedMotion: () => {
        set((state) => ({
          settings: { ...state.settings, reducedMotion: !state.settings.reducedMotion },
        }));
      },

      toggleHighContrast: () => {
        set((state) => ({
          settings: { ...state.settings, highContrast: !state.settings.highContrast },
        }));
      },

      // Privacy actions
      updatePrivacySettings: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            crashReporting: updates.crashReporting ?? state.settings.crashReporting,
            analytics: updates.analytics ?? state.settings.analytics,
            personalizedAds: updates.personalizedAds ?? state.settings.personalizedAds,
          },
        }));
      },

      // Utility actions
      resetToDefaults: () => {
        set({ settings: defaultSettings });
      },

      exportSettings: () => {
        return get().settings;
      },

      importSettings: (settingsUpdate) => {
        set((state) => ({
          settings: { ...state.settings, ...settingsUpdate },
        }));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
