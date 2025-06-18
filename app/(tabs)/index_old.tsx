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
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/constants/Design';
import { useAppSettings, useAlarms } from '@/hooks/useStores';
import { useTheme } from '@/hooks/useTheme';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockType, setClockType] = useState<'digital' | 'analog'>('digital');
  const [selectedTimeZone, setSelectedTimeZone] = useState('local');
  const { settings } = useAppSettings();
  const { alarms } = useAlarms();
  const { colors, isDark } = useTheme();

  const fadeAnim = new Animated.Value(1);
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

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d');
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
    if (hour >= 6 && hour < 12) return 'sunny';
    if (hour >= 12 && hour < 17) return 'partly-sunny';
    if (hour >= 17 && hour < 20) return 'sunset';
    return 'moon';
  };

  const renderDigitalClock = () => (
    <Animated.View style={[styles(colors).digitalClockContainer, { transform: [{ scale: scaleAnim }] }]}>
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
      <Animated.View style={[styles(colors).analogClockContainer, { transform: [{ scale: scaleAnim }] }]}>
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
            <TouchableOpacity style={[styles(colors).quickActionButton, styles(colors).primaryAction]}>
              <View style={styles(colors).actionIconContainer}>
                <Ionicons name="add-circle-outline" size={28} color={colors.background} />
              </View>
              <Text style={styles(colors).quickActionText}>Add Alarm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles(colors).quickActionButton, styles(colors).secondaryAction]}>
              <View style={styles(colors).actionIconContainer}>
                <MaterialIcons name="timer" size={28} color={colors.background} />
              </View>
              <Text style={styles(colors).quickActionText}>Timer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles(colors).quickActionButton, styles(colors).accentAction]}>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    headerTitle: {
      ...Typography.title1,
      color: colors.text,
    },
    toggleButton: {
      padding: Spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    clockSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },

    // Digital Clock Styles
    digitalClockContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: Spacing.sm,
    },
    digitalTime: {
      fontSize: 64,
      fontWeight: '200',
      color: colors.text,
      letterSpacing: -2,
    },
    digitalSeconds: {
      fontSize: 24,
      fontWeight: '500',
      color: colors.textSecondary,
      marginLeft: Spacing.xs,
    },
    digitalDate: {
      ...Typography.body,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },

    // Analog Clock Styles
    analogClockContainer: {
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    clockFace: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.clockFace,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: colors.border,
      marginBottom: Spacing.lg,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    hourMarker: {
      position: 'absolute',
      width: 3,
      height: 15,
      backgroundColor: colors.clockHands,
      borderRadius: 2,
    },
    clockHand: {
      position: 'absolute',
      backgroundColor: colors.clockHands,
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
      backgroundColor: colors.clockHands,
    },
    analogDate: {
      ...Typography.body,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },

    // Next Alarm Styles
    nextAlarmCard: {
      backgroundColor: colors.surface,
      margin: Spacing.lg,
      padding: Spacing.lg,
      borderRadius: 16,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    nextAlarmHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    nextAlarmTitle: {
      ...Typography.headline,
      fontWeight: '600',
      color: colors.success,
      marginLeft: Spacing.sm,
    },
    nextAlarmTime: {
      ...Typography.title2,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    nextAlarmLabel: {
      ...Typography.footnote,
      color: colors.textSecondary,
    },

    // Quick Actions Styles
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      marginBottom: Spacing.xl, // Added bottom margin for better spacing
    },
    quickActionButton: {
      alignItems: 'center',
      padding: Spacing.md,
      borderRadius: 12,
      backgroundColor: colors.surface,
      minWidth: 80,
      elevation: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    quickActionText: {
      ...Typography.caption1,
      fontWeight: '500',
      color: colors.textSecondary,
      marginTop: Spacing.xs,
      textAlign: 'center',
    },
  });
