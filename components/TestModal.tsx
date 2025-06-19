import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Modal } from './ui/Modal';
import { useTheme } from '@/hooks/useTheme';

interface TestModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TestModal: React.FC<TestModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} onClose={onClose} title="Test Modal" size="medium">
      <View style={styles.container}>
        <Text style={{ color: colors.text }}>
          This is a test modal to check if the basic modal functionality works.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onClose}
        >
          <Text style={{ color: colors.white }}>Close Modal</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default TestModal;
