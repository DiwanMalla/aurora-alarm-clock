import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAlarms } from '@/hooks/useStores';
import { Typography, Spacing, BorderRadius, Colors } from '@/constants/Design';
import { Alarm } from '@/stores/alarmStore';
import { Ionicons } from '@expo/vector-icons';
import { workingAudioManager, AVAILABLE_SOUNDS, SoundOption } from '@/lib/workingAudioManager';
import { IOSWheelTimePicker } from '@/components/ui';

// Type declaration for console
declare const console: {
  error: (message?: string, ...optionalParams: unknown[]) => void;
};
declare const setTimeout: (callback: () => void, ms: number) => number;
declare const clearTimeout: (timeoutId: number) => void;

// Custom iPhone-style Wheel Picker Component
const WheelPicker = ({
  items,
  selectedIndex,
  onSelectionChange,
  itemHeight = 60,
  visibleItems = 3,
  width = 80, // Made configurable
}: {
  items: string[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
  width?: number; // Added width prop
}) => {
  const { colors } = useTheme();
  const containerHeight = itemHeight * visibleItems;
  const paddingVertical = (containerHeight - itemHeight) / 2;
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Scroll to selected index on mount and when selectedIndex changes
  React.useEffect(() => {
    if (scrollViewRef.current) {
      const scrollToPosition = selectedIndex * itemHeight;
      scrollViewRef.current.scrollTo({
        y: scrollToPosition,
        animated: false, // No animation on initial load
      });
    }
  }, [selectedIndex, itemHeight]);

  const wheelStyles = StyleSheet.create({
    container: {
      height: containerHeight,
      overflow: 'hidden',
      width: width, // Use configurable width
    },
    scrollView: {
      flex: 1,
    },
    item: {
      height: itemHeight,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%', // Full width for better touch area
    },
    itemText: {
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '400',
      opacity: 0.5, // Dimmed for non-selected items
    },
    itemTextSelected: {
      fontSize: 24,
      fontWeight: '600',
      opacity: 1, // Full opacity for selected item
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    selectionIndicator: {
      position: 'absolute',
      top: '33%',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
    },
    selectionIndicatorBottom: {
      position: 'absolute',
      top: '67%',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
    },
  });

  return (
    <View style={wheelStyles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={wheelStyles.scrollView}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        scrollEventThrottle={16} // For smoother updates
        contentContainerStyle={{
          paddingVertical: paddingVertical,
        }}
        onScroll={(event) => {
          // Real-time update for smooth glow effect
          const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
          const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
          if (clampedIndex !== selectedIndex) {
            onSelectionChange(clampedIndex);
          }
        }}
        onMomentumScrollEnd={(event) => {
          // Final update when scrolling stops
          const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
          onSelectionChange(Math.max(0, Math.min(index, items.length - 1)));
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={wheelStyles.item}
            onPress={() => onSelectionChange(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                wheelStyles.itemText,
                index === selectedIndex && wheelStyles.itemTextSelected,
                {
                  color: index === selectedIndex ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selection indicators */}
      <View style={wheelStyles.selectionIndicator} />
      <View style={wheelStyles.selectionIndicatorBottom} />
    </View>
  );
};

const DAYS = [
  { key: 'sunday', label: 'S', fullName: 'Sun' },
  { key: 'monday', label: 'M', fullName: 'Mon' },
  { key: 'tuesday', label: 'T', fullName: 'Tue' },
  { key: 'wednesday', label: 'W', fullName: 'Wed' },
  { key: 'thursday', label: 'T', fullName: 'Thu' },
  { key: 'friday', label: 'F', fullName: 'Fri' },
  { key: 'saturday', label: 'S', fullName: 'Sat' },
] as const;

export default function AlarmCreationScreen() {
  const { colors, isDark } = useTheme();
  const { addAlarm, updateAlarm } = useAlarms();
  const params = useLocalSearchParams();

  // Get editing alarm from router params (if any)
  const editingAlarmString = params.editingAlarm as string;
  const editingAlarm: Alarm | undefined = editingAlarmString
    ? JSON.parse(editingAlarmString)
    : undefined;

  // Get current time for initial values
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // If editing, use alarm's time; otherwise use current time
  let initialHour: number;
  let initialMinute: number;
  let initialAmPm: number;

  if (editingAlarm) {
    const [hourStr, minuteStr] = editingAlarm.time.split(':');
    const hour24 = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    initialHour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    initialMinute = minute;
    initialAmPm = hour24 >= 12 ? 1 : 0; // 0 = AM, 1 = PM
  } else {
    // Convert current time to 12-hour format for initial values
    initialHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
    initialMinute = currentMinute;
    initialAmPm = currentHour >= 12 ? 1 : 0; // 0 = AM, 1 = PM
  }

  // Form state with proper initial values
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedAmPm, setSelectedAmPm] = useState(initialAmPm);

  // Create a date object for the IOSWheelTimePicker
  const [alarmTime, setAlarmTime] = useState(() => {
    const date = new Date();
    const hour24 =
      selectedAmPm === 1 && selectedHour !== 12
        ? selectedHour + 12
        : selectedAmPm === 0 && selectedHour === 12
          ? 0
          : selectedHour;
    date.setHours(hour24, selectedMinute, 0, 0);
    return date;
  });

  const [label, setLabel] = useState(editingAlarm?.label || 'Alarm');
  const [repeat, setRepeat] = useState(
    editingAlarm?.repeat || {
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    }
  );
  const [isDailyEnabled, setIsDailyEnabled] = useState(false);
  const [volume, setVolume] = useState(editingAlarm?.sound?.volume || 80); // Use saved volume or default to 80
  const [vibrationEnabled, setVibrationEnabled] = useState(editingAlarm?.vibration.enabled ?? true);
  const [selectedRingtone, setSelectedRingtone] = useState(
    editingAlarm?.sound || AVAILABLE_SOUNDS[0]
  );
  const [snoozeEnabled, setSnoozeEnabled] = useState(editingAlarm?.snooze.enabled ?? true);
  const [snoozeDuration] = useState(editingAlarm?.snooze.duration || 5); // minutes
  const [fadeInEnabled, setFadeInEnabled] = useState(false);
  const [alarmLabelEnabled, setAlarmLabelEnabled] = useState(true);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [volumePreviewTimeout, setVolumePreviewTimeout] = useState<number | null>(null);

  // Handle sound selection and testing
  const handleSoundSelection = () => {
    setShowSoundPicker(true);
  };

  const handleSoundPick = async (sound: SoundOption) => {
    setSelectedRingtone(sound);
    setShowSoundPicker(false);

    // Play the selected sound for preview at current volume
    try {
      setCurrentlyPlaying(sound.id);
      await workingAudioManager.playAlarm(sound.id, {
        loop: false,
        volume: volume / 100, // Convert to 0-1 range
        duration: 5000,
      });

      // Stop after 5 seconds
      setTimeout(async () => {
        await workingAudioManager.stopAlarm();
        setCurrentlyPlaying(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const stopCurrentSound = async () => {
    try {
      await workingAudioManager.stopAlarm();
      setCurrentlyPlaying(null);
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  };

  // Simple volume preview function
  const playVolumePreview = (volumeLevel: number) => {
    if (volumeLevel > 0) {
      try {
        // Clear any existing timeout
        if (volumePreviewTimeout) {
          clearTimeout(volumePreviewTimeout);
        }

        // Stop any current audio and play at new volume
        workingAudioManager.stopAlarm();
        const soundId = 'id' in selectedRingtone ? selectedRingtone.id : selectedRingtone.name;
        workingAudioManager.playAlarm(soundId, {
          loop: false,
          volume: volumeLevel / 100,
          duration: 5000,
        });

        // Set timeout to stop after 5 seconds
        const timeout = setTimeout(async () => {
          await workingAudioManager.stopAlarm();
          setVolumePreviewTimeout(null);
        }, 5000);

        setVolumePreviewTimeout(timeout);
      } catch (error) {
        console.error('Failed to play volume preview:', error);
      }
    }
  };

  // Handle volume slider touch and drag
  const handleVolumeSliderTouch = (event: { nativeEvent: { locationX: number } }) => {
    const { locationX } = event.nativeEvent;
    const sliderWidth = 180; // Adjusted for better precision
    const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
    const newVolume = Math.round(percentage * 100);
    setVolume(newVolume);
  };

  // Create pan responder for volume slider with smooth dragging
  const volumePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      // Handle initial touch - just set volume, don't play yet
      handleVolumeSliderTouch(evt);
    },
    onPanResponderMove: (evt) => {
      // Handle drag - smooth real-time updates, no audio during drag
      handleVolumeSliderTouch(evt);
    },
    onPanResponderRelease: (evt) => {
      // Play preview when user finishes adjusting
      const { locationX } = evt.nativeEvent;
      const sliderWidth = 180;
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const finalVolume = Math.round(percentage * 100);
      setVolume(finalVolume);
      playVolumePreview(finalVolume);
    },
  });

  // Get appropriate volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) return 'volume-mute-outline';
    if (volume < 30) return 'volume-low-outline';
    if (volume < 70) return 'volume-medium-outline';
    return 'volume-high-outline';
  };

  // Helper function to get sound ID for comparison
  const getSoundId = (sound: SoundOption | typeof selectedRingtone): string => {
    return 'id' in sound ? sound.id : sound.name;
  };
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const amPmOptions = ['AM', 'PM'];

  // Calculate time until alarm
  const getTimeUntilAlarm = () => {
    const now = new Date();
    let hour24 = selectedHour;
    if (selectedAmPm === 1 && selectedHour !== 12) hour24 += 12;
    if (selectedAmPm === 0 && selectedHour === 12) hour24 = 0;

    // Get the final repeat settings (consider isDailyEnabled)
    const finalRepeat = isDailyEnabled
      ? {
          sunday: true,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
        }
      : repeat;

    // Check if any days are selected
    const selectedDays = Object.keys(finalRepeat).filter(
      (day) => finalRepeat[day as keyof typeof finalRepeat]
    );

    // If no days selected, treat as one-time alarm
    if (selectedDays.length === 0) {
      const alarmTime = new Date();
      alarmTime.setHours(hour24, selectedMinute, 0, 0);

      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }

      const diff = alarmTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}hr ${mins}min`;
    }

    // Find the next occurrence of the alarm considering repeat days
    let nextAlarmTime = new Date();
    nextAlarmTime.setHours(hour24, selectedMinute, 0, 0);

    // Day mapping for easier lookup
    const dayMapping = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    let foundNextAlarm = false;
    let daysChecked = 0;

    while (!foundNextAlarm && daysChecked < 7) {
      const dayOfWeek = nextAlarmTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayName = dayMapping[dayOfWeek];

      // Check if this day is selected and the time hasn't passed yet (or it's a future day)
      if (finalRepeat[dayName as keyof typeof finalRepeat]) {
        if (nextAlarmTime > now) {
          foundNextAlarm = true;
          break;
        }
      }

      // Move to the next day
      nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
      daysChecked++;
    }

    // If we couldn't find a next alarm within 7 days, something went wrong
    // Default to tomorrow at the same time
    if (!foundNextAlarm) {
      nextAlarmTime = new Date();
      nextAlarmTime.setHours(hour24, selectedMinute, 0, 0);
      nextAlarmTime.setDate(nextAlarmTime.getDate() + 1);
    }

    const diff = nextAlarmTime.getTime() - now.getTime();
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // Format the display to show days if more than 24 hours
    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;

      if (days === 1 && hours === 0) {
        return `1 day`;
      } else if (days === 1) {
        return `1 day ${hours}hr`;
      } else if (hours === 0) {
        return `${days} days`;
      } else {
        return `${days} days ${hours}hr`;
      }
    } else {
      return `${totalHours}hr ${mins}min`;
    }
  };

  // Handle time change from the wheel picker
  const handleAlarmTimeChange = (newTime: Date) => {
    setAlarmTime(newTime);

    // Update the existing state variables for compatibility
    const hours = newTime.getHours();
    const minutes = newTime.getMinutes();

    // Convert to 12-hour format
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const amPm = hours >= 12 ? 1 : 0;

    setSelectedHour(hour12);
    setSelectedMinute(minutes);
    setSelectedAmPm(amPm);
  };

  const handleSave = () => {
    let hour24 = selectedHour;
    if (selectedAmPm === 1 && selectedHour !== 12) hour24 += 12;
    if (selectedAmPm === 0 && selectedHour === 12) hour24 = 0;

    const timeString = `${String(hour24).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;

    const finalRepeat = isDailyEnabled
      ? {
          sunday: true,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
        }
      : repeat;

    const alarmData: Omit<Alarm, 'id'> = {
      label: label.trim(),
      time: timeString,
      enabled: true,
      repeat: finalRepeat,
      sound: {
        type: 'built-in' as const,
        uri:
          'built-in://' + ('id' in selectedRingtone ? selectedRingtone.id : selectedRingtone.name),
        name: selectedRingtone.name,
        volume: volume, // Save as whole number (0-100)
      },
      snooze: {
        enabled: true,
        duration: 5,
        maxCount: 3,
      },
      vibration: {
        enabled: vibrationEnabled,
        pattern: [0, 100, 100, 100],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
      // For one-time alarms, calculate the scheduled date
      scheduledDate: (() => {
        const hasRepeat = Object.values(finalRepeat).some((day) => day);
        if (!hasRepeat) {
          // One-time alarm - calculate the next occurrence of this time
          const now = new Date();
          const alarmTime = new Date();
          alarmTime.setHours(hour24, selectedMinute, 0, 0);

          // If the time has passed today, set for tomorrow
          if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
          }

          return alarmTime;
        }
        return undefined; // Recurring alarms don't need scheduledDate
      })(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (editingAlarm) {
      // Update existing alarm
      updateAlarm(editingAlarm.id, {
        ...alarmData,
        id: editingAlarm.id,
        createdAt: editingAlarm.createdAt,
        updatedAt: new Date(),
      } as Alarm);
    } else {
      // Add new alarm
      addAlarm({
        ...alarmData,
        id: Date.now().toString(),
      } as Alarm);
    }

    router.back();
  };

  const toggleDaily = () => {
    setIsDailyEnabled(!isDailyEnabled);
    if (!isDailyEnabled) {
      // Enable all days
      setRepeat({
        sunday: true,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
      });
    } else {
      // Disable all days when unchecking daily
      setRepeat({
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
      });
    }
  };

  const toggleRepeatDay = (day: keyof typeof repeat) => {
    setRepeat((prev) => {
      const newRepeat = {
        ...prev,
        [day]: !prev[day],
      };

      // Check if all days are selected
      const allDaysSelected = Object.values(newRepeat).every(Boolean);
      setIsDailyEnabled(allDaysSelected);

      return newRepeat;
    });
  };

  // Function to get selected days text
  const getSelectedDaysText = () => {
    if (isDailyEnabled) {
      return 'Every day';
    }

    const selectedDays = DAYS.filter((day) => repeat[day.key]);

    if (selectedDays.length === 0) {
      return 'One-time';
    } else if (selectedDays.length === 7) {
      return 'Every day';
    } else if (
      selectedDays.length === 5 &&
      selectedDays.every((day) =>
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.key)
      )
    ) {
      return 'Weekdays';
    } else if (
      selectedDays.length === 2 &&
      selectedDays.every((day) => ['saturday', 'sunday'].includes(day.key))
    ) {
      return 'Weekends';
    } else {
      return selectedDays.map((day) => day.fullName).join(', ');
    }
  };

  const createStyles = (colors: typeof Colors.light) =>
    StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
      },
      closeButton: {
        padding: Spacing.xs,
      },
      headerSpacer: {
        width: 60, // Same width as close button for balance
      },
      headerTitle: {
        ...Typography.body,
        color: colors.textSecondary,
        textAlign: 'center',
        flex: 1,
      },
      saveButton: {
        backgroundColor: colors.error,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%',
      },
      saveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
        paddingBottom: Spacing.xl,
        backgroundColor: colors.background,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
      },
      saveButtonText: {
        ...Typography.body,
        color: colors.white,
        fontWeight: '600',
      },
      content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
      },
      scrollContent: {
        paddingBottom: 120, // Space for fixed save button
      },
      timePickerSection: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
      },
      timePickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm, // Reduced gap for better spacing
        paddingHorizontal: Spacing.md, // Add horizontal padding
      },
      wheelContainer: {
        width: 80,
        position: 'relative',
      },
      wheelItem: {
        justifyContent: 'center',
        alignItems: 'center',
      },
      wheelItemText: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '400',
      },
      wheelItemTextSelected: {
        fontSize: 24,
        fontWeight: '600',
      },
      selectionIndicator: {
        position: 'absolute',
        top: '33%',
        left: 0,
        right: 0,
        height: 1,
      },
      selectionIndicatorBottom: {
        position: 'absolute',
        top: '67%',
        left: 0,
        right: 0,
        height: 1,
      },
      colonText: {
        ...Typography.largeTitle,
        color: colors.text,
        fontWeight: '300',
        marginHorizontal: Spacing.sm,
      },
      section: {
        marginVertical: Spacing.lg,
      },
      sectionTitle: {
        ...Typography.body,
        color: colors.text,
        fontWeight: '600',
        marginBottom: Spacing.md,
      },
      daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Changed from space-between to space-around for better centering
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.sm, // Add padding for better balance
      },
      dayButton: {
        width: 38, // Slightly smaller
        height: 38, // Slightly smaller
        borderRadius: 19,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      },
      dayButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      },
      dayButtonText: {
        ...Typography.caption1, // Smaller font
        color: colors.text,
        fontWeight: '600', // Slightly bolder for readability
      },
      dayButtonTextActive: {
        color: colors.white,
      },
      dailyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
      },
      dailyLabel: {
        ...Typography.body,
        color: colors.text,
      },
      checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      },
      checkboxActive: {
        backgroundColor: colors.primary,
      },
      repeatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
      },
      dailyCheckboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
      },
      dailyCheckbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      },
      dailyCheckboxActive: {
        backgroundColor: colors.primary,
      },
      dailyDescription: {
        ...Typography.caption1,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.sm,
      },
      controlsSection: {
        marginVertical: Spacing.xl,
      },
      controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
      },
      controlLabel: {
        ...Typography.body,
        color: colors.text,
        flex: 1,
      },
      volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        gap: Spacing.md,
      },
      volumeSlider: {
        flex: 1,
        height: 40, // Even larger touch area for better UX
        borderRadius: 20,
        position: 'relative',
        justifyContent: 'center',
        marginHorizontal: Spacing.xs,
        paddingHorizontal: 10, // Extra padding for better thumb positioning
      },
      volumeTrack: {
        height: 8, // Thicker track for better visibility
        backgroundColor: colors.primary,
        borderRadius: 4,
        position: 'absolute',
        left: 10,
        top: '50%',
        transform: [{ translateY: -4 }],
      },
      volumeText: {
        ...Typography.caption1,
        marginLeft: Spacing.sm,
        minWidth: 35,
        textAlign: 'right',
        fontWeight: '700', // Bolder for better readability
        color: colors.primary, // Use primary color for emphasis
      },
      volumeTrackBackground: {
        position: 'absolute',
        top: '50%',
        left: 10,
        right: 10,
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        transform: [{ translateY: -4 }],
        opacity: 0.3, // Subtle background track
      },
      volumeThumb: {
        position: 'absolute',
        top: '50%',
        width: 24, // Even larger thumb for premium feel
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
        transform: [{ translateY: -12 }],
        borderWidth: 3,
        borderColor: colors.white,
      },
      toggleButton: {
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        padding: 2,
      },
      toggleButtonActive: {
        backgroundColor: colors.primary,
      },
      toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.white,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      toggleThumbActive: {
        alignSelf: 'flex-end',
      },
      ringtoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      labelInputContainer: {
        borderWidth: 1,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
      },
      labelInput: {
        ...Typography.body,
        paddingVertical: Spacing.sm,
        minHeight: 44,
      },
      // Modal styles
      modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.light.text + '80', // 50% opacity black
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      },
      soundPickerModal: {
        width: '90%',
        maxHeight: '70%',
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
      },
      modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      },
      modalTitle: {
        ...Typography.title3,
        fontWeight: 'bold',
      },
      soundList: {
        maxHeight: 400,
      },
      soundItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 0.5,
      },
      soundInfo: {
        flex: 1,
      },
      soundName: {
        ...Typography.body,
        fontWeight: '500',
      },
      soundDescription: {
        ...Typography.caption1,
        marginTop: Spacing.xs,
      },
      soundActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
      },
      playButton: {
        padding: Spacing.xs,
      },
    });

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {editingAlarm ? `Ring in ${getTimeUntilAlarm()}` : `Ring in ${getTimeUntilAlarm()}`}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Picker */}
        <View style={styles.timePickerSection}>
          <IOSWheelTimePicker
            value={alarmTime}
            onChange={handleAlarmTimeChange}
            testID="alarm-time-picker"
          />
        </View>

        {/* Repeat Days */}
        <View style={styles.section}>
          <View style={styles.repeatHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.sectionTitle} numberOfLines={2} ellipsizeMode="tail">
                {getSelectedDaysText()}
              </Text>
            </View>
            <TouchableOpacity style={styles.dailyCheckboxContainer} onPress={toggleDaily}>
              <Text style={styles.dailyLabel}>Daily</Text>
              <View style={[styles.dailyCheckbox, isDailyEnabled && styles.dailyCheckboxActive]}>
                {isDailyEnabled && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.daysContainer}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayButton, repeat[day.key] && styles.dayButtonActive]}
                onPress={() => toggleRepeatDay(day.key)}
              >
                <Text style={[styles.dayButtonText, repeat[day.key] && styles.dayButtonTextActive]}>
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Show description when daily is enabled or show selected days */}
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          {/* Label Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Label</Text>
            <View
              style={[
                styles.labelInputContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.labelInput, { color: colors.text }]}
                value={label}
                onChangeText={setLabel}
                placeholder="Alarm name..."
                placeholderTextColor={colors.textSecondary}
                maxLength={50}
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>
          </View>
          {/* Volume */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Volume</Text>
            <View style={styles.volumeContainer}>
              {/* Volume icon on the left */}
              <TouchableOpacity
                onPress={() => {
                  if (volume === 0) {
                    setVolume(50);
                    playVolumePreview(50);
                  } else {
                    setVolume(0);
                    if (volumePreviewTimeout) {
                      clearTimeout(volumePreviewTimeout);
                      workingAudioManager.stopAlarm();
                    }
                  }
                }}
              >
                <Ionicons
                  name={getVolumeIcon()}
                  size={24}
                  color={volume === 0 ? colors.textSecondary : colors.primary}
                />
              </TouchableOpacity>

              {/* Draggable volume slider */}
              <View style={styles.volumeSlider} {...volumePanResponder.panHandlers}>
                <View style={styles.volumeTrackBackground} />
                <View
                  style={[
                    styles.volumeTrack,
                    {
                      width: `${Math.max(0, Math.min(100, volume))}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.volumeThumb,
                    {
                      left: `${Math.max(0, Math.min(100, volume))}%`,
                      backgroundColor: colors.primary,
                      transform: [{ translateX: -12 }, { translateY: -12 }], // Center the larger thumb perfectly
                    },
                  ]}
                />
              </View>

              {/* Volume percentage with icon color */}
              <Text style={[styles.volumeText, { color: colors.primary }]}>{volume}%</Text>
            </View>
          </View>

          {/* Vibration */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Vibration</Text>
            <TouchableOpacity
              style={[styles.toggleButton, vibrationEnabled && styles.toggleButtonActive]}
              onPress={() => setVibrationEnabled(!vibrationEnabled)}
            >
              <View style={[styles.toggleThumb, vibrationEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {/* Ringtone */}
          <TouchableOpacity style={styles.controlRow} onPress={handleSoundSelection}>
            <Text style={styles.controlLabel}>Ringtone</Text>
            <View style={styles.ringtoneRow}>
              <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
                {selectedRingtone.name}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Snooze */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Snooze</Text>
            <TouchableOpacity
              style={[styles.toggleButton, snoozeEnabled && styles.toggleButtonActive]}
              onPress={() => setSnoozeEnabled(!snoozeEnabled)}
            >
              <View style={[styles.toggleThumb, snoozeEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {/* Snooze Duration */}
          {snoozeEnabled && (
            <TouchableOpacity style={styles.controlRow}>
              <Text style={styles.controlLabel}>Snooze Duration</Text>
              <View style={styles.ringtoneRow}>
                <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
                  {snoozeDuration} minutes
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}

          {/* Fade In */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Fade In</Text>
            <TouchableOpacity
              style={[styles.toggleButton, fadeInEnabled && styles.toggleButtonActive]}
              onPress={() => setFadeInEnabled(!fadeInEnabled)}
            >
              <View style={[styles.toggleThumb, fadeInEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

          {/* Show Label */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Show Label</Text>
            <TouchableOpacity
              style={[styles.toggleButton, alarmLabelEnabled && styles.toggleButtonActive]}
              onPress={() => setAlarmLabelEnabled(!alarmLabelEnabled)}
            >
              <View style={[styles.toggleThumb, alarmLabelEnabled && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sound Picker Modal */}
      {showSoundPicker && (
        <View style={styles.modalOverlay}>
          <View style={[styles.soundPickerModal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Ringtone</Text>
              <TouchableOpacity onPress={() => setShowSoundPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.soundList} showsVerticalScrollIndicator={false}>
              {AVAILABLE_SOUNDS.map((sound) => (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundItem,
                    { borderBottomColor: colors.border },
                    getSoundId(selectedRingtone) === sound.id && {
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() => handleSoundPick(sound)}
                >
                  <View style={styles.soundInfo}>
                    <Text style={[styles.soundName, { color: colors.text }]}>{sound.name}</Text>
                    {sound.description && (
                      <Text style={[styles.soundDescription, { color: colors.textSecondary }]}>
                        {sound.description}
                      </Text>
                    )}
                  </View>

                  <View style={styles.soundActions}>
                    {currentlyPlaying === sound.id ? (
                      <TouchableOpacity onPress={stopCurrentSound} style={styles.playButton}>
                        <Ionicons name="stop" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleSoundPick(sound)}
                        style={styles.playButton}
                      >
                        <Ionicons name="play" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    )}

                    {getSoundId(selectedRingtone) === sound.id && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Fixed Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{editingAlarm ? 'Update Alarm' : 'Save Alarm'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
