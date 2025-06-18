import React, { ReactNode, useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useColorScheme } from '../useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  animationType?: 'slide' | 'fade';
  style?: any;
  testID?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  animationType = 'slide',
  style,
  testID = 'modal',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(screenHeight);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getModalStyle = () => {
    const baseStyle = {
      backgroundColor: colors.surface,
      borderRadius: size === 'fullscreen' ? 0 : BorderRadius.lg,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        android: {
          elevation: 16,
        },
      }),
    };

    switch (size) {
      case 'small':
        return {
          ...baseStyle,
          width: screenWidth * 0.8,
          maxHeight: screenHeight * 0.4,
        };
      case 'medium':
        return {
          ...baseStyle,
          width: screenWidth * 0.9,
          maxHeight: screenHeight * 0.6,
        };
      case 'large':
        return {
          ...baseStyle,
          width: screenWidth * 0.95,
          maxHeight: screenHeight * 0.8,
        };
      case 'fullscreen':
        return {
          ...baseStyle,
          width: screenWidth,
          height: screenHeight,
          marginTop: insets.top,
        };
      default:
        return baseStyle;
    }
  };

  const handleBackdropPress = () => {
    if (size !== 'fullscreen') {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: colors.shadow,
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />

        <Animated.View
          style={[
            styles.modalContainer,
            getModalStyle(),
            {
              transform:
                animationType === 'slide' ? [{ translateY: slideAnim }] : [{ scale: fadeAnim }],
            },
            style,
          ]}
          testID={`${testID}-content`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              {title && (
                <Text style={[styles.title, { color: colors.text }]} testID={`${testID}-title`}>
                  {title}
                </Text>
              )}

              {showCloseButton && (
                <Pressable style={styles.closeButton} onPress={onClose} testID={`${testID}-close`}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    maxWidth: screenWidth - Spacing.lg,
    maxHeight: screenHeight - Spacing.lg,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    ...Typography.headline,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
});

export default Modal;
