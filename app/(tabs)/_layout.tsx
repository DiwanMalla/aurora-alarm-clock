import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, Platform } from 'react-native';

import { Colors } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Tab bar icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* Clock/Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Clock',
          tabBarIcon: ({ color }) => <TabBarIcon name="time-outline" color={color} />,
          headerTitle: 'Aurora Clock',
        }}
      />
      
      {/* Alarms Tab */}
      <Tabs.Screen
        name="alarms"
        options={{
          title: 'Alarms',
          tabBarIcon: ({ color }) => <TabBarIcon name="alarm-outline" color={color} />,
          headerTitle: 'Alarms',
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="add"
                    size={24}
                    color={colors.primary}
                    style={{ 
                      marginRight: 15, 
                      opacity: pressed ? 0.5 : 1 
                    }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      
      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          headerTitle: 'Settings',
        }}
      />
      
      {/* Hide demo tab from production */}
      <Tabs.Screen
        name="demo"
        options={{
          href: __DEV__ ? '/demo' : null,
          title: 'Demo',
          tabBarIcon: ({ color }) => <TabBarIcon name="flask-outline" color={color} />,
          headerTitle: 'Demo',
        }}
      />
    </Tabs>
  );
}
