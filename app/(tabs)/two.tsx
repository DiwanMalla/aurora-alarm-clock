import React, { useState } from 'react';
import { StyleSheet, ScrollView, FlatList, Alert } from 'react-native';

import { Text, View } from '@/components/Themed';
import { Card } from '@/components/Card';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useKeyboard } from '@/hooks/useKeyboard';
import { hapticFeedback } from '@/lib/haptics';

interface ExploreItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const exploreData: ExploreItem[] = [
  {
    id: '1',
    title: 'Haptic Feedback',
    description: 'Experience different types of haptic feedback',
    icon: '📳',
  },
  {
    id: '2',
    title: 'Animations',
    description: 'Smooth 60fps animations with Reanimated',
    icon: '✨',
  },
  {
    id: '3',
    title: 'Responsive Design',
    description: 'Adapts to different screen sizes and orientations',
    icon: '📱',
  },
  {
    id: '4',
    title: 'TypeScript',
    description: 'Full type safety throughout the application',
    icon: '🔒',
  },
  {
    id: '5',
    title: 'Modern Patterns',
    description: 'Following the latest React Native best practices',
    icon: '🚀',
  },
];

export default function ExploreScreen() {
  const [loading, setLoading] = useState(false);
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  const handleHapticTest = (type: string) => {
    switch (type) {
      case 'light':
        hapticFeedback.light();
        break;
      case 'medium':
        hapticFeedback.medium();
        break;
      case 'heavy':
        hapticFeedback.heavy();
        break;
      case 'success':
        hapticFeedback.success();
        break;
      case 'warning':
        hapticFeedback.warning();
        break;
      case 'error':
        hapticFeedback.error();
        break;
    }
    Alert.alert('Haptic Feedback', `${type} haptic feedback triggered!`);
  };

  const renderExploreItem = ({ item }: { item: ExploreItem }) => (
    <Card
      title={`${item.icon} ${item.title}`}
      subtitle={item.description}
      onPress={() => {
        if (item.title === 'Haptic Feedback') {
          Alert.alert('Choose Haptic Type', 'Select the type of haptic feedback to test:', [
            { text: 'Light', onPress: () => handleHapticTest('light') },
            { text: 'Medium', onPress: () => handleHapticTest('medium') },
            { text: 'Heavy', onPress: () => handleHapticTest('heavy') },
            { text: 'Success', onPress: () => handleHapticTest('success') },
            { text: 'Warning', onPress: () => handleHapticTest('warning') },
            { text: 'Error', onPress: () => handleHapticTest('error') },
            { text: 'Cancel', style: 'cancel' },
          ]);
        } else {
          Alert.alert(item.title, item.description);
        }
      }}
      style={styles.exploreItem}
    >
      <Text>Tap to explore this feature</Text>
    </Card>
  );

  const handleLoadingTest = () => {
    setLoading(true);
    (globalThis as typeof globalThis).setTimeout(() => {
      setLoading(false);
      hapticFeedback.success();
      Alert.alert('Complete!', 'Loading test completed successfully');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Explore Features</Text>
        <Text style={styles.subtitle}>Discover what makes this app special</Text>

        {isKeyboardVisible && (
          <Card title="Keyboard Info" style={styles.keyboardInfo}>
            <Text style={styles.keyboardText}>
              Keyboard is visible! Height: {Math.round(keyboardHeight)}px
            </Text>
          </Card>
        )}

        <FlatList
          data={exploreData}
          renderItem={renderExploreItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          style={styles.list}
        />

        <Card title="Interactive Tests">
          <View style={styles.buttonContainer}>
            <AnimatedButton
              title="Test Loading Animation"
              onPress={handleLoadingTest}
              variant="primary"
              size="large"
              loading={loading}
            />

            <AnimatedButton
              title="Trigger Success Haptic"
              onPress={() => handleHapticTest('success')}
              variant="secondary"
              size="medium"
            />
          </View>
        </Card>

        {loading && (
          <Card title="Loading Test">
            <LoadingSpinner size="large" text="Testing loading animation..." color="#34C759" />
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 24,
  },
  list: {
    marginBottom: 20,
  },
  exploreItem: {
    marginVertical: 4,
  },
  keyboardInfo: {
    backgroundColor: '#34C759',
    marginBottom: 16,
  },
  keyboardText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
});
