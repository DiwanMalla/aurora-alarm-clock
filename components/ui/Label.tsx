import React, { ReactNode } from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import { Colors, Typography } from '../../constants/Design';
import { useColorScheme } from '../useColorScheme';

interface LabelProps extends Omit<TextProps, 'style'> {
  children: ReactNode;
  variant?: 'default' | 'required' | 'optional' | 'error' | 'success';
  size?: 'small' | 'medium' | 'large';
  weight?: 'regular' | 'semibold' | 'bold';
  style?: any;
  testID?: string;
}

export const Label: React.FC<LabelProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  weight = 'regular',
  style,
  testID = 'label',
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getVariantColor = () => {
    switch (variant) {
      case 'required':
        return colors.error;
      case 'optional':
        return colors.textSecondary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.text;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return Typography.caption1;
      case 'large':
        return Typography.headline;
      default:
        return Typography.subhead;
    }
  };

  const getWeightStyle = () => {
    switch (weight) {
      case 'semibold':
        return { fontWeight: '600' as const };
      case 'bold':
        return { fontWeight: '700' as const };
      default:
        return { fontWeight: '400' as const };
    }
  };

  const renderLabel = () => {
    if (variant === 'required') {
      return (
        <>
          {children}
          <Text style={[styles.asterisk, { color: colors.error }]}>{' *'}</Text>
        </>
      );
    }

    if (variant === 'optional') {
      return (
        <>
          {children}
          <Text style={[styles.optional, { color: colors.textSecondary }]}>{' (optional)'}</Text>
        </>
      );
    }

    return children;
  };

  return (
    <Text
      style={[
        getSizeStyle(),
        getWeightStyle(),
        {
          color: getVariantColor(),
        },
        style,
      ]}
      testID={testID}
      {...props}
    >
      {renderLabel()}
    </Text>
  );
};

const styles = StyleSheet.create({
  asterisk: {
    fontWeight: 'bold',
  },
  optional: {
    fontWeight: 'normal',
    fontStyle: 'italic',
  },
});

export default Label;
