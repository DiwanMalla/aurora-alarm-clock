import { useAlarmStore } from '../alarmStore';
import { act, renderHook } from '@testing-library/react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('AlarmStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAlarmStore.getState().alarms = [];
    useAlarmStore.getState().activeAlarm = null;
    useAlarmStore.getState().isAlarmRinging = false;
    useAlarmStore.getState().snoozeCount = 0;
  });

  it('should add a new alarm', () => {
    const { result } = renderHook(() => useAlarmStore());

    const newAlarm = {
      label: 'Morning Alarm',
      time: '07:30',
      enabled: true,
      repeat: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
    };

    act(() => {
      result.current.addAlarm(newAlarm);
    });

    expect(result.current.alarms).toHaveLength(1);
    expect(result.current.alarms[0].label).toBe('Morning Alarm');
    expect(result.current.alarms[0].time).toBe('07:30');
    expect(result.current.alarms[0]).toHaveProperty('id');
    expect(result.current.alarms[0]).toHaveProperty('createdAt');
    expect(result.current.alarms[0]).toHaveProperty('updatedAt');
  });

  it('should toggle alarm enabled state', () => {
    const { result } = renderHook(() => useAlarmStore());

    // First add an alarm
    const newAlarm = {
      label: 'Test Alarm',
      time: '08:00',
      enabled: true,
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
    };

    act(() => {
      result.current.addAlarm(newAlarm);
    });

    const alarmId = result.current.alarms[0].id;

    // Toggle the alarm
    act(() => {
      result.current.toggleAlarm(alarmId);
    });

    expect(result.current.alarms[0].enabled).toBe(false);

    // Toggle again
    act(() => {
      result.current.toggleAlarm(alarmId);
    });

    expect(result.current.alarms[0].enabled).toBe(true);
  });

  it('should delete an alarm', () => {
    const { result } = renderHook(() => useAlarmStore());

    // Add two alarms
    const alarm1 = {
      label: 'Alarm 1',
      time: '07:00',
      enabled: true,
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
    };

    const alarm2 = {
      ...alarm1,
      label: 'Alarm 2',
      time: '08:00',
    };

    act(() => {
      result.current.addAlarm(alarm1);
      result.current.addAlarm(alarm2);
    });

    expect(result.current.alarms).toHaveLength(2);

    const alarmId = result.current.alarms[0].id;

    act(() => {
      result.current.deleteAlarm(alarmId);
    });

    expect(result.current.alarms).toHaveLength(1);
    expect(result.current.alarms[0].label).toBe('Alarm 2');
  });

  it('should update an alarm', () => {
    const { result } = renderHook(() => useAlarmStore());

    const newAlarm = {
      label: 'Original Alarm',
      time: '07:00',
      enabled: true,
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
    };

    act(() => {
      result.current.addAlarm(newAlarm);
    });

    const alarmId = result.current.alarms[0].id;

    act(() => {
      result.current.updateAlarm(alarmId, {
        label: 'Updated Alarm',
        time: '08:30',
      });
    });

    expect(result.current.alarms[0].label).toBe('Updated Alarm');
    expect(result.current.alarms[0].time).toBe('08:30');
  });

  it('should handle snooze alarm', () => {
    const { result } = renderHook(() => useAlarmStore());

    // Set up an active alarm
    const alarm = {
      id: 'test-id',
      label: 'Test Alarm',
      time: '07:00',
      enabled: true,
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setActiveAlarm(alarm);
      result.current.setAlarmRinging(true);
    });

    act(() => {
      result.current.snoozeAlarm();
    });

    expect(result.current.snoozeCount).toBe(1);
    expect(result.current.isAlarmRinging).toBe(false);
  });

  it('should dismiss alarm', () => {
    const { result } = renderHook(() => useAlarmStore());

    const alarm = {
      id: 'test-id',
      label: 'Test Alarm',
      time: '07:00',
      enabled: true,
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setActiveAlarm(alarm);
      result.current.setAlarmRinging(true);
    });

    act(() => {
      result.current.dismissAlarm();
    });

    expect(result.current.activeAlarm).toBeNull();
    expect(result.current.isAlarmRinging).toBe(false);
    expect(result.current.snoozeCount).toBe(0);
  });
});
