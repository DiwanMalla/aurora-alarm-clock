import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Label } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Design';

export default function TimerScreen() {
  const { colors, isDark } = useTheme();
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            Alert.alert('Timer', "Time's up!", [{ text: 'OK' }]);
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
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(0);
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
                {
                  backgroundColor: colors.primary,
                  opacity: minutes === 0 && seconds === 0 ? 0.5 : 1,
                },
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
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 },
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
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -2,
  },
  adjustmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.xl,
  },
  adjustmentGroup: {
    alignItems: 'center',
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  adjustValue: {
    minWidth: 50,
    textAlign: 'center',
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
});
