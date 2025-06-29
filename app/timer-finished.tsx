import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/Design';
import { workingAudioManager } from '@/lib/workingAudioManager';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function TimerFinishedScreen() {
  const { colors } = useTheme();
  const { duration } = useLocalSearchParams<{ duration: string }>();
  const [isPlaying, setIsPlaying] = useState(true);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  // Setup animations
  useEffect(() => {
    // Entrance animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulsing animation for the main icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Ripple effect
    const rippleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    );

    // Sparkle animations with staggered timing
    const sparkleAnimations = sparkleAnims.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 300),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.delay(1200),
        ])
      )
    );

    // Start all animations
    floatAnimation.start();
    pulseAnimation.start();
    rippleAnimation.start();
    sparkleAnimations.forEach((anim) => anim.start());

    return () => {
      floatAnimation.stop();
      pulseAnimation.stop();
      rippleAnimation.stop();
      sparkleAnimations.forEach((anim) => anim.stop());
    };
  }, [pulseAnim, scaleAnim, floatAnim, rippleAnim, sparkleAnims]);

  // Start timer alerts
  useEffect(() => {
    const startAlerts = async () => {
      try {
        // Play timer sound on loop
        await workingAudioManager.playTimerSound(true);
        setIsPlaying(true);

        // Strong haptic feedback pattern
        const hapticPattern = async () => {
          for (let i = 0; i < 3; i++) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Use a promise-based delay without setTimeout
            await new Promise((resolve) => {
              // eslint-disable-next-line no-undef
              setTimeout(resolve, 200);
            });
          }
        };
        await hapticPattern();
      } catch (error) {
        console.error('Error starting timer alerts:', error);
      }
    };

    startAlerts();

    return () => {
      workingAudioManager.forceStopAllAudio().catch(console.error);
    };
  }, []);

  const handleStop = async () => {
    try {
      // Stop all audio
      await workingAudioManager.forceStopAllAudio();
      setIsPlaying(false);

      // Exit animation
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Haptic feedback for stop action
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Go back to timer screen
        router.back();
      });
    } catch (error) {
      console.error('Error stopping timer alerts:', error);
    }
  };

  const formatDuration = (seconds: string | undefined) => {
    if (!seconds) return '5 minutes';
    const totalSeconds = parseInt(seconds, 10);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    if (mins === 0) return `${secs} second${secs !== 1 ? 's' : ''}`;
    if (secs === 0) return `${mins} minute${mins !== 1 ? 's' : ''}`;
    return `${mins}m ${secs}s`;
  };

  const sparklePositions = [
    { top: screenHeight * 0.2, left: screenWidth * 0.15 },
    { top: screenHeight * 0.25, right: screenWidth * 0.2 },
    { top: screenHeight * 0.35, left: screenWidth * 0.1 },
    { top: screenHeight * 0.4, right: screenWidth * 0.15 },
    { top: screenHeight * 0.6, left: screenWidth * 0.2 },
    { top: screenHeight * 0.65, right: screenWidth * 0.25 },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <LinearGradient
        colors={[colors.background, colors.surface, colors.background]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated sparkles */}
        {sparkleAnims.map((anim, index) => {
          const position = sparklePositions[index];
          return (
            <Animated.View
              key={index}
              style={[
                styles.sparkle,
                position,
                {
                  opacity: anim,
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      rotate: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="sparkles" size={16} color={colors.accent} />
            </Animated.View>
          );
        })}

        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          {/* Hero Section with floating and ripple effects */}
          <View style={styles.heroSection}>
            {/* Ripple effects behind the main icon */}
            <Animated.View
              style={[
                styles.ripple,
                {
                  opacity: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.ripple,
                styles.rippleSecondary,
                {
                  opacity: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0],
                  }),
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }, { translateY: floatAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={[colors.primary, colors.accent, colors.primary]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconInner}>
                  <Ionicons name="checkmark-circle" size={56} color={colors.background} />
                </View>
              </LinearGradient>
            </Animated.View>

            <Text style={[styles.title, { color: colors.text }]}>Timer Complete!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Your {formatDuration(duration)} timer has finished
            </Text>
          </View>

          {/* Modern Status Card */}
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statusHeader}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: isPlaying ? colors.success : colors.textSecondary },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {isPlaying ? 'Alert Active' : 'Alert Stopped'}
              </Text>
            </View>

            {/* Audio visualization */}
            <View style={styles.audioVisualization}>
              {[...Array(7)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.audioBar,
                    {
                      backgroundColor: isPlaying ? colors.primary : colors.textSecondary,
                      transform: [
                        {
                          scaleY: isPlaying
                            ? pulseAnim.interpolate({
                                inputRange: [1, 1.1],
                                outputRange: [0.4 + i * 0.15, 1 - i * 0.1],
                              })
                            : new Animated.Value(0.2),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Modern Dismiss Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.dismissButton, { backgroundColor: colors.primary }]}
              onPress={handleStop}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="stop-circle" size={24} color={colors.background} />
                  <Text style={[styles.buttonText, { color: colors.background }]}>Dismiss</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Subtle instruction */}
          <View style={styles.instructionSection}>
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              Tap dismiss to stop the alert
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },

  // Sparkle effects
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: screenHeight * 0.05,
    position: 'relative',
  },

  // Ripple effects
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(103, 80, 164, 0.3)',
    top: -50,
  },
  rippleSecondary: {
    borderColor: 'rgba(159, 122, 234, 0.2)',
  },

  iconContainer: {
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 16,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  iconInner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    padding: Spacing.md,
  },

  title: {
    ...Typography.largeTitle,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...Typography.title2,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },

  // Status Card
  statusCard: {
    borderRadius: 24,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  statusText: {
    ...Typography.headline,
    fontSize: 16,
    fontWeight: '600',
  },

  // Audio Visualization
  audioVisualization: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    height: 32,
  },
  audioBar: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },

  // Action Section
  actionSection: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  dismissButton: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  buttonGradient: {
    borderRadius: 20,
    minWidth: screenWidth * 0.65,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl * 1.5,
  },
  buttonText: {
    ...Typography.headline,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: Spacing.sm,
    letterSpacing: 0.5,
  },

  // Instruction Section
  instructionSection: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  instructionText: {
    ...Typography.caption1,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});
