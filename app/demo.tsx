import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TimePicker, AlarmCard, Modal, TextInput, Label } from '../components/ui';
import { useAlarmManagement, useTheme } from '../hooks/useStores';
import { Colors, Spacing } from '../constants/Design';
import { useColorScheme } from '../components/useColorScheme';
import { Alarm } from '../stores/alarmStore';

export default function AlarmDemoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm } = useAlarmManagement();
  const { theme, setTheme } = useTheme();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [alarmLabel, setAlarmLabel] = useState('');

  const handleAddAlarm = () => {
    if (!alarmLabel.trim()) {
      Alert.alert('Error', 'Please enter an alarm label');
      return;
    }

    const timeString = selectedTime.toTimeString().slice(0, 5); // HH:mm format

    const newAlarm = {
      label: alarmLabel,
      time: timeString,
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
    };

    addAlarm(newAlarm);
    setAlarmLabel('');
    setIsModalVisible(false);
    Alert.alert('Success', 'Alarm added successfully!');
  };

  const handleAlarmPress = (alarm: Alarm) => {
    Alert.alert(
      'Alarm Details',
      `Label: ${alarm.label}\nTime: ${alarm.time}\nEnabled: ${alarm.enabled ? 'Yes' : 'No'}`,
      [{ text: 'OK' }]
    );
  };

  const handleAlarmToggle = (id: string, enabled: boolean) => {
    updateAlarm(id, { enabled });
  };

  const handleAlarmDelete = (id: string) => {
    Alert.alert('Delete Alarm', 'Are you sure you want to delete this alarm?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAlarm(id),
      },
    ]);
  };

  const toggleThemeMode = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(newTheme);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Label size="large" weight="bold" style={{ color: colors.text }}>
            Aurora Clock Demo
          </Label>
          <Label size="small" style={{ color: colors.textSecondary }}>
            Current theme: {theme}
          </Label>
        </View>

        {/* Add Alarm Button */}
        <View style={styles.addButtonContainer}>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsModalVisible(true)}
          >
            <Label size="medium" weight="semibold" style={{ color: colors.surface }}>
              Add Alarm
            </Label>
          </Pressable>

          <Pressable
            style={[styles.themeButton, { backgroundColor: colors.secondary }]}
            onPress={toggleThemeMode}
          >
            <Label size="small" style={{ color: colors.surface }}>
              Toggle Theme
            </Label>
          </Pressable>
        </View>

        {/* Alarms List */}
        <View style={styles.alarmsContainer}>
          <Label
            size="medium"
            weight="semibold"
            style={{ color: colors.text, marginBottom: Spacing.md }}
          >
            Your Alarms ({alarms.length})
          </Label>

          {alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Label size="medium" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                No alarms yet. Tap "Add Alarm" to create your first alarm.
              </Label>
            </View>
          ) : (
            alarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onPress={handleAlarmPress}
                onToggle={handleAlarmToggle}
                onDelete={handleAlarmDelete}
                style={{ marginBottom: Spacing.sm }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Alarm Modal */}
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add New Alarm"
        size="large"
      >
        <View style={styles.modalContent}>
          <TextInput
            label="Alarm Label"
            value={alarmLabel}
            onChangeText={setAlarmLabel}
            placeholder="e.g., Morning Alarm"
            style={{ marginBottom: Spacing.lg }}
          />

          <Label
            size="medium"
            weight="semibold"
            style={{ color: colors.text, marginBottom: Spacing.md }}
          >
            Select Time
          </Label>

          <TimePicker
            value={selectedTime}
            onChange={setSelectedTime}
            style={{ marginBottom: Spacing.lg }}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.border }]}
              onPress={() => setIsModalVisible(false)}
            >
              <Label style={{ color: colors.text }}>Cancel</Label>
            </Pressable>

            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={handleAddAlarm}
            >
              <Label style={{ color: colors.surface }}>Add Alarm</Label>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  addButton: {
    flex: 1,
    height: Spacing.touchTarget,
    borderRadius: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  themeButton: {
    paddingHorizontal: Spacing.md,
    height: Spacing.touchTarget,
    borderRadius: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmsContainer: {
    flex: 1,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  modalContent: {
    minHeight: 300,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    height: Spacing.touchTarget,
    borderRadius: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
});
