import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useColorScheme } from '../useColorScheme';
import { Alarm } from '../../stores/alarmStore';
import { Switch } from './Switch';

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onPress: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
  style?: any;
  testID?: string;
}

export const AlarmCard: React.FC<AlarmCardProps> = ({
  alarm,
  onToggle,
  onPress,
  onDelete,
  style,
  testID = 'alarm-card',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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

  const handleDelete = () => {
    onDelete(alarm.id);
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
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
          <Switch value={alarm.enabled} onValueChange={handleToggle} testID={`${testID}-toggle`} />
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
          </View>
        )}

        {/* Delete Button */}
        <Pressable style={styles.deleteButton} onPress={handleDelete} testID={`${testID}-delete`}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
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
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    ...Typography.largeTitle,
    marginBottom: Spacing.xs,
  },
  labelText: {
    ...Typography.body,
    marginBottom: Spacing.xs / 2,
  },
  repeatText: {
    ...Typography.caption1,
  },
  controls: {
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border + '40',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoText: {
    ...Typography.caption1,
    marginLeft: Spacing.xs / 2,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: Spacing.xs,
  },
});

export default AlarmCard;
