import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { useAlarms } from '@/hooks/useStores';
import { Typography, Spacing } from '@/constants/Design';
import { workingAudioManager } from '@/lib/workingAudioManager';
import { alarmScheduler } from '@/lib/alarmScheduler';
import * as Haptics from 'expo-haptics';

// Type declarations
declare const console: {
  log: (message?: string, ...optionalParams: unknown[]) => void;
  error: (message?: string, ...optionalParams: unknown[]) => void;
};

export default function AlarmPreviewScreen() {
  const { colors } = useTheme();
  const { getAlarmById } = useAlarms();
  const { alarmId } = useLocalSearchParams<{ alarmId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Debug logging
  console.log('AlarmPreviewScreen: alarmId:', alarmId);
  console.log('AlarmPreviewScreen: getAlarmById available:', !!getAlarmById);

  // Find the alarm
  const alarm = alarmId && getAlarmById ? getAlarmById(alarmId) : null;

  console.log('AlarmPreviewScreen: alarm found:', alarm);

  const mapSoundNameToId = (soundName: string): string => {
    switch (soundName.toLowerCase()) {
      case 'emergency alarm':
        return 'emergency-alarm';
      case 'classic alarm':
        return 'alarm-classic';
      case 'gentle wake':
        return 'alarm-gentle';
      case 'notification':
        return 'notification';
      case 'system default':
        return 'system-default';
      default:
        return 'emergency-alarm';
    }
  };

  useEffect(() => {
    if (!alarm) {
      router.back();
      return;
    }

    let hasStarted = false;

    const startPreview = async () => {
      if (!alarm || hasStarted) return;
      hasStarted = true;

      try {
        setIsPlaying(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        if (alarm.vibration.enabled) {
          const vibrationPattern =
            alarm.vibration.pattern.length > 0 ? alarm.vibration.pattern : [0, 500, 200, 500];
          Vibration.vibrate(vibrationPattern, true);
        }
        const soundId = mapSoundNameToId(alarm.sound?.name || 'Emergency Alarm');
        await workingAudioManager.playAlarm(soundId, {
          loop: true,
          volume: (alarm.sound?.volume || 80) / 100,
        });
        console.log(`🔊 Playing preview for alarm: ${alarm.label}`);
      } catch (error) {
        console.error('❌ Failed to start alarm preview:', error);
        setIsPlaying(false);
      }
    };

    const stopPreview = async () => {
      console.log('🛑 CLEANUP: Stopping preview on unmount');
      try {
        await alarmScheduler.stopCurrentAlarm();
        await workingAudioManager.forceStopAllAudio();
        await workingAudioManager.stopAlarm();
        await workingAudioManager.cleanup();
        Vibration.cancel();
        setIsPlaying(false);
        console.log('🔇 Cleanup: Preview stopped');
      } catch (error) {
        console.error('❌ Cleanup: Failed to stop alarm preview:', error);
      }
    };

    startPreview();
    return () => {
      stopPreview(); // Always stop on unmount
    };
  }, [alarm]); // REMOVED isPlaying and alarmId from dependencies

  const handleClose = async () => {
    if (isStopping) return; // Prevent multiple stop attempts

    console.log('🔇 EMERGENCY STOP - Stopping preview...');
    setIsStopping(true);

    // IMMEDIATE STOP ACTIONS
    setIsPlaying(false);

    // Stop vibration immediately
    Vibration.cancel();
    console.log('✅ Vibration cancelled immediately');

    try {
      // FIRST: Use alarm scheduler to properly stop any coordinated alarm
      console.log('🚨 Using alarm scheduler to stop');
      await alarmScheduler.stopCurrentAlarm();

      // SECOND: Use the force stop method as backup
      console.log('🚨 Using FORCE STOP method');
      await workingAudioManager.forceStopAllAudio();

      console.log('🛑 Additional stop attempts');
      await workingAudioManager.stopAlarm();
      await workingAudioManager.cleanup();

      console.log('✅ All stop attempts completed');
    } catch (error) {
      console.error('❌ Failed to stop alarm preview:', error);
    }

    // Cancel vibration again just to be sure
    Vibration.cancel();

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('🚪 Navigating back...');
    router.back();
  };

  if (!alarm) {
    return null;
  }

  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header removed for preview mode */}
      <View style={styles.content}>
        <View style={[styles.previewBadge, { backgroundColor: colors.accent + '20' }]}>
          <Ionicons name="eye-outline" size={16} color={colors.accent} />
          <Text style={[styles.previewText, { color: colors.accent }]}>PREVIEW MODE</Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={[styles.currentTime, { color: colors.text }]}>{currentTime}</Text>
          <Text style={[styles.alarmLabel, { color: colors.textSecondary }]}>
            {alarm.label || 'Alarm'}
          </Text>
        </View>

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.primary + '20',
              transform: [{ scale: isPlaying ? 1.1 : 1.0 }],
            },
          ]}
        >
          <Ionicons
            name={isPlaying ? 'alarm' : 'alarm-outline'}
            size={120}
            color={colors.primary}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="volume-medium-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {alarm.sound?.name || 'Emergency Alarm'}
            </Text>
          </View>

          {alarm.vibration.enabled && (
            <View style={styles.detailRow}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>Vibration Enabled</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons name="volume-high-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              Volume: {alarm.sound?.volume || 80}%
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: colors.error,
            },
          ]}
          onPress={handleClose}
        >
          <Ionicons name="stop" size={24} color={colors.surface} />
          <Text style={[styles.controlButtonText, { color: colors.surface }]}>Stop Preview</Text>
        </TouchableOpacity>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          This is how your alarm will look and sound when it goes off.
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  previewText: {
    ...Typography.caption1,
    fontWeight: '600',
    letterSpacing: 1,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  currentTime: {
    ...Typography.largeTitle,
    fontWeight: '300',
    fontSize: 64,
  },
  alarmLabel: {
    ...Typography.title2,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  detailsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    ...Typography.body,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    minWidth: 180,
  },
  controlButtonText: {
    ...Typography.body,
    fontWeight: '600',
  },
  infoText: {
    ...Typography.caption1,
    textAlign: 'center',
    lineHeight: 18,
  },
});
