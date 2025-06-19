import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

const styles = StyleSheet.create({
  tabIcon: {
    marginBottom: -3,
  },
});

// Tab bar icon component
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={24} style={styles.tabIcon} {...props} />;
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false, // Hide all headers/page titles
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
      }}
    >
      {/* Clock/Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock',
          tabBarIcon: ({ color }) => <TabBarIcon name="time-outline" color={color} />,
        }}
      />

      {/* Alarms Tab */}
      <Tabs.Screen
        name="alarms"
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color }) => <TabBarIcon name="alarm-outline" color={color} />,
        }}
      />

      {/* Timer Tab */}
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <TabBarIcon name="timer-outline" color={color} />,
        }}
      />

      {/* Stopwatch Tab */}
      <Tabs.Screen
        name="stopwatch"
        options={{
          title: 'Stopwatch',
          tabBarIcon: ({ color }) => <TabBarIcon name="stopwatch-outline" color={color} />,
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
