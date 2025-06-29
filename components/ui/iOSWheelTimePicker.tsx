import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing } from '../../constants/Design';
import { useTheme } from '../../hooks/useTheme';
import { useTimeFormat } from '../../hooks/useTimeFormat';

interface IOSWheelTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  style?: Record<string, unknown>;
  testID?: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export const IOSWheelTimePicker: React.FC<IOSWheelTimePickerProps> = ({
  value,
  onChange,
  style,
  testID = 'ios-wheel-time-picker',
}) => {
  const { colors } = useTheme();
  const { is24HourFormat } = useTimeFormat();

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const [isScrolling, setIsScrolling] = useState({
    hour: false,
    minute: false,
    period: false,
  });

  // Generate arrays for each wheel
  const hours = is24HourFormat
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));

  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  // Get current values
  const currentHour = value.getHours();
  const currentMinute = value.getMinutes();
  const currentPeriod = currentHour >= 12 ? 'PM' : 'AM';

  // Convert to display values
  const displayHour = is24HourFormat ? currentHour : currentHour % 12 || 12;

  // Initial scroll positions
  const getHourIndex = useCallback(() => {
    if (is24HourFormat) {
      return currentHour;
    }
    return displayHour === 12 ? 0 : displayHour - 1;
  }, [currentHour, displayHour, is24HourFormat]);

  const getMinuteIndex = useCallback(() => currentMinute, [currentMinute]);

  const getPeriodIndex = useCallback(() => {
    return currentPeriod === 'AM' ? 0 : 1;
  }, [currentPeriod]);

  // Update time when scrolling ends
  const updateTime = useCallback(
    (type: 'hour' | 'minute' | 'period', newValue: number | string) => {
      const newDate = new Date(value);

      if (type === 'hour') {
        let hour = newValue as number;
        if (!is24HourFormat) {
          if (hour === 12) hour = 0;
          if (currentPeriod === 'PM') hour += 12;
        }
        newDate.setHours(hour);
      } else if (type === 'minute') {
        newDate.setMinutes(newValue as number);
      } else if (type === 'period') {
        const period = newValue as string;
        let hour = displayHour;
        if (hour === 12) hour = 0;

        if (period === 'PM') {
          hour += 12;
        }
        newDate.setHours(hour);
      }

      onChange(newDate);
      Haptics.selectionAsync();
    },
    [value, onChange, currentPeriod, displayHour, is24HourFormat]
  );

  // Handle scroll end for snapping
  const handleScrollEnd = useCallback(
    (
      type: 'hour' | 'minute' | 'period',
      event: { nativeEvent: { contentOffset: { y: number } } },
      data: (number | string)[]
    ) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

      // Snap to the correct position
      const scrollRef =
        type === 'hour' ? hourScrollRef : type === 'minute' ? minuteScrollRef : periodScrollRef;

      scrollRef.current?.scrollTo({
        y: clampedIndex * ITEM_HEIGHT,
        animated: true,
      });

      updateTime(type, data[clampedIndex]);
      setIsScrolling((prev) => ({ ...prev, [type]: false }));
    },
    [updateTime]
  );

  // Initialize scroll positions
  useEffect(() => {
    const initializeScrollPositions = () => {
      hourScrollRef.current?.scrollTo({
        y: getHourIndex() * ITEM_HEIGHT,
        animated: false,
      });
      minuteScrollRef.current?.scrollTo({
        y: getMinuteIndex() * ITEM_HEIGHT,
        animated: false,
      });
      if (!is24HourFormat) {
        periodScrollRef.current?.scrollTo({
          y: getPeriodIndex() * ITEM_HEIGHT,
          animated: false,
        });
      }
    };

    // Small delay to ensure ScrollView is mounted
    const timer = global.setTimeout(initializeScrollPositions, 100);
    return () => global.clearTimeout(timer);
  }, [getHourIndex, getMinuteIndex, getPeriodIndex, is24HourFormat]);

  // Render wheel item
  const renderWheelItem = (
    item: number | string,
    index: number,
    isSelected: boolean,
    type: 'hour' | 'minute' | 'period'
  ) => {
    const opacity = isSelected ? 1 : 0.3;
    const fontSize = isSelected ? 24 : 20;
    const fontWeight = isSelected ? '400' : '300';

    let displayText = '';
    if (typeof item === 'number') {
      if (type === 'hour' && !is24HourFormat && item === 0) {
        displayText = '12';
      } else {
        displayText = item.toString().padStart(2, '0');
      }
    } else {
      displayText = item;
    }

    return (
      <View key={index} style={[styles.wheelItem, { height: ITEM_HEIGHT }]}>
        <Text
          style={[
            styles.wheelText,
            {
              color: colors.text,
              opacity,
              fontSize,
              fontWeight: fontWeight as '300' | '400',
            },
          ]}
        >
          {displayText}
        </Text>
      </View>
    );
  };

  // Render wheel
  const renderWheel = (
    data: (number | string)[],
    type: 'hour' | 'minute' | 'period',
    selectedIndex: number
  ) => {
    const scrollRef =
      type === 'hour' ? hourScrollRef : type === 'minute' ? minuteScrollRef : periodScrollRef;

    return (
      <View style={styles.wheelContainer}>
        <ScrollView
          ref={scrollRef}
          style={styles.wheel}
          contentContainerStyle={[
            styles.wheelContent,
            { paddingVertical: PICKER_HEIGHT / 2 - ITEM_HEIGHT / 2 },
          ]}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onScrollBeginDrag={() => {
            setIsScrolling((prev) => ({ ...prev, [type]: true }));
          }}
          onMomentumScrollEnd={(event) => {
            handleScrollEnd(type, event, data);
          }}
          scrollEventThrottle={16}
        >
          {data.map((item, index) => {
            const isSelected = !isScrolling[type] && index === selectedIndex;
            return renderWheelItem(item, index, isSelected, type);
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View testID={testID} style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Set Alarm Time</Text>
      </View>

      {/* Wheel Container */}
      <View style={styles.pickerContainer}>
        {/* Selection highlight overlay */}
        <View
          style={[
            styles.selectionOverlay,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        />

        {/* Wheels */}
        <View style={styles.wheelsRow}>
          {/* Hour wheel */}
          <View style={styles.wheelWrapper}>{renderWheel(hours, 'hour', getHourIndex())}</View>

          {/* Separator */}
          <View style={styles.separator}>
            <Text style={[styles.separatorText, { color: colors.text }]}>:</Text>
          </View>

          {/* Minute wheel */}
          <View style={styles.wheelWrapper}>
            {renderWheel(minutes, 'minute', getMinuteIndex())}
          </View>

          {/* AM/PM wheel for 12-hour format */}
          {!is24HourFormat && (
            <>
              <View style={styles.separator} />
              <View style={styles.wheelWrapper}>
                <Text style={[styles.wheelLabel, { color: colors.textSecondary }]}>Period</Text>
                {renderWheel(periods, 'period', getPeriodIndex())}
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  title: {
    fontSize: Typography.headline.fontSize,
    fontWeight: '600',
  },
  pickerContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectionOverlay: {
    position: 'absolute',
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1,
    opacity: 0.1,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelWrapper: {
    alignItems: 'center',
    width: 80,
  },
  wheelLabel: {
    fontSize: Typography.caption1.fontSize,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  wheelContainer: {
    paddingHorizontal: Spacing.sm,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  wheel: {
    flex: 1,
  },
  wheelContent: {
    alignItems: 'center',
  },
  wheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    paddingTop: 20, // Account for label
  },
  separatorText: {
    fontSize: 24,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: '200',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
});
