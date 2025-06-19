import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from './ui/TextInput';
import { useTheme } from '@/hooks/useTheme';
import { useAlarms } from '@/hooks/useStores';
import { Typography, Spacing, BorderRadius, Colors } from '@/constants/Design';
import { Alarm } from '@/stores/alarmStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface AlarmCreationModalEnhancedProps {
  visible: boolean;
  onClose: () => void;
  editingAlarm?: Alarm;
}

const DAYS = [
  { key: 'sunday', label: 'S' },
  { key: 'monday', label: 'M' },
  { key: 'tuesday', label: 'T' },
  { key: 'wednesday', label: 'W' },
  { key: 'thursday', label: 'T' },
  { key: 'friday', label: 'F' },
  { key: 'saturday', label: 'S' },
] as const;

// Custom Wheel Picker Component
const WheelPicker = ({
  items,
  selectedIndex,
  onSelectionChange,
  itemHeight = 60,
  visibleItems = 3,
}: {
  items: string[];
  selectedIndex: number;
  onSelectionChange: (index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
}) => {
  const containerHeight = itemHeight * visibleItems;

  return (
    <View style={[styles.wheelContainer, { height: containerHeight }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={{
          paddingVertical: (containerHeight - itemHeight) / 2,
        }}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
          onSelectionChange(Math.max(0, Math.min(index, items.length - 1)));
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.wheelItem,
              { height: itemHeight },
              index === selectedIndex && styles.wheelItemSelected,
            ]}
            onPress={() => onSelectionChange(index)}
          >
            <Text
              style={[
                styles.wheelItemText,
                index === selectedIndex && styles.wheelItemTextSelected,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Selection indicator lines */}
      <View style={[styles.selectionIndicator, { top: (containerHeight - itemHeight) / 2 }]} />
      <View style={[styles.selectionIndicator, { bottom: (containerHeight - itemHeight) / 2 }]} />
    </View>
  );
};

const AlarmCreationModalEnhanced: React.FC<AlarmCreationModalEnhancedProps> = ({
  visible,
  onClose,
  editingAlarm,
}) => {
  const { colors, isDark } = useTheme();
  const { addAlarm, updateAlarm } = useAlarms();

  // Form state
  const [label, setLabel] = useState('');
  const [selectedHour, setSelectedHour] = useState(7);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [repeat, setRepeat] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  });
  const [isDaily, setIsDaily] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [selectedRingtone, setSelectedRingtone] = useState('Default');
  const [enabled, setEnabled] = useState(true);

  // Generate hours and minutes arrays
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  // Calculate time until alarm
  const getTimeUntilAlarm = () => {
    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(selectedHour, selectedMinute, 0, 0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }

    const diff = alarmTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}hrs ${mins}min`;
  };

  // Initialize form when editing or opening modal
  useEffect(() => {
    if (visible) {
      if (editingAlarm) {
        setLabel(editingAlarm.label);
        const [hours, minutes] = editingAlarm.time.split(':').map(Number);
        setSelectedHour(hours);
        setSelectedMinute(minutes);
        setRepeat(editingAlarm.repeat);
        setVolume(editingAlarm.sound?.volume || 0.8);
        setVibrationEnabled(editingAlarm.vibration?.enabled || true);
        setSelectedRingtone(editingAlarm.sound?.name || 'Default');
        setEnabled(editingAlarm.enabled);

        // Check if daily (all days selected)
        const allDaysSelected = Object.values(editingAlarm.repeat).every((day) => day);
        setIsDaily(allDaysSelected);
      } else {
        resetForm();
      }
    }
  }, [visible, editingAlarm]);

  const resetForm = () => {
    setLabel('Alarm');
    const now = new Date();
    setSelectedHour(now.getHours());
    setSelectedMinute(now.getMinutes());
    setRepeat({
      sunday: false,
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
    });
    setIsDaily(false);
    setVolume(0.8);
    setVibrationEnabled(true);
    setSelectedRingtone('Default');
    setEnabled(true);
  };

  const handleDailyToggle = () => {
    const newDaily = !isDaily;
    setIsDaily(newDaily);

    if (newDaily) {
      // Select all days
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
      // Deselect all days
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
    const newRepeat = {
      ...repeat,
      [day]: !repeat[day],
    };
    setRepeat(newRepeat);

    // Update daily status based on whether all days are selected
    const allDaysSelected = Object.values(newRepeat).every((daySelected) => daySelected);
    setIsDaily(allDaysSelected);
  };

  const handleSave = () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter a label for your alarm');
      return;
    }

    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;

    const alarmData: Omit<Alarm, 'id'> = {
      label: label.trim(),
      time: timeString,
      enabled,
      repeat,
      sound: {
        type: 'built-in' as const,
        uri: 'built-in://' + selectedRingtone.toLowerCase(),
        name: selectedRingtone,
        volume: volume,
      },
      snooze: {
        enabled: false,
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

    if (editingAlarm) {
      updateAlarm(editingAlarm.id, alarmData);
    } else {
      addAlarm({
        ...alarmData,
        id: Date.now().toString(),
      } as Alarm);
    }

    onClose();
  };

  if (!visible) return null;

  const dynamicStyles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={onClose} style={dynamicStyles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.timeUntilText}>Ring in {getTimeUntilAlarm()}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Time Picker */}
        <View style={dynamicStyles.timePickerContainer}>
          <View style={dynamicStyles.timePickerRow}>
            <WheelPicker
              items={hours}
              selectedIndex={selectedHour}
              onSelectionChange={setSelectedHour}
            />
            <Text style={dynamicStyles.timeSeparator}>:</Text>
            <WheelPicker
              items={minutes}
              selectedIndex={selectedMinute}
              onSelectionChange={setSelectedMinute}
            />
          </View>
        </View>

        {/* Alarm Label */}
        <View style={dynamicStyles.section}>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Alarm label"
            style={dynamicStyles.labelInput}
          />
        </View>

        {/* Daily Toggle and Weekday Selector */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.dailyHeader}>
            <Text style={dynamicStyles.sectionTitle}>Repeat</Text>
            <View style={dynamicStyles.dailyToggleContainer}>
              <Text style={dynamicStyles.dailyText}>Daily</Text>
              <TouchableOpacity
                onPress={handleDailyToggle}
                style={[dynamicStyles.checkbox, isDaily && dynamicStyles.checkboxActive]}
              >
                {isDaily && <Ionicons name="checkmark" size={16} color={colors.background} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.daysContainer}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[dynamicStyles.dayButton, repeat[day.key] && dynamicStyles.dayButtonActive]}
                onPress={() => toggleRepeatDay(day.key)}
              >
                <Text
                  style={[
                    dynamicStyles.dayButtonText,
                    repeat[day.key] && dynamicStyles.dayButtonTextActive,
                  ]}
                >
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sound Settings */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>Sound & Vibration</Text>

          {/* Volume Control */}
          <View style={dynamicStyles.volumeContainer}>
            <Ionicons name="volume-mute" size={20} color={colors.textSecondary} />
            <View style={dynamicStyles.volumeTrack}>
              <View style={[dynamicStyles.volumeFill, { width: `${volume * 100}%` }]} />
              <TouchableOpacity
                style={[dynamicStyles.volumeThumb, { left: `${volume * 100}%` }]}
                onPressIn={() => {}}
              />
            </View>
            <Ionicons name="volume-high" size={20} color={colors.textSecondary} />
          </View>

          {/* Vibration and Ringtone */}
          <View style={dynamicStyles.soundOptionsContainer}>
            <TouchableOpacity
              style={dynamicStyles.soundOption}
              onPress={() => setVibrationEnabled(!vibrationEnabled)}
            >
              <MaterialIcons
                name="vibration"
                size={24}
                color={vibrationEnabled ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  dynamicStyles.soundOptionText,
                  vibrationEnabled && { color: colors.primary },
                ]}
              >
                Vibration
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={dynamicStyles.soundOption}>
              <Ionicons name="musical-note" size={24} color={colors.primary} />
              <Text style={dynamicStyles.soundOptionText}>{selectedRingtone}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={dynamicStyles.saveButtonContainer}>
        <TouchableOpacity style={dynamicStyles.saveButton} onPress={handleSave}>
          <Text style={dynamicStyles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof Colors.light, isDark: boolean) =>
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
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: Spacing.xs,
    },
    timeUntilText: {
      ...Typography.headline,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
    },
    timePickerContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl * 2,
    },
    timePickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    wheelContainer: {
      width: 80,
      overflow: 'hidden',
      position: 'relative',
    },
    wheelItem: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    wheelItemSelected: {
      backgroundColor: 'transparent',
    },
    wheelItemText: {
      fontSize: 48,
      fontWeight: '300',
      color: colors.textTertiary,
    },
    wheelItemTextSelected: {
      color: colors.text,
      fontWeight: '400',
    },
    selectionIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
    },
    timeSeparator: {
      fontSize: 48,
      fontWeight: '300',
      color: colors.text,
      marginHorizontal: Spacing.md,
    },
    section: {
      marginVertical: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.headline,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    labelInput: {
      fontSize: 18,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.md,
    },
    dailyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    dailyToggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    dailyText: {
      ...Typography.body,
      color: colors.text,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    checkboxActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    daysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.sm,
    },
    dayButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
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
      ...Typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    dayButtonTextActive: {
      color: colors.background,
      fontWeight: '600',
    },
    volumeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.md,
    },
    volumeSlider: {
      flex: 1,
      height: 40,
      marginHorizontal: Spacing.md,
    },
    volumeTrack: {
      flex: 1,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginHorizontal: Spacing.md,
      position: 'relative',
    },
    volumeFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    volumeThumb: {
      position: 'absolute',
      top: -8,
      width: 20,
      height: 20,
      backgroundColor: colors.primary,
      borderRadius: 10,
      marginLeft: -10,
    },
    soundOptionsContainer: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    soundOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    soundOptionText: {
      ...Typography.body,
      color: colors.text,
      flex: 1,
      marginLeft: Spacing.md,
    },
    saveButtonContainer: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      paddingTop: Spacing.md,
    },
    saveButton: {
      backgroundColor: '#FF3B30', // Red color as requested
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#FF3B30',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    saveButtonText: {
      ...Typography.headline,
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

const styles = StyleSheet.create({
  wheelContainer: {
    width: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemSelected: {
    backgroundColor: 'transparent',
  },
  wheelItemText: {
    fontSize: 48,
    fontWeight: '300',
  },
  wheelItemTextSelected: {
    fontWeight: '400',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
});

export default AlarmCreationModalEnhanced;
