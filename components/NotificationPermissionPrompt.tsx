import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/Design';
import { notificationManager } from '@/lib/notificationManager';
import { useSettingsStore } from '@/stores/settingsStore';

interface NotificationPermissionPromptProps {
  onPermissionResult?: (granted: boolean) => void;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  onPermissionResult,
}) => {
  const { colors } = useTheme();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    try {
      const granted = await notificationManager.requestPermissions();
      onPermissionResult?.(granted);

      if (granted) {
        Alert.alert('Notifications Enabled!', "You'll now receive timer and alarm notifications.", [
          { text: 'Great!', style: 'default' },
        ]);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSkip = () => {
    // Mark permission as asked so we don't show this again
    const { markPermissionAsAsked } = useSettingsStore.getState();
    markPermissionAsAsked();
    onPermissionResult?.(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
          <Ionicons name="notifications" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Stay on Time with Notifications</Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Get timely alerts for your alarms and timers, even when the app is in the background.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="alarm" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>Alarm notifications</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="timer" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Timer completion alerts
            </Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="settings" size={20} color={colors.primary} />
            <Text style={[styles.featureText, { color: colors.text }]}>
              Customizable in Settings
            </Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleRequestPermissions}
            disabled={isRequesting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.primaryButtonText, { color: colors.background }]}>
                {isRequesting ? 'Requesting...' : 'Enable Notifications'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={handleSkip}
            disabled={isRequesting}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export const useNotificationPermissions = () => {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { notifications } = useSettingsStore.getState().settings;

        // Show prompt if notifications are enabled but permission hasn't been asked
        // and status is undetermined
        if (
          notifications.enabled &&
          !notifications.permissionAsked &&
          notifications.permissionStatus === 'undetermined'
        ) {
          setShouldShowPrompt(true);
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();

    // Also listen to settings changes to show prompt when notifications are enabled
    const unsubscribe = useSettingsStore.subscribe((state) => {
      const { notifications } = state.settings;
      if (
        notifications.enabled &&
        !notifications.permissionAsked &&
        notifications.permissionStatus === 'undetermined'
      ) {
        setShouldShowPrompt(true);
      }
    });

    return unsubscribe;
  }, []);

  return {
    shouldShowPrompt,
    isLoading,
    setShouldShowPrompt,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.largeTitle,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  features: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureText: {
    ...Typography.body,
    fontSize: 16,
    marginLeft: Spacing.md,
    flex: 1,
  },
  buttons: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    borderRadius: 16,
  },
  primaryButtonText: {
    ...Typography.headline,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.headline,
    fontSize: 16,
    fontWeight: '500',
  },
});
