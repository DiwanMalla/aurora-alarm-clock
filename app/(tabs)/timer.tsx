import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Label } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Design';
import { audioManager } from '@/lib/simpleAudioManager';
import { notificationManager } from '@/lib/notificationManager';
import * as Haptics from 'expo-haptics';

// Type declarations for timer functions
declare const setInterval: (callback: () => void, ms: number) => number;
declare const clearInterval: (id: number) => void;
declare const console: {
  error: (message?: string, ...optionalParams: unknown[]) => void;
};

export default function TimerScreen() {
  const { colors, isDark } = useTheme();
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Preset timer values (in minutes)
  const presets = [1, 3, 5, 10, 15, 30, 45, 60];

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsPaused(false);
            // Play timer sound and add strong haptic feedback
            audioManager.playTimerSound().catch(console.error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
              // Ignore haptic errors - not critical
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!isRunning && !isPaused) {
      // Starting fresh
      const totalSeconds = minutes * 60 + seconds;
      setTimeLeft(totalSeconds);

      // Schedule notification for when timer completes
      notificationManager
        .scheduleTimerNotification(totalSeconds, 'Timer Complete')
        .catch(console.error);
    }
    setIsRunning(true);
    setIsPaused(false);

    // Add haptic feedback for start action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Ignore haptic errors - not critical
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);

    // Add haptic feedback for pause action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Ignore haptic errors - not critical
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);

    // Add haptic feedback for reset action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Ignore haptic errors - not critical
    });
  };

  const handlePresetSelect = (preset: number) => {
    if (!isRunning) {
      setMinutes(preset);
      setSeconds(0);
      setTimeLeft(0);
      setIsPaused(false);
    }
  };

  const adjustMinutes = (delta: number) => {
    if (!isRunning) {
      setMinutes(Math.max(0, Math.min(99, minutes + delta)));
    }
  };

  const adjustSeconds = (delta: number) => {
    if (!isRunning) {
      setSeconds(Math.max(0, Math.min(59, seconds + delta)));
    }
  };

  const displayTime = isRunning || isPaused ? timeLeft : minutes * 60 + seconds;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Label size="large" weight="bold" style={{ color: colors.text }}>
            Timer
          </Label>
        </View>

        {/* Main Timer Display */}
        <View style={styles.timerContainer}>
          <View
            style={[
              styles.timerCircle,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Label size="large" weight="regular" style={[styles.timerText, { color: colors.text }]}>
              {formatTime(displayTime)}
            </Label>
          </View>
        </View>

        {/* Time Adjustment Controls */}
        {!isRunning && !isPaused && (
          <View style={styles.adjustmentContainer}>
            <View style={styles.adjustmentGroup}>
              <Label size="medium" weight="semibold" style={{ color: colors.textSecondary }}>
                Minutes
              </Label>
              <View style={styles.adjustmentRow}>
                <Pressable
                  style={[styles.adjustButton, { backgroundColor: colors.surface }]}
                  onPress={() => adjustMinutes(-1)}
                >
                  <Ionicons name="remove" size={24} color={colors.text} />
                </Pressable>
                <Label
                  size="large"
                  weight="bold"
                  style={[styles.adjustValue, { color: colors.text }]}
                >
                  {minutes.toString().padStart(2, '0')}
                </Label>
                <Pressable
                  style={[styles.adjustButton, { backgroundColor: colors.surface }]}
                  onPress={() => adjustMinutes(1)}
                >
                  <Ionicons name="add" size={24} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.adjustmentGroup}>
              <Label size="medium" weight="semibold" style={{ color: colors.textSecondary }}>
                Seconds
              </Label>
              <View style={styles.adjustmentRow}>
                <Pressable
                  style={[styles.adjustButton, { backgroundColor: colors.surface }]}
                  onPress={() => adjustSeconds(-1)}
                >
                  <Ionicons name="remove" size={24} color={colors.text} />
                </Pressable>
                <Label
                  size="large"
                  weight="bold"
                  style={[styles.adjustValue, { color: colors.text }]}
                >
                  {seconds.toString().padStart(2, '0')}
                </Label>
                <Pressable
                  style={[styles.adjustButton, { backgroundColor: colors.surface }]}
                  onPress={() => adjustSeconds(1)}
                >
                  <Ionicons name="add" size={24} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Preset Buttons */}
        {!isRunning && !isPaused && (
          <View style={styles.presetsContainer}>
            <Label
              size="medium"
              weight="semibold"
              style={{ color: colors.textSecondary, marginBottom: Spacing.md }}
            >
              Quick Set
            </Label>
            <View style={styles.presetsGrid}>
              {presets.map((preset) => (
                <Pressable
                  key={preset}
                  style={[
                    styles.presetButton,
                    {
                      backgroundColor: minutes === preset ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                >
                  <Label
                    size="medium"
                    weight="semibold"
                    style={{
                      color: minutes === preset ? colors.background : colors.text,
                    }}
                  >
                    {preset}m
                  </Label>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!isRunning && !isPaused && (
            <Pressable
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
                minutes === 0 && seconds === 0 && styles.disabledButton,
              ]}
              onPress={handleStart}
              disabled={minutes === 0 && seconds === 0}
            >
              <Ionicons name="play" size={24} color={colors.background} />
              <Label size="large" weight="semibold" style={{ color: colors.background }}>
                Start
              </Label>
            </Pressable>
          )}

          {isRunning && (
            <Pressable
              style={[styles.primaryButton, { backgroundColor: colors.warning || colors.primary }]}
              onPress={handlePause}
            >
              <Ionicons name="pause" size={24} color={colors.background} />
              <Label size="large" weight="semibold" style={{ color: colors.background }}>
                Pause
              </Label>
            </Pressable>
          )}

          {isPaused && (
            <View style={styles.pausedControls}>
              <Pressable
                style={[styles.secondaryButton, { backgroundColor: colors.primary }]}
                onPress={handleStart}
              >
                <Ionicons name="play" size={20} color={colors.background} />
                <Label size="medium" weight="semibold" style={{ color: colors.background }}>
                  Resume
                </Label>
              </Pressable>
              <Pressable
                style={[
                  styles.secondaryButton,
                  styles.borderedButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleReset}
              >
                <Ionicons name="refresh" size={20} color={colors.text} />
                <Label size="medium" weight="semibold" style={{ color: colors.text }}>
                  Reset
                </Label>
              </Pressable>
            </View>
          )}

          {(isRunning || isPaused) && (
            <Pressable
              style={[
                styles.resetButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
  },
  timerText: {
    fontSize: 42,
    fontWeight: '200',
    letterSpacing: -2,
    textAlign: 'center',
    lineHeight: 50,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: -4,
  },
  adjustmentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.xs,
    gap: Spacing.md,
  },
  adjustmentGroup: {
    alignItems: 'center',
    flex: 1,
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    justifyContent: 'center',
  },
  adjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  adjustValue: {
    minWidth: 36,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  presetsContainer: {
    marginBottom: Spacing.xl,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  presetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  controlsContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 25,
    gap: Spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    gap: Spacing.xs,
    flex: 1,
  },
  pausedControls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  borderedButton: {
    borderWidth: 1,
  },
});
