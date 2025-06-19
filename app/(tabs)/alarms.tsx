import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AlarmCard, Label } from '@/components/ui';
import { router } from 'expo-router';
import { useAlarmManagement } from '@/hooks/useStores';
import { Spacing } from '@/constants/Design';
import { useTheme } from '@/hooks/useTheme';
import { Alarm } from '@/stores/alarmStore';

export default function AlarmsScreen() {
  const { colors, isDark } = useTheme();

  const { alarms, updateAlarm, deleteAlarm, getNextAlarm } = useAlarmManagement();
  const nextAlarm = getNextAlarm();

  const handleAlarmPress = (alarm: Alarm) => {
    Alert.alert(
      'Alarm Details',
      `Label: ${alarm.label}\nTime: ${alarm.time}\nEnabled: ${alarm.enabled ? 'Yes' : 'No'}`,
      [
        {
          text: 'Edit',
          onPress: () => {
            router.push('/alarm-creation');
          },
        },
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

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
                  onEdit={() => {
                    router.push('/alarm-creation');
                  }}
                  onSkip={() => {
                    Alert.alert('Skip Alarm', 'Next occurrence will be skipped', [{ text: 'OK' }]);
                  }}
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
});
