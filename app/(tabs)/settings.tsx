import React from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Spacing } from '@/constants/Design';
import { Switch } from '@/components/ui';
import { useAppSettings, useNotificationSettings, useAudioSettings } from '@/hooks/useStores';
import { useTheme } from '@/hooks/useTheme';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  rightComponent,
  showChevron = true,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.settingsItem, { borderBottomColor: colors.border }]}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight + '20' }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingsItemRight}>
        {rightComponent}
        {showChevron && onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface }]}>{children}</View>
    </View>
  );
};

export default function SettingsScreen() {
  const { settings, setTimeFormat } = useAppSettings();
  const { theme, setTheme, colors } = useTheme();
  const { notifications, updateNotificationSettings, toggleNotifications } =
    useNotificationSettings();
  const { defaultAlarmVolume, fadeInDuration, defaultSnoozeTime } = useAudioSettings();

  const handleThemePress = () => {
    Alert.alert('Theme', 'Choose your preferred theme', [
      {
        text: 'Light',
        onPress: () => {
          setTheme('light');
        },
      },
      {
        text: 'Dark',
        onPress: () => {
          setTheme('dark');
        },
      },
      {
        text: 'Auto',
        onPress: () => {
          setTheme('auto');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTimeFormatPress = () => {
    Alert.alert('Time Format', 'Choose your preferred time format', [
      {
        text: '12 Hour',
        onPress: () => setTimeFormat('12h'),
      },
      {
        text: '24 Hour',
        onPress: () => setTimeFormat('24h'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getThemeDisplayText = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'auto':
        return 'Auto';
      default:
        return 'Light';
    }
  };

  const getTimeFormatDisplayText = () => {
    return settings.timeFormat === '24h' ? '24 Hour' : '12 Hour';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsItem
            title="Theme"
            subtitle={getThemeDisplayText()}
            icon="color-palette-outline"
            onPress={handleThemePress}
          />
          <SettingsItem
            title="Time Format"
            subtitle={getTimeFormatDisplayText()}
            icon="time-outline"
            onPress={handleTimeFormatPress}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsItem
            title="App Notifications"
            subtitle="Enable all app notifications"
            icon="notifications-outline"
            rightComponent={
              <Switch value={notifications.enabled} onValueChange={toggleNotifications} />
            }
            showChevron={false}
          />

          {/* Sub-toggles only shown when notifications are enabled */}
          {notifications.enabled && (
            <>
              <SettingsItem
                title="Bedtime Reminder"
                subtitle="Remind me when it's bedtime"
                icon="moon-outline"
                rightComponent={
                  <Switch
                    value={notifications.bedtimeReminder}
                    onValueChange={(value) =>
                      updateNotificationSettings({ bedtimeReminder: value })
                    }
                  />
                }
                showChevron={false}
              />
              <SettingsItem
                title="Sleep Insights"
                subtitle="Get insights about your sleep"
                icon="analytics-outline"
                rightComponent={
                  <Switch
                    value={notifications.sleepInsights}
                    onValueChange={(value) => updateNotificationSettings({ sleepInsights: value })}
                  />
                }
                showChevron={false}
              />
              <SettingsItem
                title="Weather Alerts"
                subtitle="Weather-based alarm adjustments"
                icon="partly-sunny-outline"
                rightComponent={
                  <Switch
                    value={notifications.weatherAlerts}
                    onValueChange={(value) => updateNotificationSettings({ weatherAlerts: value })}
                  />
                }
                showChevron={false}
              />
            </>
          )}
        </SettingsSection>

        {/* Audio Section */}
        <SettingsSection title="Audio">
          <SettingsItem
            title="Default Alarm Volume"
            subtitle={`${defaultAlarmVolume}%`}
            icon="volume-high-outline"
            onPress={() => {
              // TODO: Implement volume slider
              Alert.alert('Volume', 'Volume slider coming soon!');
            }}
          />
          <SettingsItem
            title="Fade In Duration"
            subtitle={`${fadeInDuration} seconds`}
            icon="trending-up-outline"
            onPress={() => {
              // TODO: Implement duration picker
              Alert.alert('Fade In', 'Duration picker coming soon!');
            }}
          />
          <SettingsItem
            title="Default Snooze Time"
            subtitle={`${defaultSnoozeTime} minutes`}
            icon="pause-outline"
            onPress={() => {
              // TODO: Implement snooze time picker
              Alert.alert('Snooze Time', 'Snooze time picker coming soon!');
            }}
          />
        </SettingsSection>

        {/* Smart Features Section */}
        <SettingsSection title="Smart Features">
          <SettingsItem
            title="Smart Home Integration"
            subtitle="Connect with smart devices"
            icon="home-outline"
            onPress={() => {
              Alert.alert('Smart Home', 'Smart home integration coming soon!');
            }}
          />
          <SettingsItem
            title="Health Integration"
            subtitle="Connect with health apps"
            icon="fitness-outline"
            onPress={() => {
              Alert.alert('Health', 'Health integration coming soon!');
            }}
          />
          <SettingsItem
            title="Weather Integration"
            subtitle="Weather-aware alarms"
            icon="cloudy-outline"
            onPress={() => {
              Alert.alert('Weather', 'Weather integration coming soon!');
            }}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsItem
            title="Version"
            subtitle="1.0.0"
            icon="information-circle-outline"
            showChevron={false}
          />
          <SettingsItem
            title="Privacy Policy"
            icon="shield-checkmark-outline"
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy policy coming soon!');
            }}
          />
          <SettingsItem
            title="Terms of Service"
            icon="document-text-outline"
            onPress={() => {
              Alert.alert('Terms of Service', 'Terms of service coming soon!');
            }}
          />
          <SettingsItem
            title="Contact Support"
            icon="help-circle-outline"
            onPress={() => {
              Alert.alert('Support', 'Contact support coming soon!');
            }}
          />
        </SettingsSection>

        {/* Reset Section */}
        <SettingsSection title="Reset">
          <SettingsItem
            title="Reset All Settings"
            subtitle="Restore default settings"
            icon="refresh-outline"
            onPress={() => {
              Alert.alert(
                'Reset Settings',
                'Are you sure you want to reset all settings to defaults? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                      // TODO: Implement reset
                      Alert.alert('Reset', 'Reset functionality coming soon!');
                    },
                  },
                ]
              );
            }}
            showChevron={false}
          />
        </SettingsSection>
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
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.title1,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.headline,
    fontWeight: '600',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    ...Typography.body,
    fontWeight: '500',
  },
  settingsSubtitle: {
    ...Typography.footnote,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
});
