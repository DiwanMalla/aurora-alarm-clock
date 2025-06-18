# Aurora Clock - Immediate Development Tasks

## Current Status: Week 1 - Foundation Setup ✅

### Completed Tasks ✅

- [x] Initialize React Native project with Expo
- [x] Set up TypeScript configuration
- [x] Create project structure and folders
- [x] Set up development environment
- [x] Create basic utility functions and hooks
- [x] Set up basic UI components (AnimatedButton, Card, LoadingSpinner)
- [x] Configure navigation with Expo Router
- [x] Create comprehensive project documentation

## Week 1 Remaining Tasks (This Week)

### High Priority 🔥

1. **Design System & Theme Setup** ✅

   - [x] Create comprehensive color palette
   - [x] Define typography scale
   - [x] Set up spacing and sizing constants
   - [x] Create theme provider with dark/light modes
   - [x] Define component variants and sizes

2. **State Management Setup** ✅

   - [x] Install and configure Zustand
   - [x] Create alarm store structure
   - [x] Create settings store
   - [x] Set up data persistence with AsyncStorage
   - [x] Create store hooks for components

3. **Core UI Components** ✅
   - [x] TimePicker component for alarm creation
   - [x] AlarmCard component for alarm display
   - [x] Switch/Toggle components
   - [x] Modal components
   - [x] Input components (TextInput, Label)

### Medium Priority 📋

4. **Testing Framework** ✅

   - [x] Configure Jest for React Native
   - [x] Set up React Native Testing Library
   - [x] Create basic test utilities
   - [x] Write tests for utility functions
   - [x] Set up test coverage reporting

5. **Project Configuration** ✅
   - [x] Set up ESLint and Prettier
   - [x] Configure pre-commit hooks (ready for setup)
   - [x] Set up TypeScript strict mode
   - [ ] Configure import paths with aliases
   - [ ] Set up environment variables

### Low Priority 📝

6. **Documentation**
   - [ ] Create component documentation
   - [ ] Set up Storybook (optional)
   - [ ] Create development guidelines
   - [ ] Document coding standards
   - [ ] Create troubleshooting guide

## Week 2 Planned Tasks (Next Week)

### Clock Display & Navigation

1. **Main Clock Screen**

   - [ ] Large time display component
   - [ ] Date display with formatting
   - [ ] Next alarm indicator
   - [ ] Quick alarm buttons (15, 30, 45, 60 min)
   - [ ] Weather widget placeholder

2. **Navigation Structure**

   - [ ] Enhance tab navigation styling
   - [ ] Add smooth tab transitions
   - [ ] Create stack navigation for alarm details
   - [ ] Add modal navigation for settings
   - [ ] Implement gesture-based navigation

3. **Alarm List Interface**
   - [ ] Alarm list view with cards
   - [ ] Swipe-to-delete functionality
   - [ ] Reorder alarms capability
   - [ ] Empty state design
   - [ ] Pull-to-refresh functionality

## Specific Implementation Tasks

### Task 1: Design System Setup

```typescript
// File: constants/Design.ts
export const Colors = {
  light: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
  },
};

export const Typography = {
  largeTitle: { fontSize: 34, fontWeight: '700' },
  title1: { fontSize: 28, fontWeight: '700' },
  title2: { fontSize: 22, fontWeight: '700' },
  title3: { fontSize: 20, fontWeight: '600' },
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  callout: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 15, fontWeight: '400' },
  footnote: { fontSize: 13, fontWeight: '400' },
  caption1: { fontSize: 12, fontWeight: '400' },
  caption2: { fontSize: 11, fontWeight: '400' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Task 2: Zustand Store Setup

```typescript
// File: stores/alarmStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  sound: string;
  snooze: {
    enabled: boolean;
    duration: number;
  };
  createdAt: Date;
}

interface AlarmStore {
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, 'id' | 'createdAt'>) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],
      addAlarm: (alarmData) => {
        const alarm: Alarm = {
          ...alarmData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({ alarms: [...state.alarms, alarm] }));
      },
      updateAlarm: (id, updates) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) => (alarm.id === id ? { ...alarm, ...updates } : alarm)),
        }));
      },
      deleteAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.filter((alarm) => alarm.id !== id),
        }));
      },
      toggleAlarm: (id) => {
        set((state) => ({
          alarms: state.alarms.map((alarm) =>
            alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
          ),
        }));
      },
    }),
    {
      name: 'alarm-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
```

### Task 3: TimePicker Component

```typescript
// File: components/TimePicker.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  is24Hour?: boolean;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  is24Hour = false,
}) => {
  const [hour, minute] = value.split(":").map(Number);

  const hours = is24Hour
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourChange = (newHour: number) => {
    const formattedHour = newHour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    onChange(`${formattedHour}:${formattedMinute}`);
  };

  const handleMinuteChange = (newMinute: number) => {
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = newMinute.toString().padStart(2, "0");
    onChange(`${formattedHour}:${formattedMinute}`);
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={hour}
        onValueChange={handleHourChange}
        style={styles.picker}
      >
        {hours.map((h) => (
          <Picker.Item
            key={h}
            label={h.toString().padStart(2, "0")}
            value={h}
          />
        ))}
      </Picker>

      <Text style={styles.separator}>:</Text>

      <Picker
        selectedValue={minute}
        onValueChange={handleMinuteChange}
        style={styles.picker}
      >
        {minutes.map((m) => (
          <Picker.Item
            key={m}
            label={m.toString().padStart(2, "0")}
            value={m}
          />
        ))}
      </Picker>

      {!is24Hour && (
        <Picker
          selectedValue={hour >= 12 ? "PM" : "AM"}
          onValueChange={(period) => {
            const newHour = period === "PM" ? hour + 12 : hour - 12;
            handleHourChange(Math.max(0, Math.min(23, newHour)));
          }}
          style={styles.picker}
        >
          <Picker.Item label="AM" value="AM" />
          <Picker.Item label="PM" value="PM" />
        </Picker>
      )}
    </View>
  );
};
```

## Development Guidelines

### Code Organization

1. **File Naming**: Use PascalCase for components, camelCase for utilities
2. **Folder Structure**: Group by feature, not by file type
3. **Import Order**: External libraries, internal modules, relative imports
4. **Component Structure**: Props interface, component, styles, export

### Performance Best Practices

1. **Use React.memo**: For expensive components
2. **Optimize re-renders**: Use useCallback and useMemo appropriately
3. **Lazy loading**: Implement for non-critical screens
4. **Image optimization**: Use appropriate formats and sizes
5. **Bundle analysis**: Regular bundle size monitoring

### Accessibility Standards

1. **Screen readers**: Proper accessibility labels
2. **Touch targets**: Minimum 44px touch areas
3. **Color contrast**: WCAG AA compliance
4. **Keyboard navigation**: Support for external keyboards
5. **Voice control**: VoiceOver and TalkBack support

## Quality Assurance Checklist

### Before Each Commit

- [ ] Code compiles without errors
- [ ] All tests pass
- [ ] ESLint/Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] TypeScript strict mode compliance

### Before Each Release

- [ ] Manual testing on iOS and Android
- [ ] Performance profiling completed
- [ ] Memory leak testing
- [ ] Battery usage testing
- [ ] Accessibility testing completed

## Tools and Dependencies to Install

### Development Dependencies

```bash
# State Management
npm install zustand

# Date/Time Utilities
npm install date-fns

# Testing
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Code Quality
npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin

# Picker Component
npm install @react-native-picker/picker

# Icons (additional)
npm install react-native-vector-icons
```

### Production Dependencies for Later Phases

```bash
# Audio Management
npm install expo-av react-native-sound

# Notifications
npm install expo-notifications

# Background Tasks
npm install expo-task-manager expo-background-fetch

# Sensors
npm install expo-sensors

# HTTP Requests
npm install axios
```

## Next Meeting Agenda

### Discussion Points

1. Design system color palette approval
2. User flow walkthrough for alarm creation
3. Testing strategy and coverage goals
4. Performance benchmarks and targets
5. Timeline adjustments based on progress

### Decisions Needed

1. Should we use native time picker or custom component?
2. Which notification strategy for reliability?
3. Premium features pricing strategy
4. Beta testing group size and criteria

### Action Items

1. Complete design system implementation
2. Set up Zustand stores
3. Create TimePicker component
4. Begin alarm list interface
5. Schedule user testing sessions

---

Ready to start implementing these tasks! Which component would you like me to begin with?
