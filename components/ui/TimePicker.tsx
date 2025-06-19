import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform, Pressable, Animated } from 'react-native';
import { Typography, Spacing, BorderRadius } from '../../constants/Design';
import { useTheme } from '../../hooks/useTheme';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: '12h' | '24h';
  style?: any;
  testID?: string;
}

interface TimeWheelProps {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  itemHeight: number;
  visibleItems: number;
  testID?: string;
}

const TimeWheel: React.FC<TimeWheelProps> = ({
  items,
  selectedIndex,
  onIndexChange,
  itemHeight,
  visibleItems,
  testID,
}) => {
  const { colors } = useTheme();
  const scrollY = new Animated.Value(selectedIndex * itemHeight);

  const handlePress = (index: number) => {
    onIndexChange(index);
    Animated.spring(scrollY, {
      toValue: index * itemHeight,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.wheel, { height: itemHeight * visibleItems }]} testID={testID}>
      <View
        style={[
          styles.selectionOverlay,
          {
            backgroundColor: colors.primary + '20',
            top: itemHeight * Math.floor(visibleItems / 2),
            height: itemHeight,
          },
        ]}
      />

      {items.map((item, index) => {
        const isSelected = index === selectedIndex;
        const distance = Math.abs(index - selectedIndex);
        const opacity = Math.max(0.3, 1 - distance * 0.3);

        return (
          <Pressable
            key={index}
            style={[
              styles.wheelItem,
              {
                height: itemHeight,
                top: index * itemHeight,
              },
            ]}
            onPress={() => handlePress(index)}
            testID={`${testID}-item-${index}`}
          >
            <Text
              style={[
                styles.wheelItemText,
                {
                  color: isSelected ? colors.primary : colors.text,
                  opacity,
                  fontSize: isSelected ? Typography.headline.fontSize : Typography.body.fontSize,
                  fontWeight: isSelected
                    ? Typography.headline.fontWeight
                    : Typography.body.fontWeight,
                },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  mode = '12h',
  style,
  testID = 'time-picker',
}) => {
  const { colors } = useTheme();

  const [hours, setHours] = useState(value.getHours());
  const [minutes, setMinutes] = useState(value.getMinutes());
  const [period, setPeriod] = useState(value.getHours() >= 12 ? 'PM' : 'AM');

  const itemHeight = 60;
  const visibleItems = 5;

  // Generate time arrays
  const hourItems =
    mode === '12h'
      ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
      : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  const minuteItems = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periodItems = ['AM', 'PM'];

  // Convert 24h to 12h format for display
  const getDisplayHour = (hour24: number) => {
    if (mode === '24h') return hour24;
    return hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  };

  // Convert display hour back to 24h format
  const get24Hour = (displayHour: number, period: string) => {
    if (mode === '24h') return displayHour;
    if (period === 'AM') {
      return displayHour === 12 ? 0 : displayHour;
    } else {
      return displayHour === 12 ? 12 : displayHour + 12;
    }
  };

  useEffect(() => {
    const newDate = new Date(value);
    const hour24 = get24Hour(mode === '12h' ? parseInt(hourItems[hours]) : hours, period);
    newDate.setHours(hour24, minutes, 0, 0);
    onChange(newDate);
  }, [hours, minutes, period]);

  const handleHourChange = (index: number) => {
    setHours(index);
  };

  const handleMinuteChange = (index: number) => {
    setMinutes(index);
  };

  const handlePeriodChange = (index: number) => {
    setPeriod(periodItems[index]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }, style]} testID={testID}>
      <View style={styles.wheelContainer}>
        <TimeWheel
          items={hourItems}
          selectedIndex={mode === '12h' ? getDisplayHour(hours) - 1 : hours}
          onIndexChange={handleHourChange}
          itemHeight={itemHeight}
          visibleItems={visibleItems}
          testID={`${testID}-hours`}
        />

        <Text style={[styles.separator, { color: colors.text }]}>:</Text>

        <TimeWheel
          items={minuteItems}
          selectedIndex={minutes}
          onIndexChange={handleMinuteChange}
          itemHeight={itemHeight}
          visibleItems={visibleItems}
          testID={`${testID}-minutes`}
        />

        {mode === '12h' && (
          <TimeWheel
            items={periodItems}
            selectedIndex={period === 'AM' ? 0 : 1}
            onIndexChange={handlePeriodChange}
            itemHeight={itemHeight}
            visibleItems={visibleItems}
            testID={`${testID}-period`}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: Spacing.xs,
  },
  selectionOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: BorderRadius.sm,
    zIndex: 1,
  },
  wheelItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  wheelItemText: {
    fontFamily: 'System',
    textAlign: 'center',
    minWidth: 40,
  },
  separator: {
    fontSize: Typography.title2.fontSize,
    fontWeight: Typography.title2.fontWeight,
    marginHorizontal: Spacing.sm,
  },
});

export default TimePicker;
