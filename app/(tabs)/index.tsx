import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Typography, Spacing, Colors } from '@/constants/Design';
import { useAlarms } from '@/hooks/useStores';
import { useTheme } from '@/hooks/useTheme';
import { useTimeFormat } from '@/hooks/useTimeFormat';
import { format } from 'date-fns';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockType, setClockType] = useState<'digital' | 'analog'>('digital');
  const { alarms } = useAlarms();
  const { colors, isDark } = useTheme();
  const { formatDisplayTime } = useTimeFormat();

  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime(); // Initial call
    const timer = (globalThis as typeof globalThis).setInterval(updateTime, 1000);

    return () => (globalThis as typeof globalThis).clearInterval(timer);
  }, []);

  // Breathing animation for clock
  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, [scaleAnim]);

  // Get next alarm using proper scheduling logic
  const nextAlarm = useMemo(() => {
    const enabledAlarms = alarms.filter((alarm) => alarm.enabled);
    if (enabledAlarms.length === 0) return null;

    const now = new Date();
    const nextAlarms = enabledAlarms.map((alarm) => {
      // Use the same logic as the alarm store's getNextAlarmTime
      let nextTime: Date;

      // Check if alarm has any repeat days enabled
      const hasRepeatDays = Object.values(alarm.repeat).some((day) => day);

      if (hasRepeatDays) {
        // Recurring alarm - find next occurrence
        const [hours, minutes] = alarm.time.split(':').map(Number);
        const today = now.getDay();

        // Convert repeat object to array of day numbers (0=Sunday, 1=Monday, etc.)
        const repeatDays: number[] = [];
        if (alarm.repeat.sunday) repeatDays.push(0);
        if (alarm.repeat.monday) repeatDays.push(1);
        if (alarm.repeat.tuesday) repeatDays.push(2);
        if (alarm.repeat.wednesday) repeatDays.push(3);
        if (alarm.repeat.thursday) repeatDays.push(4);
        if (alarm.repeat.friday) repeatDays.push(5);
        if (alarm.repeat.saturday) repeatDays.push(6);

        // Find the next day this alarm should ring
        const daysUntilNext = repeatDays
          .map((day: number) => {
            let diff = day - today;
            if (diff < 0) diff += 7;
            if (diff === 0) {
              // Today - check if time has passed
              const todayAlarmTime = new Date(now);
              todayAlarmTime.setHours(hours, minutes, 0, 0);
              if (todayAlarmTime <= now) {
                diff = 7; // Next week
              }
            }
            return diff;
          })
          .sort((a: number, b: number) => a - b)[0];

        nextTime = new Date(now);
        nextTime.setDate(now.getDate() + daysUntilNext);
        nextTime.setHours(hours, minutes, 0, 0);
      } else {
        // One-time alarm
        if (alarm.scheduledDate) {
          // Use the stored scheduled date
          const [hours, minutes] = alarm.time.split(':').map(Number);
          nextTime = new Date(alarm.scheduledDate);
          nextTime.setHours(hours, minutes, 0, 0);
        } else {
          // Fallback for alarms without scheduled date
          const [hours, minutes] = alarm.time.split(':').map(Number);
          nextTime = new Date(now);
          nextTime.setHours(hours, minutes, 0, 0);

          // If time has passed today, schedule for tomorrow
          if (nextTime <= now) {
            nextTime.setDate(nextTime.getDate() + 1);
          }
        }
      }

      return { alarm, nextTime };
    });

    // Sort by next occurrence time and return the earliest
    nextAlarms.sort((a, b) => a.nextTime.getTime() - b.nextTime.getTime());
    return nextAlarms[0]?.alarm || null;
  }, [alarms]);

  // Format time based on settings

  const formatSeconds = (date: Date) => {
    return format(date, 'ss');
  };

  const formatFullDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const renderDigitalClock = () => (
    <Animated.View
      style={[styles(colors).digitalClockContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles(colors).timeDisplayCard}>
        <View style={styles(colors).timeRow}>
          <Text style={styles(colors).digitalTime}>{formatDisplayTime(currentTime)}</Text>
          <Text style={styles(colors).digitalSeconds}>{formatSeconds(currentTime)}</Text>
        </View>
        <Text style={styles(colors).digitalDate}>{formatFullDate(currentTime)}</Text>

        {/* Time zone selector */}
        <View style={styles(colors).timeZoneSelector}>
          <Ionicons name="globe-outline" size={16} color={colors.textSecondary} />
          <Text style={styles(colors).timeZoneText}>Local Time</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderAnalogClock = () => {
    const now = currentTime;
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Fixed angle calculations to ensure accuracy
    const hourAngle = hours * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    const clockSize = Math.min(screenWidth * 0.5, 180);
    const clockRadius = clockSize / 2;

    return (
      <Animated.View
        style={[styles(colors).analogClockContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        <View style={styles(colors).clockFaceContainer}>
          <View style={styles(colors).clockFace}>
            {/* Hour markers */}
            {Array.from({ length: 12 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles(colors).hourMarker,
                  {
                    transform: [{ rotate: `${i * 30}deg` }, { translateY: -(clockRadius - 15) }],
                  },
                  // Make 12, 3, 6, 9 markers bigger
                  i % 3 === 0 && styles(colors).majorHourMarker,
                ]}
              />
            ))}

            {/* Hour numbers */}
            <View style={[styles(colors).hourNumber, styles(colors).hourNumber12]}>
              <Text style={styles(colors).hourNumberText}>12</Text>
            </View>
            <View style={[styles(colors).hourNumber, styles(colors).hourNumber3]}>
              <Text style={styles(colors).hourNumberText}>3</Text>
            </View>
            <View style={[styles(colors).hourNumber, styles(colors).hourNumber6]}>
              <Text style={styles(colors).hourNumberText}>6</Text>
            </View>
            <View style={[styles(colors).hourNumber, styles(colors).hourNumber9]}>
              <Text style={styles(colors).hourNumberText}>9</Text>
            </View>

            {/* Clock hands */}
            <Animated.View
              style={[
                styles(colors).clockHand,
                styles(colors).hourHand,
                {
                  transform: [{ rotate: `${hourAngle}deg` }],
                  bottom: clockRadius,
                  height: clockRadius * 0.5,
                },
              ]}
            />
            <Animated.View
              style={[
                styles(colors).clockHand,
                styles(colors).minuteHand,
                {
                  transform: [{ rotate: `${minuteAngle}deg` }],
                  bottom: clockRadius,
                  height: clockRadius * 0.7,
                },
              ]}
            />
            <Animated.View
              style={[
                styles(colors).clockHand,
                styles(colors).secondHand,
                {
                  transform: [{ rotate: `${secondAngle}deg` }],
                  bottom: clockRadius,
                  height: clockRadius * 0.8,
                },
              ]}
            />

            {/* Center dot */}
            <View style={styles(colors).centerDot} />
          </View>
        </View>
        <Text style={styles(colors).analogDate}>{formatFullDate(currentTime)}</Text>
        <Text style={styles(colors).analogTime}>{formatDisplayTime(currentTime)}</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles(colors).container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={styles(colors).scrollView}
        contentContainerStyle={styles(colors).scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Clock type toggle - floating button */}
        <TouchableOpacity
          style={styles(colors).floatingToggleButton}
          onPress={() => setClockType(clockType === 'digital' ? 'analog' : 'digital')}
        >
          <Ionicons
            name={clockType === 'digital' ? 'time-outline' : 'phone-portrait-outline'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Main Clock Display - Full Screen */}
        <View style={styles(colors).clockSection}>
          {clockType === 'digital' ? renderDigitalClock() : renderAnalogClock()}
        </View>

        {/* Next Alarm Info - Compact */}
        {nextAlarm && (
          <View style={styles(colors).nextAlarmCard}>
            <View style={styles(colors).nextAlarmHeader}>
              <View style={styles(colors).alarmIconContainer}>
                <Ionicons name="alarm-outline" size={16} color={colors.background} />
              </View>
              <View style={styles(colors).nextAlarmInfo}>
                <Text style={styles(colors).nextAlarmTitle}>Next Alarm</Text>
                <Text style={styles(colors).nextAlarmTime}>{nextAlarm.time}</Text>
              </View>
              <View style={styles(colors).alarmStatusBadge}>
                <Text style={styles(colors).alarmStatusText}>ON</Text>
              </View>
            </View>
            {nextAlarm.label && (
              <Text style={styles(colors).nextAlarmLabel}>{nextAlarm.label}</Text>
            )}
          </View>
        )}

        {/* Modern Quick Actions */}
        <View style={styles(colors).quickActionsContainer}>
          <View style={styles(colors).quickActions}>
            <TouchableOpacity
              style={[styles(colors).modernActionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/alarm-creation')}
            >
              <View style={styles(colors).modernActionContent}>
                <Ionicons name="add" size={24} color={colors.background} />
                <Text style={styles(colors).modernActionText}>Add Alarm</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles(colors).modernActionButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/timer')}
            >
              <View style={styles(colors).modernActionContent}>
                <MaterialIcons name="timer" size={24} color={colors.background} />
                <Text style={styles(colors).modernActionText}>Timer</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles(colors).modernActionButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/stopwatch')}
            >
              <View style={styles(colors).modernActionContent}>
                <Ionicons name="stopwatch" size={24} color={colors.background} />
                <Text style={styles(colors).modernActionText}>Stopwatch</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 80, // Reduced padding
    },

    // Floating toggle button
    floatingToggleButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      zIndex: 10,
    },

    // Clock Section Styles - Full height
    clockSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      minHeight: screenHeight * 0.55, // Increased to take more space
    },

    // Digital Clock Styles
    digitalClockContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.lg,
      width: '100%',
    },
    timeDisplayCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: Spacing.lg,
      marginHorizontal: Spacing.md,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      width: '90%',
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    digitalTime: {
      fontSize: Math.min(screenWidth * 0.16, 72), // Responsive font size
      fontWeight: '200',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-thin',
    },
    digitalSeconds: {
      fontSize: Math.min(screenWidth * 0.06, 24), // Responsive font size
      fontWeight: '400',
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
      marginTop: 8,
    },
    digitalDate: {
      ...Typography.body,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },
    timeZoneSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timeZoneText: {
      ...Typography.caption2,
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },

    // Analog Clock Styles - Compact
    analogClockContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.lg,
    },
    clockFaceContainer: {
      padding: Spacing.md,
      borderRadius: 120,
      backgroundColor: colors.surface,
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      marginBottom: Spacing.md,
    },
    clockFace: {
      width: Math.min(screenWidth * 0.5, 180), // Responsive size
      height: Math.min(screenWidth * 0.5, 180),
      borderRadius: Math.min(screenWidth * 0.25, 90),
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    hourMarker: {
      position: 'absolute',
      width: 2,
      height: 15,
      backgroundColor: colors.textSecondary,
      borderRadius: 1,
    },
    majorHourMarker: {
      width: 3,
      height: 20,
      backgroundColor: colors.text,
    },
    hourNumber: {
      position: 'absolute',
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hourNumber12: {
      top: 10,
      left: '50%',
      marginLeft: -15, // Half of width to center
    },
    hourNumber3: {
      right: 10,
      top: '50%',
      marginTop: -15, // Half of height to center
    },
    hourNumber6: {
      bottom: 10,
      left: '50%',
      marginLeft: -15, // Half of width to center
    },
    hourNumber9: {
      left: 10,
      top: '50%',
      marginTop: -15, // Half of height to center
    },
    hourNumberText: {
      ...Typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    clockHand: {
      position: 'absolute',
      backgroundColor: colors.text,
      borderRadius: 2,
      transformOrigin: 'center bottom',
    },
    hourHand: {
      width: 5,
      // height and bottom are set dynamically in the component
    },
    minuteHand: {
      width: 3,
      // height and bottom are set dynamically in the component
    },
    secondHand: {
      width: 2,
      backgroundColor: colors.error,
      // height and bottom are set dynamically in the component
    },
    centerDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.text,
      elevation: 2,
    },
    analogDate: {
      ...Typography.body,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    analogTime: {
      ...Typography.caption1,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },

    // Next Alarm Styles - Compact
    nextAlarmCard: {
      backgroundColor: colors.surface,
      marginHorizontal: Spacing.lg,
      marginVertical: Spacing.md,
      padding: Spacing.md,
      borderRadius: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextAlarmHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    alarmIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    nextAlarmInfo: {
      flex: 1,
    },
    nextAlarmTitle: {
      ...Typography.caption2,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    nextAlarmTime: {
      ...Typography.headline,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    alarmStatusBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
      borderRadius: 8,
    },
    alarmStatusText: {
      ...Typography.caption2,
      fontWeight: '700',
      color: colors.background,
      fontSize: 10,
    },
    nextAlarmLabel: {
      ...Typography.caption1,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // Modern Quick Actions Styles
    quickActionsContainer: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      marginBottom: Spacing.lg,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.md,
    },
    modernActionButton: {
      flex: 1,
      height: 64,
      borderRadius: 20,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      marginHorizontal: 2,
    },
    modernActionContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.md,
    },
    modernActionText: {
      ...Typography.caption1,
      fontWeight: '600',
      color: colors.background,
      marginLeft: Spacing.xs,
    },
  });
