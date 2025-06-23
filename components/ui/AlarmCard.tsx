import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useTheme } from '../../hooks/useTheme';
import { useTimeFormat } from '../../hooks/useTimeFormat';
import { Alarm } from '../../stores/alarmStore';
import { Switch } from './Switch';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onPress?: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onSkip?: (id: string) => void;
  onPreview?: (id: string) => void;
  onDuplicate?: (alarm: Alarm) => void;
  style?: Record<string, unknown>;
  testID?: string;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onPress,
  onDelete,
  onSkip,
  onPreview,
  onDuplicate,
  style,
  testID = 'alarm-card',
}) => {
  const { colors } = useTheme();
  const { formatAlarmTime } = useTimeFormat();
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // Get repeat days string
  const getRepeatDays = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const activeDays = days.filter((day) => alarm.repeat[day as keyof typeof alarm.repeat]);

    if (activeDays.length === 0) return 'One Time'; // Changed from 'Never'
    if (activeDays.length === 7) return 'Every day';
    if (activeDays.length === 5 && !alarm.repeat.saturday && !alarm.repeat.sunday) {
      return 'Weekdays';
    }
    if (activeDays.length === 2 && alarm.repeat.saturday && alarm.repeat.sunday) {
      return 'Weekends';
    }

    return days
      .filter((day) => alarm.repeat[day as keyof typeof alarm.repeat])
      .map((day) => dayLabels[days.indexOf(day)])
      .join(', ');
  };

  const handleToggle = (enabled: boolean) => {
    onToggle(alarm.id, enabled);
  };

  const handlePress = () => {
    onPress?.(alarm);
  };

  const handleOptionsPress = () => {
    setShowOptionsDropdown(!showOptionsDropdown);
  };

  const handlePreview = () => {
    setShowOptionsDropdown(false);
    if (onPreview) {
      onPreview(alarm.id);
    }
    // TODO: Implement preview alarm functionality - play sound for 3 seconds
  };

  const handleDuplicate = () => {
    setShowOptionsDropdown(false);
    if (onDuplicate) {
      onDuplicate(alarm);
    }
    // TODO: Implement duplicate alarm functionality - create copy with same settings
  };

  const handleDelete = () => {
    setShowOptionsDropdown(false);
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(alarm.id),
      },
    ]);
  };

  const handleSkip = () => {
    setShowOptionsDropdown(false);
    if (onSkip) {
      onSkip(alarm.id);
    }
    // TODO: Implement skip once functionality - disable alarm for next occurrence only
  };

  return (
    <>
      {/* Overlay to close dropdown when clicking outside */}
      {showOptionsDropdown && (
        <Pressable style={styles.dropdownOverlay} onPress={() => setShowOptionsDropdown(false)} />
      )}

      <View style={[styles.container, style]}>
        <Pressable
          style={({ pressed }) => [
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={handlePress}
          testID={testID}
          android_ripple={{
            color: colors.primary + '20',
            borderless: false,
          }}
        >
          <View style={styles.content}>
            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text
                style={[
                  styles.timeText,
                  {
                    color: alarm.enabled ? colors.text : colors.textSecondary,
                  },
                ]}
                testID={`${testID}-time`}
              >
                {formatAlarmTime(alarm.time)}
              </Text>

              {/* Label */}
              {alarm.label && (
                <Text
                  style={[
                    styles.labelText,
                    {
                      color: alarm.enabled ? colors.textSecondary : colors.textTertiary,
                    },
                  ]}
                  testID={`${testID}-label`}
                >
                  {alarm.label}
                </Text>
              )}

              {/* Repeat Days */}
              <Text
                style={[
                  styles.repeatText,
                  {
                    color: alarm.enabled ? colors.textSecondary : colors.textTertiary,
                  },
                ]}
                testID={`${testID}-repeat`}
              >
                {getRepeatDays()}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              {/* Toggle Switch */}
              <Switch
                value={alarm.enabled}
                onValueChange={handleToggle}
                testID={`${testID}-toggle`}
              />

              {/* Options Menu Button */}
              <Pressable
                style={[styles.optionsButton, { backgroundColor: colors.surface }]}
                onPress={handleOptionsPress}
                testID={`${testID}-options`}
              >
                <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Additional Info Row */}
          <View style={styles.infoRow}>
            {/* Sound Info */}
            <View style={styles.infoItem}>
              <Ionicons name="volume-medium-outline" size={16} color={colors.textSecondary} />
              <Text
                style={[styles.infoText, { color: colors.textSecondary }]}
                testID={`${testID}-sound`}
              >
                {alarm.sound.name}
              </Text>
            </View>

            {/* Smart Wake-up Indicator */}
            {alarm.smartWakeup.enabled && (
              <View style={styles.infoItem}>
                <Ionicons name="sunny-outline" size={16} color={colors.accent} />
                <Text
                  style={[styles.infoText, { color: colors.accent }]}
                  testID={`${testID}-smart-wakeup`}
                >
                  Smart Wake-up
                </Text>
              </View>
            )}

            {/* Vibration Indicator */}
            {alarm.vibration.enabled && (
              <View style={styles.infoItem}>
                <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
                <Text
                  style={[styles.infoText, { color: colors.textSecondary }]}
                  testID={`${testID}-vibration`}
                >
                  Vibrate
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        {/* Options Modal */}
        {showOptionsDropdown && (
          <View
            style={[
              styles.dropdownMenu,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Pressable
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handlePreview}
            >
              <Ionicons name="play-outline" size={18} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Preview</Text>
            </Pressable>

            <Pressable
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleDuplicate}
            >
              <Ionicons name="copy-outline" size={18} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Duplicate</Text>
            </Pressable>

            <Pressable
              style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
              onPress={handleSkip}
            >
              <Ionicons name="play-skip-forward-outline" size={18} color={colors.text} />
              <Text style={[styles.dropdownText, { color: colors.text }]}>Skip Once</Text>
            </Pressable>

            <Pressable
              style={[styles.dropdownItem, styles.lastDropdownItem]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.dropdownText, { color: colors.error }]}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    ...Typography.title2,
    fontWeight: '600',
  },
  labelText: {
    ...Typography.body,
    marginTop: Spacing.xs,
  },
  repeatText: {
    ...Typography.caption1,
    marginTop: Spacing.xs,
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  optionsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    ...Typography.caption1,
  },
  optionsContainer: {
    paddingVertical: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  optionText: {
    ...Typography.body,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: -10,
    right: 10,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
    minWidth: 120,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    ...Typography.body,
    fontSize: 14,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
});
