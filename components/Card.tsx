import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { hapticFeedback } from '@/lib/haptics';
import { CardProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Card: React.FC<CardProps> = ({ title, subtitle, children, onPress, style }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
      runOnJS(hapticFeedback.light)();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const handlePress = () => {
    if (onPress) {
      hapticFeedback.medium();
      onPress();
    }
  };

  const Container = onPress ? AnimatedTouchableOpacity : View;

  const getCardStyle = () => ({
    ...styles.card,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    borderColor: colors.border,
  });

  const containerStyle = onPress
    ? [getCardStyle(), styles.pressableCard, style, animatedStyle]
    : [getCardStyle(), style];

  return (
    <Container
      style={containerStyle}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      onPress={onPress ? handlePress : undefined}
      activeOpacity={0.9}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pressableCard: {
    borderWidth: 1,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
});
