import React from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AlarmCard, Label } from '@/components/ui';
import { useAlarmManagement } from '@/hooks/useStores';
import { Colors, Spacing } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import { Alarm } from '@/stores/alarmStore';

export default function AlarmsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { alarms, updateAlarm, deleteAlarm, getNextAlarm } = useAlarmManagement();
  const nextAlarm = getNextAlarm();

  const handleAlarmPress = (alarm: Alarm) => {
    Alert.alert(
      'Alarm Details',
      `Label: ${alarm.label}\nTime: ${alarm.time}\nEnabled: ${alarm.enabled ? 'Yes' : 'No'}`,
      [
        { text: 'Edit', onPress: () => console.log('Edit alarm:', alarm.id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleAlarmToggle = (id: string, enabled: boolean) => {
    updateAlarm(id, { enabled });
  };

  const handleAlarmDelete = (id: string) => {
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAlarm(id),
      },
    ]);
  };

  const sortedAlarms = [...alarms].sort((a, b) => {
    // Sort by time (convert to minutes for easy comparison)
    const getMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    return getMinutes(a.time) - getMinutes(b.time);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Next Alarm Info */}
        {nextAlarm && (
          <View
            style={[
              styles.nextAlarmCard,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
          >
            <View style={styles.nextAlarmHeader}>
              <Ionicons name="alarm" size={20} color={colors.primary} />
              <Label
                size="small"
                weight="semibold"
                style={{ color: colors.primary, marginLeft: Spacing.xs }}
              >
                Next Alarm
              </Label>
            </View>
            <Label
              size="medium"
              weight="semibold"
              style={{ color: colors.text, marginTop: Spacing.xs }}
            >
              {nextAlarm.label} at {nextAlarm.time}
            </Label>
          </View>
        )}

        {/* Alarms List */}
        <View style={styles.alarmsContainer}>
          <View style={styles.sectionHeader}>
            <Label size="large" weight="bold" style={{ color: colors.text }}>
              Your Alarms
            </Label>
            <Label size="small" style={{ color: colors.textSecondary }}>
              {alarms.length} alarm{alarms.length !== 1 ? 's' : ''}
            </Label>
          </View>

          {sortedAlarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alarm-outline" size={64} color={colors.textTertiary} />
              <Label
                size="large"
                weight="semibold"
                style={{ color: colors.textSecondary, marginTop: Spacing.md, textAlign: 'center' }}
              >
                No Alarms Yet
              </Label>
              <Label
                size="medium"
                style={{ color: colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center' }}
              >
                Tap the + button to create your first alarm
              </Label>
            </View>
          ) : (
            sortedAlarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onPress={handleAlarmPress}
                onToggle={handleAlarmToggle}
                onDelete={handleAlarmDelete}
                style={{ marginBottom: Spacing.sm }}
              />
            ))
          )}
        </View>

        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <Label
            size="medium"
            weight="semibold"
            style={{ color: colors.text, marginBottom: Spacing.md }}
          >
            Quick Alarms
          </Label>
          <View style={styles.quickAddGrid}>
            {[15, 30, 45, 60].map((minutes) => (
              <Pressable
                key={minutes}
                style={[
                  styles.quickAddButton,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => {
                  const now = new Date();
                  const alarmTime = new Date(now.getTime() + minutes * 60000);
                  const timeString = alarmTime.toTimeString().slice(0, 5);

                  // This would open the add alarm modal with pre-filled time
                  Alert.alert(
                    'Quick Alarm',
                    `Set alarm for ${timeString}? (${minutes} minutes from now)`
                  );
                }}
              >
                <Label size="small" weight="semibold" style={{ color: colors.primary }}>
                  +{minutes}m
                </Label>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
  nextAlarmCard: {
    padding: Spacing.md,
    borderRadius: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  nextAlarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  alarmsContainer: {
    marginBottom: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  quickAddSection: {
    marginTop: Spacing.lg,
  },
  quickAddGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAddButton: {
    flex: 1,
    height: 44,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs / 2,
  },
});
