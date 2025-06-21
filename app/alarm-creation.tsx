import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useAlarms } from '@/hooks/useStores';
import { Typography, Spacing, BorderRadius, Colors } from '@/constants/Design';
import { Alarm } from '@/stores/alarmStore';
import { Ionicons } from '@expo/vector-icons';
import { audioManager, AVAILABLE_SOUNDS } from '@/lib/simpleAudioManager';

// Type declaration for console
declare const console: {
  error: (message?: string, ...optionalParams: unknown[]) => void;
};

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
  const { addAlarm } = useAlarms();

  // Get editing alarm from router params (if any)
  // const editingAlarm = router.params?.editingAlarm as Alarm | undefined;

  // Form state
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedAmPm, setSelectedAmPm] = useState(0); // 0 = AM, 1 = PM
  const [label] = useState('Alarm');
  const [repeat, setRepeat] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [isDailyEnabled, setIsDailyEnabled] = useState(false);
  const [volume] = useState(0.8);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedRingtone, setSelectedRingtone] = useState(AVAILABLE_SOUNDS[0]);
  const [snoozeEnabled, setSnoozeEnabled] = useState(true);
  const [snoozeDuration] = useState(5); // minutes
  const [fadeInEnabled, setFadeInEnabled] = useState(false);
  const [alarmLabelEnabled, setAlarmLabelEnabled] = useState(true);

  // Handle sound selection and testing
  const handleSoundSelection = () => {
    const currentIndex = AVAILABLE_SOUNDS.findIndex((s) => s.id === selectedRingtone.id);

    // For now, cycle through available sounds
    const nextIndex = (currentIndex + 1) % AVAILABLE_SOUNDS.length;
    const nextSound = AVAILABLE_SOUNDS[nextIndex];

    setSelectedRingtone(nextSound);

    // Test the new sound
    audioManager.playTestSound(nextSound.id).catch((error) => {
      console.error('Failed to test sound:', error);
    });
  };
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const amPmOptions = ['AM', 'PM'];

  // Calculate time until alarm
  const getTimeUntilAlarm = () => {
    const now = new Date();
    const alarmTime = new Date();
    let hour24 = selectedHour;
    if (selectedAmPm === 1 && selectedHour !== 12) hour24 += 12;
    if (selectedAmPm === 0 && selectedHour === 12) hour24 = 0;

    alarmTime.setHours(hour24, selectedMinute, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const diff = alarmTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}hr ${mins}min`;
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
        uri: 'built-in://' + selectedRingtone.id,
        name: selectedRingtone.name,
        volume: volume * 100,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addAlarm({
      ...alarmData,
      id: Date.now().toString(),
    } as Alarm);

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
        height: 4,
        backgroundColor: colors.surface,
        borderRadius: 2,
        position: 'relative',
      },
      volumeTrack: {
        height: 4,
        backgroundColor: colors.primary,
        borderRadius: 2,
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
        <Text style={styles.headerTitle}>Ring in {getTimeUntilAlarm()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Time Picker */}
        <View style={styles.timePickerSection}>
          <View style={styles.timePickerContainer}>
            <WheelPicker
              items={hours}
              selectedIndex={selectedHour - 1}
              onSelectionChange={(index) => setSelectedHour(index + 1)}
              width={90} // Slightly wider for hours
            />
            <Text style={styles.colonText}>:</Text>
            <WheelPicker
              items={minutes}
              selectedIndex={selectedMinute}
              onSelectionChange={setSelectedMinute}
              width={90} // Slightly wider for minutes
            />
            <WheelPicker
              items={amPmOptions}
              selectedIndex={selectedAmPm}
              onSelectionChange={setSelectedAmPm}
              width={60} // Narrower for AM/PM
            />
          </View>
        </View>

        {/* Repeat Days */}
        <View style={styles.section}>
          <View style={styles.repeatHeader}>
            <Text style={styles.sectionTitle}>Repeat</Text>
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
          <Text style={styles.dailyDescription}>{getSelectedDaysText()}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsSection}>
          {/* Volume */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Volume</Text>
            <View style={styles.volumeContainer}>
              <Ionicons name="volume-mute" size={20} color={colors.textSecondary} />
              <View style={styles.volumeSlider}>
                <View style={[styles.volumeTrack, { width: `${volume * 100}%` }]} />
              </View>
              <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
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

      {/* Fixed Save Button */}
      <View style={styles.saveButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
