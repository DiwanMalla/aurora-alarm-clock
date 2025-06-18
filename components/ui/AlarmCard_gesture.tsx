import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useTheme } from '../../hooks/useTheme';
import { Alarm } from '../../stores/alarmStore';
import { Switch } from './Switch';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  onSnooze?: (id: string) => void;
  style?: any;
  testID?: string;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onPress,
  onDelete,
  onSnooze,
  style,
  testID = 'alarm-card',
}) => {
  const { colors } = useTheme();

  // Gesture handling
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {
      // Optional: Add haptic feedback
    },
    onActive: (event) => {
      translateX.value = event.translationX;
    },
    onEnd: (event) => {
      const shouldDismiss = Math.abs(event.translationX) > SWIPE_THRESHOLD;

      if (shouldDismiss) {
        if (event.translationX > 0 && onSnooze) {
          // Swipe right - snooze
          runOnJS(onSnooze)(alarm.id);
          translateX.value = withSpring(0);
        } else if (event.translationX < 0) {
          // Swipe left - delete
          opacity.value = withSpring(0);
          translateX.value = withSpring(-SCREEN_WIDTH);
          runOnJS(onDelete)(alarm.id);
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [1, 0.95], 'clamp');

    return {
      transform: [{ translateX: translateX.value }, { scale }],
      opacity: opacity.value,
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [colors.error, 'transparent', colors.success || colors.primary]
    );

    return {
      backgroundColor,
    };
  });

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get repeat days string
  const getRepeatDays = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const activeDays = days.filter((day) => alarm.repeat[day as keyof typeof alarm.repeat]);

    if (activeDays.length === 0) return 'Never';
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
    onPress(alarm);
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.background, backgroundStyle]} />

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[animatedStyle]}>
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={handlePress}
            testID={testID}
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
                  {formatTime(alarm.time)}
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

            {/* Gesture Hints */}
            <View style={[styles.gestureHint, { borderTopColor: colors.border }]}>
              <Text style={[styles.hintText, { color: colors.textTertiary }]}>
                {onSnooze ? '← Delete • Snooze →' : '← Swipe to delete'}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
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
  gestureHint: {
    borderTopWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  hintText: {
    ...Typography.caption2,
    fontSize: 11,
  },
});
