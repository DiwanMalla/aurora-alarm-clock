import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Alarm interface
export interface Alarm {
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

// Alarm store interface
interface AlarmStore {
  alarms: Alarm[];
  activeAlarm: Alarm | null;
  isAlarmRinging: boolean;
  snoozeCount: number;

  // Actions
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  setActiveAlarm: (alarm: Alarm | null) => void;
  setAlarmRinging: (isRinging: boolean) => void;
  snoozeAlarm: () => void;
  dismissAlarm: () => void;
  getNextAlarm: () => Alarm | null;
  getAlarmsForToday: () => Alarm[];
  getAlarmById: (id: string) => Alarm | null;
}

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create default alarm
const createDefaultAlarm = (alarmData: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>): Alarm => {
  return {
    ...alarmData,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Get next alarm based on current time and schedule
const getNextAlarmTime = (alarm: Alarm): Date | null => {
  if (!alarm.enabled) return null;

  const now = new Date();
  const [hours, minutes] = alarm.time.split(':').map(Number);

  // Check if it's a one-time alarm
  const hasRepeat = Object.values(alarm.repeat).some((day) => day);

  if (!hasRepeat) {
    // One-time alarm
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, set for tomorrow
    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    return alarmTime;
  }

  // Recurring alarm - find next occurrence
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = now.getDay();

  for (let i = 0; i < 7; i++) {
    const checkDay = (currentDay + i) % 7;
    const dayName = daysOfWeek[checkDay] as keyof typeof alarm.repeat;

    if (alarm.repeat[dayName]) {
      const alarmTime = new Date();
      alarmTime.setDate(alarmTime.getDate() + i);
      alarmTime.setHours(hours, minutes, 0, 0);

      // If it's today, make sure the time hasn't passed
      if (i === 0 && alarmTime <= now) {
        continue;
      }

      return alarmTime;
    }
  }

  return null;
};

// Create the alarm store
export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],
      activeAlarm: null,
      isAlarmRinging: false,
      snoozeCount: 0,

      addAlarm: (alarmData) => {
        const alarm = createDefaultAlarm(alarmData);
        set((state) => ({
          alarms: [...state.alarms, alarm].sort((a, b) => a.time.localeCompare(b.time)),
        }));
      },

      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, ...updates, updatedAt: new Date() } : alarm
          ),
        }));
      },

      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
          activeAlarm: state.activeAlarm?.id === id ? null : state.activeAlarm,
        }));
      },

      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled, updatedAt: new Date() } : alarm
          ),
        }));
      },

      setActiveAlarm: (alarm) => {
        set({ activeAlarm: alarm });
      },

      setAlarmRinging: (isRinging) => {
        set({ isAlarmRinging: isRinging });
        if (!isRinging) {
          set({ snoozeCount: 0 });
        }
      },

      snoozeAlarm: () => {
        const { activeAlarm, snoozeCount } = get();
        if (activeAlarm && activeAlarm.snooze.enabled) {
          if (snoozeCount < activeAlarm.snooze.maxCount) {
            set({
              isAlarmRinging: false,
              snoozeCount: snoozeCount + 1,
            });
            // TODO: Schedule snooze notification
          } else {
            // Max snooze count reached, dismiss alarm
            set({
              isAlarmRinging: false,
              activeAlarm: null,
              snoozeCount: 0,
            });
          }
        }
      },

      dismissAlarm: () => {
        set({
          isAlarmRinging: false,
          activeAlarm: null,
          snoozeCount: 0,
        });
      },

      getNextAlarm: () => {
        const { alarms } = get();
        const enabledAlarms = alarms.filter((alarm) => alarm.enabled);

        if (enabledAlarms.length === 0) return null;

        // Find the alarm with the earliest next occurrence
        let nextAlarm: Alarm | null = null;
        let nextTime: Date | null = null;

        for (const alarm of enabledAlarms) {
          const alarmTime = getNextAlarmTime(alarm);
          if (alarmTime && (!nextTime || alarmTime < nextTime)) {
            nextAlarm = alarm;
            nextTime = alarmTime;
          }
        }

        return nextAlarm;
      },

      getAlarmsForToday: () => {
        const { alarms } = get();
        const today = new Date();
        const dayName = [
          'sunday',
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
        ][today.getDay()] as keyof Alarm['repeat'];

        return alarms.filter(
          (alarm) =>
            alarm.enabled &&
            (alarm.repeat[dayName] || !Object.values(alarm.repeat).some((day) => day))
        );
      },

      getAlarmById: (id) => {
        const { alarms } = get();
        return alarms.find((alarm) => alarm.id === id) || null;
      },
    }),
    {
      name: 'alarm-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the alarms array, not the runtime state
      partialize: (state) => ({ alarms: state.alarms }),
    }
  )
);
