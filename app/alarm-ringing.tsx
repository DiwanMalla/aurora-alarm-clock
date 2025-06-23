import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useAlarms } from '@/hooks/useStores';
import { Typography, Spacing } from '@/constants/Design';
import { alarmScheduler } from '@/lib/alarmScheduler';
import * as Haptics from 'expo-haptics';

export default function AlarmRingingScreen() {
  const { colors } = useTheme();
  const { activeAlarm, isAlarmRinging, dismissAlarm, snoozeAlarm } = useAlarms();

  useEffect(() => {
    // If no alarm is ringing, go back
    if (!isAlarmRinging || !activeAlarm) {
      router.back();
    }
  }, [isAlarmRinging, activeAlarm]);

  useEffect(() => {
    // Start vibration pattern for alarm
    if (isAlarmRinging && activeAlarm?.vibration.enabled) {
      const vibrationPattern =
        activeAlarm.vibration.pattern.length > 0
          ? activeAlarm.vibration.pattern
          : [0, 1000, 500, 1000]; // Default pattern

      Vibration.vibrate(vibrationPattern, true); // Repeat indefinitely
    }

    return () => {
      Vibration.cancel();
    };
  }, [isAlarmRinging, activeAlarm]);

  const handleDismiss = async () => {
    try {
      await alarmScheduler.stopCurrentAlarm();
      Vibration.cancel();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dismissAlarm();
      router.back();
    } catch (error) {
      console.error('Error dismissing alarm:', error);
    }
  };

  const handleSnooze = async () => {
    try {
      await alarmScheduler.snoozeCurrentAlarm();
      Vibration.cancel();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      snoozeAlarm();
      router.back();
    } catch (error) {
      console.error('Error snoozing alarm:', error);
    }
  };

  if (!activeAlarm || !isAlarmRinging) {
    return null;
  }

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Current Time Display */}
        <View style={styles.timeContainer}>
          <Text style={[styles.currentTime, { color: colors.text }]}>{currentTime}</Text>
          <Text style={[styles.alarmLabel, { color: colors.textSecondary }]}>
            {activeAlarm.label || 'Alarm'}
          </Text>
        </View>

        {/* Alarm Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="alarm-outline" size={120} color={colors.primary} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Snooze Button */}
          {activeAlarm.snooze.enabled && (
            <TouchableOpacity
              style={[styles.snoozeButton, { backgroundColor: colors.surface }]}
              onPress={handleSnooze}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
                Snooze {activeAlarm.snooze.duration}m
              </Text>
            </TouchableOpacity>
          )}

          {/* Dismiss Button */}
          <TouchableOpacity
            style={[styles.dismissButton, { backgroundColor: colors.primary }]}
            onPress={handleDismiss}
            activeOpacity={0.8}
          >
            <Ionicons name="stop-outline" size={24} color={colors.background} />
            <Text style={[styles.buttonText, { color: colors.background }]}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  currentTime: {
    ...Typography.largeTitle,
    fontSize: 64,
    fontWeight: '200',
    marginBottom: Spacing.sm,
  },
  alarmLabel: {
    ...Typography.title2,
    textAlign: 'center',
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  buttonsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 25,
    gap: Spacing.sm,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 25,
    gap: Spacing.sm,
  },
  buttonText: {
    ...Typography.headline,
    fontWeight: '600',
  },
});
