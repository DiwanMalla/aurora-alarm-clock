import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants/Design';
import { useAppSettings, useAlarms } from '@/hooks/useStores';
import { format } from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');

export default function ClockScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockType, setClockType] = useState<'digital' | 'analog'>('digital');
  const { settings } = useAppSettings();
  const { alarms } = useAlarms();
  
  const fadeAnim = new Animated.Value(1);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Pulse animation for digital clock
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, [fadeAnim]);

  // Get next alarm
  const nextAlarm = alarms
    .filter(alarm => alarm.enabled)
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

  const renderDigitalClock = () => (
    <View style={styles.digitalClockContainer}>
      <Animated.View style={[styles.timeContainer, { opacity: fadeAnim }]}>
        <Text style={styles.digitalTime}>
          {formatTime(currentTime)}
        </Text>
        <Text style={styles.digitalSeconds}>
          {formatSeconds(currentTime)}
        </Text>
      </Animated.View>
      <Text style={styles.digitalDate}>
        {formatDate(currentTime)}
      </Text>
    </View>
  );

  const renderAnalogClock = () => {
    const now = currentTime;
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourAngle = (hours * 30) + (minutes * 0.5) - 90;
    const minuteAngle = (minutes * 6) - 90;
    const secondAngle = (seconds * 6) - 90;

    return (
      <View style={styles.analogClockContainer}>
        <View style={styles.clockFace}>
          {/* Hour markers */}
          {Array.from({ length: 12 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.hourMarker,
                {
                  transform: [
                    { rotate: `${i * 30}deg` },
                    { translateY: -85 },
                  ],
                },
              ]}
            />
          ))}
          
          {/* Clock hands */}
          <Animated.View
            style={[
              styles.clockHand,
              styles.hourHand,
              { transform: [{ rotate: `${hourAngle}deg` }] },
            ]}
          />
          <Animated.View
            style={[
              styles.clockHand,
              styles.minuteHand,
              { transform: [{ rotate: `${minuteAngle}deg` }] },
            ]}
          />
          <Animated.View
            style={[
              styles.clockHand,
              styles.secondHand,
              { transform: [{ rotate: `${secondAngle}deg` }] },
            ]}
          />
          
          {/* Center dot */}
          <View style={styles.centerDot} />
        </View>
        
        <Text style={styles.analogDate}>
          {formatDate(currentTime)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Clock</Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setClockType(clockType === 'digital' ? 'analog' : 'digital')}
          >
            <Ionicons
              name={clockType === 'digital' ? 'time-outline' : 'phone-portrait-outline'}
              size={24}
              color={Colors.light.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Main Clock Display */}
        <View style={styles.clockSection}>
          {clockType === 'digital' ? renderDigitalClock() : renderAnalogClock()}
        </View>

        {/* Next Alarm Info */}
        {nextAlarm && (
          <View style={styles.nextAlarmCard}>
            <View style={styles.nextAlarmHeader}>
              <Ionicons name="alarm-outline" size={20} color={Colors.light.success} />
              <Text style={styles.nextAlarmTitle}>Next Alarm</Text>
            </View>
            <Text style={styles.nextAlarmTime}>{nextAlarm.time}</Text>
            <Text style={styles.nextAlarmLabel}>{nextAlarm.label}</Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="add-circle-outline" size={32} color={Colors.light.primary} />
            <Text style={styles.quickActionText}>Add Alarm</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="timer-outline" size={32} color={Colors.light.accent} />
            <Text style={styles.quickActionText}>Timer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="stopwatch-outline" size={32} color={Colors.light.secondary} />
            <Text style={styles.quickActionText}>Stopwatch</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
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
    color: Colors.light.text,
  },
  toggleButton: {
    padding: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    letterSpacing: -2,
  },
  digitalSeconds: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  digitalDate: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.clockFace,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
    elevation: 4,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  hourMarker: {
    position: 'absolute',
    width: 3,
    height: 15,
    backgroundColor: Colors.light.clockHands,
    borderRadius: 2,
  },
  clockHand: {
    position: 'absolute',
    backgroundColor: Colors.light.clockHands,
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
    backgroundColor: Colors.light.error,
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.clockHands,
  },
  analogDate: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  
  // Next Alarm Styles
  nextAlarmCard: {
    backgroundColor: Colors.light.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    elevation: 2,
    shadowColor: Colors.light.shadow,
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
    color: Colors.light.success,
    marginLeft: Spacing.sm,
  },
  nextAlarmTime: {
    ...Typography.title2,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  nextAlarmLabel: {
    ...Typography.footnote,
    color: Colors.light.textSecondary,
  },
  
  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    minWidth: 80,
    elevation: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionText: {
    ...Typography.caption1,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
