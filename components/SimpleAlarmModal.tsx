import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Modal } from './ui/Modal';
import { useTheme } from '@/hooks/useTheme';
import { useAlarms } from '@/hooks/useStores';
import { Typography, Spacing, BorderRadius } from '@/constants/Design';

interface SimpleAlarmModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SimpleAlarmModal: React.FC<SimpleAlarmModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { addAlarm } = useAlarms();
  const [label, setLabel] = useState('');

  const handleSave = () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter a label for your alarm');
      return;
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() + 5); // 5 minutes from now

    const alarmData = {
      id: Date.now().toString(),
      label: label.trim(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      enabled: true,
      repeat: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      sound: {
        type: 'built-in' as const,
        uri: 'default',
        name: 'Default',
        volume: 80,
      },
      snooze: {
        enabled: true,
        duration: 9,
        maxCount: 3,
      },
      vibration: {
        enabled: true,
        pattern: [0, 250, 250, 250],
      },
      smartWakeup: {
        enabled: false,
        window: 30,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addAlarm(alarmData);
    setLabel('');
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Quick Alarm" size="medium">
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Alarm Label</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={label}
            onChangeText={setLabel}
            placeholder="Enter alarm label"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <Text style={[styles.info, { color: colors.textSecondary }]}>
          This will create an alarm for 5 minutes from now
        </Text>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colors.white }]}>Create Alarm</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.headline,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
  },
  info: {
    ...Typography.body,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveButtonText: {
    ...Typography.headline,
    fontWeight: '600',
  },
});

export default SimpleAlarmModal;
