import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useTheme } from '../../hooks/useTheme';
import { useTimeFormat } from '../../hooks/useTimeFormat';

interface IPhoneTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  style?: Record<string, unknown>;
  testID?: string;
}

// Simple increment/decrement time picker like iPhone's bedtime feature
export const IPhoneTimePicker: React.FC<IPhoneTimePickerProps> = ({
  value,
  onChange,
  style,
  testID = 'iphone-time-picker',
}) => {
  const { colors } = useTheme();
  const { is24HourFormat } = useTimeFormat();

  const currentHour = value.getHours();
  const currentMinute = value.getMinutes();

  // Quick preset times for common alarm times
  const presetTimes = [
    { label: '6:00 AM', hour: 6, minute: 0 },
    { label: '6:30 AM', hour: 6, minute: 30 },
    { label: '7:00 AM', hour: 7, minute: 0 },
    { label: '7:30 AM', hour: 7, minute: 30 },
    { label: '8:00 AM', hour: 8, minute: 0 },
    { label: '8:30 AM', hour: 8, minute: 30 },
    { label: '9:00 AM', hour: 9, minute: 0 },
    { label: '10:00 PM', hour: 22, minute: 0 },
    { label: '11:00 PM', hour: 23, minute: 0 },
  ];

  const formatTime = (hour: number, minute: number) => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24HourFormat,
    });
  };

  const adjustTime = useCallback(
    (type: 'hour' | 'minute', increment: number) => {
      const newDate = new Date(value);

      if (type === 'hour') {
        let newHour = currentHour + increment;
        if (newHour >= 24) newHour = 0;
        if (newHour < 0) newHour = 23;
        newDate.setHours(newHour);
      } else {
        let newMinute = currentMinute + increment;
        let newHour = currentHour;

        if (newMinute >= 60) {
          newMinute = 0;
          newHour = currentHour + 1;
          if (newHour >= 24) newHour = 0;
        }
        if (newMinute < 0) {
          newMinute = 55;
          newHour = currentHour - 1;
          if (newHour < 0) newHour = 23;
        }

        newDate.setHours(newHour, newMinute);
      }

      onChange(newDate);
      Haptics.selectionAsync();
    },
    [value, onChange, currentHour, currentMinute]
  );

  const setPresetTime = useCallback(
    (hour: number, minute: number) => {
      const newDate = new Date(value);
      newDate.setHours(hour, minute, 0, 0);
      onChange(newDate);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [value, onChange]
  );

  return (
    <View testID={testID} style={[styles.container, style]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Set Alarm Time</Text>
        <Text style={[styles.currentTime, { color: colors.primary }]}>
          {formatTime(currentHour, currentMinute)}
        </Text>
      </View>

      {/* Quick presets */}
      <View style={styles.presetsSection}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Common Times</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetsContainer}
        >
          {presetTimes.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setPresetTime(preset.hour, preset.minute)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, { color: colors.primary }]}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main time adjuster */}
      <View style={styles.timeAdjuster}>
        {/* Hour controls */}
        <View style={styles.timeUnit}>
          <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>Hour</Text>

          <TouchableOpacity
            style={[styles.adjustButton, { backgroundColor: colors.primary }]}
            onPress={() => adjustTime('hour', 1)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={[styles.timeDisplay, { backgroundColor: colors.surface }]}>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {is24HourFormat
                ? currentHour.toString().padStart(2, '0')
                : (currentHour % 12 || 12).toString()}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.adjustButton, { backgroundColor: colors.primary }]}
            onPress={() => adjustTime('hour', -1)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-down" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Text style={[styles.separatorText, { color: colors.primary }]}>:</Text>
        </View>

        {/* Minute controls */}
        <View style={styles.timeUnit}>
          <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>Minute</Text>

          <TouchableOpacity
            style={[styles.adjustButton, { backgroundColor: colors.primary }]}
            onPress={() => adjustTime('minute', 5)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-up" size={24} color={colors.white} />
          </TouchableOpacity>

          <View style={[styles.timeDisplay, { backgroundColor: colors.surface }]}>
            <Text style={[styles.timeValue, { color: colors.text }]}>
              {currentMinute.toString().padStart(2, '0')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.adjustButton, { backgroundColor: colors.primary }]}
            onPress={() => adjustTime('minute', -5)}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-down" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* AM/PM for 12-hour format */}
        {!is24HourFormat && (
          <View style={styles.timeUnit}>
            <Text style={[styles.unitLabel, { color: colors.textSecondary }]}>Period</Text>

            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: currentHour >= 12 ? colors.primary : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                const newDate = new Date(value);
                const isPM = currentHour >= 12;
                const hour12 = currentHour % 12 || 12;
                const newHour = isPM ? hour12 : hour12 + 12;
                newDate.setHours(newHour);
                onChange(newDate);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: currentHour >= 12 ? colors.white : colors.primary,
                  },
                ]}
              >
                PM
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodButton,
                {
                  backgroundColor: currentHour < 12 ? colors.primary : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => {
                const newDate = new Date(value);
                const isPM = currentHour >= 12;
                const hour12 = currentHour % 12 || 12;
                const newHour = isPM ? hour12 : hour12;
                if (newHour === 12) {
                  newDate.setHours(0);
                } else {
                  newDate.setHours(newHour);
                }
                onChange(newDate);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: currentHour < 12 ? colors.white : colors.primary,
                  },
                ]}
              >
                AM
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer tip */}
      <View style={styles.footer}>
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            Tap arrows to adjust or choose a preset time
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.headline.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  currentTime: {
    fontSize: 42,
    fontWeight: '200',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  presetsSection: {
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.caption1.fontSize,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  presetsContainer: {
    paddingHorizontal: Spacing.lg,
  },
  presetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  presetText: {
    fontSize: Typography.footnote.fontSize,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  timeAdjuster: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  timeUnit: {
    alignItems: 'center',
    minWidth: 80,
  },
  unitLabel: {
    fontSize: Typography.caption1.fontSize,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  timeDisplay: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  separator: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    paddingTop: 40, // Account for label
  },
  separatorText: {
    fontSize: 32,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  periodButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xs,
    borderWidth: 2,
  },
  periodText: {
    fontSize: Typography.footnote.fontSize,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: Typography.caption2.fontSize,
    marginLeft: Spacing.xs,
    textAlign: 'center',
  },
});
