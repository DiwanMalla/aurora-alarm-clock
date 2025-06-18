import { useAlarmStore } from '../stores/alarmStore';
import { useSettingsStore } from '../stores/settingsStore';

// Alarm store hooks
export const useAlarms = () => {
  const alarms = useAlarmStore((state) => state.alarms);
  const addAlarm = useAlarmStore((state) => state.addAlarm);
  const updateAlarm = useAlarmStore((state) => state.updateAlarm);
  const deleteAlarm = useAlarmStore((state) => state.deleteAlarm);
  const toggleAlarm = useAlarmStore((state) => state.toggleAlarm);

  return {
    alarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
  };
};

export const useActiveAlarm = () => {
  const activeAlarm = useAlarmStore((state) => state.activeAlarm);
  const isAlarmRinging = useAlarmStore((state) => state.isAlarmRinging);
  const snoozeCount = useAlarmStore((state) => state.snoozeCount);
  const dismissAlarm = useAlarmStore((state) => state.dismissAlarm);
  const snoozeAlarm = useAlarmStore((state) => state.snoozeAlarm);
  const setActiveAlarm = useAlarmStore((state) => state.setActiveAlarm);
  const setAlarmRinging = useAlarmStore((state) => state.setAlarmRinging);

  return {
    activeAlarm,
    isAlarmRinging,
    snoozeCount,
    dismissAlarm,
    snoozeAlarm,
    setActiveAlarm,
    setAlarmRinging,
  };
};

export const useAlarmUtils = () => {
  const getNextAlarm = useAlarmStore((state) => state.getNextAlarm);
  const getAlarmsForToday = useAlarmStore((state) => state.getAlarmsForToday);

  return {
    getNextAlarm,
    getAlarmsForToday,
  };
};

// Settings store hooks
export const useAppSettings = () => {
  const settings = useSettingsStore((state) => state.settings);
  const resetToDefaults = useSettingsStore((state) => state.resetToDefaults);
  const exportSettings = useSettingsStore((state) => state.exportSettings);
  const importSettings = useSettingsStore((state) => state.importSettings);

  return {
    settings,
    resetToDefaults,
    exportSettings,
    importSettings,
  };
};

export const useTheme = () => {
  const theme = useSettingsStore((state) => state.settings.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return {
    theme,
    setTheme,
  };
};

export const useNotificationSettings = () => {
  const notifications = useSettingsStore((state) => state.settings.notifications);
  const updateNotificationSettings = useSettingsStore((state) => state.updateNotificationSettings);

  return {
    notifications,
    updateNotificationSettings,
  };
};

export const useAudioSettings = () => {
  const defaultAlarmVolume = useSettingsStore((state) => state.settings.defaultAlarmVolume);
  const fadeInDuration = useSettingsStore((state) => state.settings.fadeInDuration);
  const defaultSnoozeTime = useSettingsStore((state) => state.settings.defaultSnoozeTime);
  const setDefaultAlarmVolume = useSettingsStore((state) => state.setDefaultAlarmVolume);
  const setFadeInDuration = useSettingsStore((state) => state.setFadeInDuration);
  const setDefaultSnoozeTime = useSettingsStore((state) => state.setDefaultSnoozeTime);

  return {
    defaultAlarmVolume,
    fadeInDuration,
    defaultSnoozeTime,
    setDefaultAlarmVolume,
    setFadeInDuration,
    setDefaultSnoozeTime,
  };
};

export const useAccessibilitySettings = () => {
  const fontSize = useSettingsStore((state) => state.settings.fontSize);
  const reducedMotion = useSettingsStore((state) => state.settings.reducedMotion);
  const highContrast = useSettingsStore((state) => state.settings.highContrast);
  const setFontSize = useSettingsStore((state) => state.setFontSize);
  const toggleReducedMotion = useSettingsStore((state) => state.toggleReducedMotion);
  const toggleHighContrast = useSettingsStore((state) => state.toggleHighContrast);

  return {
    fontSize,
    reducedMotion,
    highContrast,
    setFontSize,
    toggleReducedMotion,
    toggleHighContrast,
  };
};

export const usePremiumSettings = () => {
  const premium = useSettingsStore((state) => state.settings.premium);

  return {
    premium,
    isPremium: premium.isActive,
  };
};

// Combined hooks for common use cases
export const useAlarmManagement = () => {
  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useAlarms();
  const { getNextAlarm } = useAlarmUtils();
  const { defaultAlarmVolume, fadeInDuration } = useAudioSettings();

  return {
    alarms,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    getNextAlarm,
    defaultAlarmVolume,
    fadeInDuration,
  };
};

export const useAlarmRinging = () => {
  const {
    activeAlarm,
    isAlarmRinging,
    snoozeCount,
    dismissAlarm,
    snoozeAlarm,
    setActiveAlarm,
    setAlarmRinging,
  } = useActiveAlarm();

  return {
    activeAlarm,
    isAlarmRinging,
    snoozeCount,
    dismissAlarm,
    snoozeAlarm,
    setActiveAlarm,
    setAlarmRinging,
  };
};
