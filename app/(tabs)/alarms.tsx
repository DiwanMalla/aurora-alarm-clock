import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AlarmCard, Label } from '@/components/ui';
import { router } from 'expo-router';
import { useAlarmManagement } from '@/hooks/useStores';
import { Spacing } from '@/constants/Design';
import { useTheme } from '@/hooks/useTheme';
import { Alarm } from '@/stores/alarmStore';

// Type declarations
declare const console: {
  log: (message?: string, ...optionalParams: unknown[]) => void;
  error: (message?: string, ...optionalParams: unknown[]) => void;
};

export default function AlarmsScreen() {
  const { colors } = useTheme();
  const { alarms, updateAlarm, deleteAlarm, getNextAlarm, addAlarm } = useAlarmManagement();
  const nextAlarm = getNextAlarm();

  const handleAlarmPress = (alarm: Alarm) => {
    // Direct edit - navigate to alarm creation with the alarm data
    router.push({
      pathname: '/alarm-creation',
      params: { editingAlarm: JSON.stringify(alarm) },
    });
  };

  const handleAlarmToggle = (id: string, enabled: boolean) => {
    updateAlarm(id, { enabled });
  };

  // Navigate to preview screen
  const handleAlarmPreview = (id: string) => {
    router.push({
      pathname: '/alarm-preview',
      params: { alarmId: id },
    });
  };

  // Implement duplicate alarm functionality
  const handleAlarmDuplicate = (alarm: Alarm) => {
    // Create a new alarm with same settings but different ID and updated label
    const duplicatedAlarm: Alarm = {
      ...alarm,
      id: Date.now().toString(), // Simple ID generation
      label: `${alarm.label} Copy`,
      enabled: false, // Start disabled by default
    };

    // Add the duplicated alarm
    addAlarm(duplicatedAlarm);
  };

  const handleAlarmDelete = (id: string) => {
    deleteAlarm(id); // Remove duplicate confirmation - AlarmCard handles it
  };

  // TODO: Implement skip once functionality
  const handleAlarmSkip = (id: string) => {
    console.log('TODO: Skip alarm once', id);
    // TODO: Disable alarm for next occurrence only, then re-enable
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <StatusBar style="dark" />

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
            <View style={styles.headerRight}>
              <Label size="small" style={{ color: colors.textSecondary }}>
                {alarms.length} alarm{alarms.length !== 1 ? 's' : ''}
              </Label>
              <Pressable
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  router.push('/alarm-creation');
                }}
              >
                <Ionicons name="add" size={20} color={colors.background} />
              </Pressable>
            </View>
          </View>

          {sortedAlarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alarm-outline" size={64} color={colors.textTertiary} />
              <Label
                size="large"
                weight="semibold"
                style={[styles.emptyStateTitle, { color: colors.textSecondary }]}
              >
                No Alarms Set
              </Label>
              <Label
                size="medium"
                style={[styles.emptyStateSubtitle, { color: colors.textTertiary }]}
              >
                Tap + to create your first alarm
              </Label>
            </View>
          ) : (
            <View style={styles.alarmsList}>
              {sortedAlarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onPress={() => handleAlarmPress(alarm)}
                  onToggle={(id: string, enabled: boolean) => handleAlarmToggle(id, enabled)}
                  onDelete={() => handleAlarmDelete(alarm.id)}
                  onPreview={() => handleAlarmPreview(alarm.id)}
                  onDuplicate={() => handleAlarmDuplicate(alarm)}
                  onSkip={() => handleAlarmSkip(alarm.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  nextAlarmCard: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  nextAlarmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alarmsContainer: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateTitle: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  alarmsList: {
    gap: Spacing.sm,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
