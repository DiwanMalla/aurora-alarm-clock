import React, { useState, useEffect } from 'react';
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
import { Typography, Spacing } from '@/constants/Design';
import { useAppSettings, useAlarms } from '@/hooks/useStores';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockType, setClockType] = useState<'digital' | 'analog'>('digital');
  const { settings } = useAppSettings();
  const { alarms } = useAlarms();
  const { colors, isDark } = useTheme();

  const scaleAnim = new Animated.Value(1);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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

  // Get next alarm
  const nextAlarm = alarms
    .filter((alarm) => alarm.enabled)
    .sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a.time}:00`).getTime();
      const timeB = new Date(`1970-01-01T${b.time}:00`).getTime();
      return timeA - timeB;
    })[0];

  // Format time based on settings
  const formatTime = (date: Date) => {
    return format(date, settings.timeFormat === '24h' ? 'HH:mm' : 'h:mm a');
  };

  const formatSeconds = (date: Date) => {
    return format(date, 'ss');
  };

  const formatFullDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 20) return 'Good Evening';
    return 'Good Night';
  };

  const getTimeOfDayIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return 'sunny-outline';
    if (hour >= 12 && hour < 17) return 'partly-sunny-outline';
    if (hour >= 17 && hour < 20) return 'sunny-outline';
    return 'moon-outline';
  };

  const renderDigitalClock = () => (
    <Animated.View
      style={[styles(colors).digitalClockContainer, { transform: [{ scale: scaleAnim }] }]}
    >
      <View style={styles(colors).timeDisplayCard}>
        <View style={styles(colors).timeRow}>
          <Text style={styles(colors).digitalTime}>{formatTime(currentTime)}</Text>
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

    const hourAngle = hours * 30 + minutes * 0.5 - 90;
    const minuteAngle = minutes * 6 - 90;
    const secondAngle = seconds * 6 - 90;

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
                    transform: [{ rotate: `${i * 30}deg` }, { translateY: -90 }],
                  },
                  // Make 12, 3, 6, 9 markers bigger
                  i % 3 === 0 && styles(colors).majorHourMarker,
                ]}
              />
            ))}

            {/* Hour numbers */}
            {[12, 3, 6, 9].map((num, i) => (
              <View
                key={num}
                style={[
                  styles(colors).hourNumber,
                  {
                    transform: [
                      { rotate: `${i * 90}deg` },
                      { translateY: i === 0 ? -75 : i === 2 ? 75 : 0 },
                      { translateX: i === 1 ? 75 : i === 3 ? -75 : 0 },
                    ],
                  },
                ]}
              >
                <Text style={styles(colors).hourNumberText}>{num}</Text>
              </View>
            ))}

            {/* Clock hands */}
            <Animated.View
              style={[
                styles(colors).clockHand,
                styles(colors).hourHand,
                { transform: [{ rotate: `${hourAngle}deg` }] },
              ]}
            />
            <Animated.View
              style={[
                styles(colors).clockHand,
                styles(colors).minuteHand,
                { transform: [{ rotate: `${minuteAngle}deg` }] },
              ]}
            />
            <Animated.View
              style={[
                styles(colors).clockHand,
                styles(colors).secondHand,
                { transform: [{ rotate: `${secondAngle}deg` }] },
              ]}
            />

            {/* Center dot */}
            <View style={styles(colors).centerDot} />
          </View>
        </View>
        <Text style={styles(colors).analogDate}>{formatFullDate(currentTime)}</Text>
        <Text style={styles(colors).analogTime}>{formatTime(currentTime)}</Text>
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
        {/* Header with greeting */}
        <View style={styles(colors).header}>
          <View style={styles(colors).greetingContainer}>
            <Ionicons
              name={getTimeOfDayIcon()}
              size={24}
              color={colors.primary}
              style={styles(colors).greetingIcon}
            />
            <View>
              <Text style={styles(colors).greetingText}>{getTimeOfDayGreeting()}</Text>
              <Text style={styles(colors).subGreetingText}>Have a wonderful day!</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles(colors).toggleButton}
            onPress={() => setClockType(clockType === 'digital' ? 'analog' : 'digital')}
          >
            <Ionicons
              name={clockType === 'digital' ? 'time-outline' : 'phone-portrait-outline'}
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Main Clock Display */}
        <View style={styles(colors).clockSection}>
          {clockType === 'digital' ? renderDigitalClock() : renderAnalogClock()}
        </View>

        {/* Next Alarm Info - Redesigned */}
        {nextAlarm && (
          <View style={styles(colors).nextAlarmCard}>
            <View style={styles(colors).nextAlarmHeader}>
              <View style={styles(colors).alarmIconContainer}>
                <Ionicons name="alarm-outline" size={20} color={colors.background} />
              </View>
              <View style={styles(colors).nextAlarmInfo}>
                <Text style={styles(colors).nextAlarmTitle}>Next Alarm</Text>
                <Text style={styles(colors).nextAlarmTime}>{nextAlarm.time}</Text>
              </View>
              <View style={styles(colors).alarmStatusBadge}>
                <Text style={styles(colors).alarmStatusText}>ON</Text>
              </View>
            </View>
            <Text style={styles(colors).nextAlarmLabel}>{nextAlarm.label}</Text>
          </View>
        )}

        {/* Quick Actions - Redesigned */}
        <View style={styles(colors).quickActionsContainer}>
          <Text style={styles(colors).quickActionsTitle}>Quick Actions</Text>
          <View style={styles(colors).quickActions}>
            <TouchableOpacity
              style={[styles(colors).quickActionButton, styles(colors).primaryAction]}
            >
              <View style={styles(colors).actionIconContainer}>
                <Ionicons name="add-circle-outline" size={28} color={colors.background} />
              </View>
              <Text style={styles(colors).quickActionText}>Add Alarm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles(colors).quickActionButton, styles(colors).secondaryAction]}
            >
              <View style={styles(colors).actionIconContainer}>
                <MaterialIcons name="timer" size={28} color={colors.background} />
              </View>
              <Text style={styles(colors).quickActionText}>Timer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles(colors).quickActionButton, styles(colors).accentAction]}
            >
              <View style={styles(colors).actionIconContainer}>
                <Ionicons name="stopwatch-outline" size={28} color={colors.background} />
              </View>
              <Text style={styles(colors).quickActionText}>Stopwatch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any) =>
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
      paddingBottom: 100, // Increased padding to account for tab bar
    },

    // Header Styles
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      marginTop: Spacing.sm,
    },
    greetingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    greetingIcon: {
      marginRight: Spacing.md,
    },
    greetingText: {
      ...Typography.title2,
      fontWeight: '600',
      color: colors.text,
    },
    subGreetingText: {
      ...Typography.caption1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    toggleButton: {
      padding: Spacing.md,
      borderRadius: 16,
      backgroundColor: colors.surface,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    // Clock Section Styles
    clockSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing.xl,
      minHeight: screenHeight * 0.4,
    },

    // Digital Clock Styles
    digitalClockContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    timeDisplayCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: Spacing.xl,
      marginHorizontal: Spacing.lg,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    digitalTime: {
      fontSize: 56,
      fontWeight: '300',
      color: colors.text,
      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-thin',
    },
    digitalSeconds: {
      fontSize: 20,
      fontWeight: '400',
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
      marginTop: 8,
    },
    digitalDate: {
      ...Typography.headline,
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: Spacing.md,
    },
    timeZoneSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    timeZoneText: {
      ...Typography.caption1,
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },

    // Analog Clock Styles
    analogClockContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    clockFaceContainer: {
      padding: Spacing.lg,
      borderRadius: 150,
      backgroundColor: colors.surface,
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      marginBottom: Spacing.lg,
    },
    clockFace: {
      width: 200,
      height: 200,
      borderRadius: 100,
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
      width: 4,
      height: 50,
      bottom: 100,
    },
    minuteHand: {
      width: 3,
      height: 70,
      bottom: 100,
    },
    secondHand: {
      width: 1,
      height: 80,
      bottom: 100,
      backgroundColor: colors.error,
    },
    centerDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.text,
      elevation: 2,
    },
    analogDate: {
      ...Typography.headline,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    analogTime: {
      ...Typography.body,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },

    // Next Alarm Styles
    nextAlarmCard: {
      backgroundColor: colors.surface,
      margin: Spacing.lg,
      padding: Spacing.lg,
      borderRadius: 20,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextAlarmHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    alarmIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.success,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    nextAlarmInfo: {
      flex: 1,
    },
    nextAlarmTitle: {
      ...Typography.caption1,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    nextAlarmTime: {
      ...Typography.title2,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    alarmStatusBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
    },
    alarmStatusText: {
      ...Typography.caption2,
      fontWeight: '700',
      color: colors.background,
    },
    nextAlarmLabel: {
      ...Typography.body,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },

    // Quick Actions Styles
    quickActionsContainer: {
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl,
    },
    quickActionsTitle: {
      ...Typography.headline,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Spacing.md,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    quickActionButton: {
      flex: 1,
      alignItems: 'center',
      padding: Spacing.lg,
      borderRadius: 16,
      marginHorizontal: 4,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    primaryAction: {
      backgroundColor: colors.primary,
    },
    secondaryAction: {
      backgroundColor: colors.accent,
    },
    accentAction: {
      backgroundColor: colors.secondary,
    },
    actionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    quickActionText: {
      ...Typography.caption1,
      fontWeight: '600',
      color: colors.background,
      textAlign: 'center',
    },
  });
