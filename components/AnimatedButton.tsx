import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { hapticFeedback } from '@/lib/haptics';
import { AnimatedButtonProps } from '@/types';
import { useTheme } from '@/hooks/useTheme';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  size = 'medium',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    runOnJS(hapticFeedback.light)();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      hapticFeedback.medium();
      onPress();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const sizeStyle = styles[`${size}Button` as keyof typeof styles] as ViewStyle;

    let variantStyle: ViewStyle = {};
    switch (variant) {
      case 'primary':
        variantStyle = { backgroundColor: colors.primary };
        break;
      case 'secondary':
        variantStyle = { backgroundColor: colors.surface };
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.text;
    const sizeStyle = styles[`${size}Text` as keyof typeof styles] as TextStyle;

    let variantStyle: TextStyle = {};
    switch (variant) {
      case 'primary':
        variantStyle = { color: colors.background };
        break;
      case 'secondary':
      case 'outline':
        variantStyle = { color: colors.primary };
        break;
    }

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
    };
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.background : colors.primary}
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Size variants
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },

  // Text styles
  text: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
