import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Card } from '@/components/Card';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { formatDate, formatTime } from '@/lib/utils';

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const { isLandscape, isTablet, window } = useDeviceOrientation();
  const { storedValue: userName, setValue: setUserName } = useAsyncStorage('userName', 'Guest');

  const handleButtonPress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success!', 'Button pressed successfully');
    }, 2000);
  };

  const handleNameChange = () => {
    Alert.prompt(
      'Change Name',
      'Enter your name:',
      (text) => {
        if (text) {
          setUserName(text);
        }
      },
      'plain-text',
      userName
    );
  };

  const currentTime = new Date();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
        <Text style={styles.subtitle}>
          {formatDate(currentTime, 'long')} • {formatTime(currentTime)}
        </Text>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceText}>
            Device: {isTablet ? 'Tablet' : 'Phone'} • {isLandscape ? 'Landscape' : 'Portrait'}
          </Text>
          <Text style={styles.deviceText}>
            Screen: {Math.round(window.width)}×{Math.round(window.height)}
          </Text>
        </View>

        <Card
          title="Welcome to Your App"
          subtitle="This is a React Native app built with Expo Router and modern mobile patterns"
          onPress={() => Alert.alert('Card Pressed', 'You tapped the welcome card!')}
        >
          <Text style={styles.cardContent}>
            • Touch-first design with haptic feedback • Smooth animations with Reanimated •
            TypeScript for type safety • Custom hooks for device orientation and storage • Beautiful
            cards and buttons
          </Text>
        </Card>

        <Card title="Actions">
          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Primary Action"
              onPress={handleButtonPress}
              variant="primary"
              loading={loading}
              size="large"
            />

            <AnimatedButton
              title="Change Name"
              onPress={handleNameChange}
              variant="secondary"
              size="medium"
            />

            <AnimatedButton
              title="Outline Button"
              onPress={() => Alert.alert('Outline', 'Outline button pressed!')}
              variant="outline"
              size="small"
            />
          </View>
        </Card>

        {loading && (
          <Card title="Loading">
            <LoadingSpinner size="large" text="Processing your request..." color="#007AFF" />
          </Card>
        )}

        <Card title="Performance Features" subtitle="Built with performance in mind">
          <Text style={styles.cardContent}>
            • Optimized animations running at 60fps • Efficient state management • Proper TypeScript
            integration • Platform-specific optimizations • Responsive design for all screen sizes
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  deviceInfo: {
    backgroundColor: '#E5E5EA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  deviceText: {
    fontSize: 14,
    color: '#1C1C1E',
    textAlign: 'center',
  },
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1C1C1E',
  },
  buttonContainer: {
    gap: 12,
  },
});
