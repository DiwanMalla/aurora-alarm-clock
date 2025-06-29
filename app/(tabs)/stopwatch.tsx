import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Label } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/Design';
import * as Haptics from 'expo-haptics';

// Type declarations for timer functions
declare const setInterval: (callback: () => void, ms: number) => number;
declare const clearInterval: (id: number) => void;

interface LapTime {
  id: number;
  time: number;
  total: number;
}

export default function StopwatchScreen() {
  const { colors, isDark } = useTheme();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10); // 10ms increments for precision
      }, 10);
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
  }, [isRunning]);

  const formatTime = (totalMs: number) => {
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((totalMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);

    // Add haptic feedback for start action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Ignore haptic errors - not critical
    });
  };

  const handleStop = () => {
    setIsRunning(false);

    // Add haptic feedback for stop action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {
      // Ignore haptic errors - not critical
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);

    // Add haptic feedback for reset action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
      // Ignore haptic errors - not critical
    });
  };

  const handleLap = () => {
    if (isRunning && time > 0) {
      const lastTotal = laps.length > 0 ? laps[laps.length - 1].total : 0;
      const lapTime = time - lastTotal;
      const newLap: LapTime = {
        id: laps.length + 1,
        time: lapTime,
        total: time,
      };
      setLaps((prev) => [...prev, newLap]);

      // Add haptic feedback for lap recording
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Ignore haptic errors - not critical
      });
    }
  };

  const getFastestLap = () => {
    if (laps.length === 0) return null;
    return Math.min(...laps.map((lap) => lap.time));
  };

  const getSlowestLap = () => {
    if (laps.length === 0) return null;
    return Math.max(...laps.map((lap) => lap.time));
  };

  const fastestLap = getFastestLap();
  const slowestLap = getSlowestLap();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Label size="large" weight="bold" style={{ color: colors.text }}>
              Stopwatch
            </Label>
          </View>

          {/* Main Timer Display */}
          <View style={styles.timerContainer}>
            <View
              style={[
                styles.timerCircle,
                {
                  borderColor: isRunning ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Label
                size="large"
                weight="regular"
                style={[styles.timerText, { color: colors.text }]}
              >
                {formatTime(time)}
              </Label>
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            <View style={styles.mainControls}>
              {!isRunning ? (
                <>
                  <Pressable
                    style={[
                      styles.controlButton,
                      styles.resetButton,
                      time === 0 && styles.disabledButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={handleReset}
                    disabled={time === 0}
                  >
                    <Label size="medium" weight="semibold" style={{ color: colors.textSecondary }}>
                      Reset
                    </Label>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.controlButton,
                      styles.startButton,
                      { backgroundColor: colors.success || colors.primary },
                    ]}
                    onPress={handleStart}
                  >
                    <Label size="medium" weight="semibold" style={{ color: colors.background }}>
                      Start
                    </Label>
                  </Pressable>
                </>
              ) : (
                <>
                  <Pressable
                    style={[
                      styles.controlButton,
                      styles.lapButton,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={handleLap}
                    disabled={time === 0}
                  >
                    <Label size="medium" weight="semibold" style={{ color: colors.text }}>
                      Lap
                    </Label>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.controlButton,
                      styles.stopButton,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={handleStop}
                  >
                    <Label size="medium" weight="semibold" style={{ color: colors.background }}>
                      Stop
                    </Label>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Laps List */}
          {laps.length > 0 && (
            <View style={styles.lapsContainer}>
              <Label
                size="medium"
                weight="semibold"
                style={{ color: colors.textSecondary, marginBottom: Spacing.md }}
              >
                Laps
              </Label>
              <ScrollView style={styles.lapsList} showsVerticalScrollIndicator={false}>
                {laps
                  .slice()
                  .reverse()
                  .map((lap, _index) => {
                    const isFastest =
                      fastestLap !== null && lap.time === fastestLap && laps.length > 1;
                    const isSlowest =
                      slowestLap !== null && lap.time === slowestLap && laps.length > 1;

                    return (
                      <View
                        key={lap.id}
                        style={[
                          styles.lapItem,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.lapHeader}>
                          <Label size="medium" weight="semibold" style={{ color: colors.text }}>
                            Lap {lap.id}
                          </Label>
                          {isFastest && (
                            <View
                              style={[
                                styles.lapBadge,
                                { backgroundColor: colors.success || colors.primary },
                              ]}
                            >
                              <Label
                                size="small"
                                weight="semibold"
                                style={{ color: colors.background }}
                              >
                                Best
                              </Label>
                            </View>
                          )}
                          {isSlowest && (
                            <View
                              style={[
                                styles.lapBadge,
                                { backgroundColor: colors.warning || colors.error },
                              ]}
                            >
                              <Label
                                size="small"
                                weight="semibold"
                                style={{ color: colors.background }}
                              >
                                Worst
                              </Label>
                            </View>
                          )}
                        </View>
                        <View style={styles.lapTimes}>
                          <Label size="large" weight="bold" style={{ color: colors.text }}>
                            {formatTime(lap.time)}
                          </Label>
                          <Label size="small" style={{ color: colors.textSecondary }}>
                            Total: {formatTime(lap.total)}
                          </Label>
                        </View>
                      </View>
                    );
                  })}
              </ScrollView>
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
    flexGrow: 1,
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
    fontSize: 32,
    fontWeight: '200',
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 40,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: -2,
  },
  controlsContainer: {
    marginBottom: Spacing.lg,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  controlButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    // Specific styling for start button
  },
  stopButton: {
    // Specific styling for stop button
  },
  resetButton: {
    borderWidth: 1,
  },
  lapButton: {
    borderWidth: 1,
  },
  lapsContainer: {
    flex: 1,
  },
  lapsList: {
    flex: 1,
  },
  lapItem: {
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  lapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  lapBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lapTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
