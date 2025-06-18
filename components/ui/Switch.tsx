import React from 'react';
import { Switch as RNSwitch, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: any;
  testID?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
  testID = 'switch',
}) => {
  const { colors } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      style={[styles.switch, style]}
      testID={testID}
      {...Platform.select({
        ios: {
          trackColor: {
            false: colors.border,
            true: colors.primary,
          },
          thumbColor: colors.surface,
        },
        android: {
          trackColor: {
            false: colors.border,
            true: colors.primary + '80',
          },
          thumbColor: value ? colors.primary : colors.textSecondary,
        },
      })}
    />
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: Platform.select({
      ios: [{ scaleX: 1 }, { scaleY: 1 }],
      android: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
    }),
  },
});

export default Switch;
