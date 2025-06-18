import React, { useState, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  Platform,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useColorScheme } from '../useColorScheme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  style?: any;
  containerStyle?: any;
  testID?: string;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      variant = 'outlined',
      size = 'medium',
      style,
      containerStyle,
      testID = 'text-input',
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [isFocused, setIsFocused] = useState(false);

    const getSizeStyles = () => {
      switch (size) {
        case 'small':
          return {
            height: 36,
            fontSize: Typography.caption1.fontSize,
            paddingHorizontal: Spacing.sm,
          };
        case 'large':
          return {
            height: 52,
            fontSize: Typography.body.fontSize,
            paddingHorizontal: Spacing.md,
          };
        default:
          return {
            height: Spacing.touchTarget,
            fontSize: Typography.body.fontSize,
            paddingHorizontal: Spacing.md,
          };
      }
    };

    const getVariantStyles = () => {
      const baseStyles = {
        borderRadius: BorderRadius.md,
        ...getSizeStyles(),
      };

      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: colors.surface,
            borderWidth: 0,
          };
        case 'default':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: isFocused ? colors.primary : colors.border,
            borderRadius: 0,
          };
        default: // outlined
          return {
            ...baseStyles,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
          };
      }
    };

    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

    return (
      <View style={[styles.container, containerStyle]} testID={testID}>
        {/* Label */}
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: error ? colors.error : colors.text,
              },
            ]}
            testID={`${testID}-label`}
          >
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View style={[styles.inputContainer, getVariantStyles()]}>
          {/* Left Icon */}
          {leftIcon && (
            <Ionicons
              name={leftIcon as any}
              size={iconSize}
              color={colors.textSecondary}
              style={styles.leftIcon}
            />
          )}

          {/* Text Input */}
          <RNTextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.text,
                fontSize: getSizeStyles().fontSize,
                paddingLeft: leftIcon ? 0 : getSizeStyles().paddingHorizontal,
                paddingRight: rightIcon ? 0 : getSizeStyles().paddingHorizontal,
              },
              style,
            ]}
            placeholderTextColor={colors.textTertiary}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            testID={`${testID}-input`}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <Ionicons
              name={rightIcon as any}
              size={iconSize}
              color={colors.textSecondary}
              style={styles.rightIcon}
              onPress={onRightIconPress}
            />
          )}
        </View>

        {/* Error or Hint */}
        {(error || hint) && (
          <Text
            style={[
              styles.helperText,
              {
                color: error ? colors.error : colors.textSecondary,
              },
            ]}
            testID={`${testID}-${error ? 'error' : 'hint'}`}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  label: {
    ...Typography.subhead,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    flex: 1,
    ...Typography.body,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  leftIcon: {
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
    marginRight: Spacing.md,
  },
  helperText: {
    ...Typography.caption1,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default TextInput;
