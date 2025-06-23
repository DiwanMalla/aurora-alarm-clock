import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  Pressable,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
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
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);
  const lastSelectedIndex = useRef(selectedIndex);
  
  // Create infinite data array by repeating the items multiple times
  const REPEAT_COUNT = 1000; // Large enough for smooth infinite scroll
  const MIDDLE_INDEX = Math.floor(REPEAT_COUNT / 2) * items.length;
  
  const infiniteData = useRef<string[]>([]);
  const infiniteItems = useRef<{ value: string; originalIndex: number }[]>([]);
  
  // Generate infinite data array
  useEffect(() => {
    const newInfiniteData: string[] = [];
    const newInfiniteItems: { value: string; originalIndex: number }[] = [];
    
    for (let i = 0; i < REPEAT_COUNT; i++) {
      items.forEach((item, index) => {
        newInfiniteData.push(item);
        newInfiniteItems.push({ value: item, originalIndex: index });
      });
    }
    
    infiniteData.current = newInfiniteData;
    infiniteItems.current = newInfiniteItems;
  }, [items]);

  // Get the initial scroll position (middle of infinite array + selected offset)
  const getInitialScrollIndex = () => {
    return MIDDLE_INDEX + selectedIndex;
  };

  // Convert infinite index to original item index
  const getOriginalIndex = (infiniteIndex: number) => {
    return infiniteIndex % items.length;
  };

  // Get the current center index from scroll position
  const getCenterIndexFromOffset = (offset: number) => {
    return Math.round(offset / itemHeight);
  };

  // Snap to selected index on mount or when selectedIndex changes externally
  useEffect(() => {
    if (!isScrolling.current && flatListRef.current && lastSelectedIndex.current !== selectedIndex) {
      const targetIndex = getInitialScrollIndex();
      flatListRef.current.scrollToOffset({
        offset: targetIndex * itemHeight,
        animated: true,
      });
      lastSelectedIndex.current = selectedIndex;
    }
  }, [selectedIndex, itemHeight, items.length]);

  // Handle scroll end and snap to nearest item
  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const centerIndex = getCenterIndexFromOffset(offsetY);
    const originalIndex = getOriginalIndex(centerIndex);
    
    if (originalIndex !== selectedIndex) {
      lastSelectedIndex.current = originalIndex;
      onIndexChange(originalIndex);
    }
    isScrolling.current = false;
  };

  // Handle user scroll start
  const onScrollBeginDrag = () => {
    isScrolling.current = true;
  };

  // Handle scroll during momentum for smoother updates
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isScrolling.current) return;
    
    const offsetY = event.nativeEvent.contentOffset.y;
    const centerIndex = getCenterIndexFromOffset(offsetY);
    const originalIndex = getOriginalIndex(centerIndex);
    
    if (originalIndex !== lastSelectedIndex.current) {
      lastSelectedIndex.current = originalIndex;
      // Don't call onIndexChange during scroll to avoid performance issues
    }
  };

  // Render each item with distance-based styling
  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const currentScrollIndex = getInitialScrollIndex();
    const distance = Math.abs(index - currentScrollIndex);
    const isCenter = distance <= 0;
    
    // Calculate opacity and scale based on distance from center
    const maxDistance = Math.floor(visibleItems / 2) + 1;
    const normalizedDistance = Math.min(distance, maxDistance);
    const opacity = Math.max(0.3, 1 - (normalizedDistance * 0.25));
    const scale = isCenter ? 1 : 0.9;
    
    return (
      <Pressable
        style={[
          styles.wheelItem,
          {
            height: itemHeight,
            transform: [{ scale }],
          },
        ]}
        onPress={() => {
          const originalIndex = getOriginalIndex(index);
          onIndexChange(originalIndex);
        }}
        testID={`${testID}-item-${getOriginalIndex(index)}`}
      >
        <Text
          style={[
            styles.wheelItemText,
            {
              color: isCenter ? colors.primary : colors.text,
              opacity,
              fontSize: isCenter ? Typography.headline.fontSize : Typography.body.fontSize,
              fontWeight: isCenter ? Typography.headline.fontWeight : Typography.body.fontWeight,
            },
          ]}
        >
          {item}
        </Text>
      </Pressable>
    );
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
        pointerEvents="none"
      />
      <Animated.FlatList
        ref={flatListRef}
        data={infiniteData.current}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate={Platform.OS === 'ios' ? 0.985 : 0.985} // Smoother momentum
        bounces={false}
        getItemLayout={(_, index) => ({ length: itemHeight, offset: itemHeight * index, index })}
        initialScrollIndex={getInitialScrollIndex()}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScroll={onScroll}
        scrollEventThrottle={16} // Smooth scroll updates
        contentContainerStyle={{ paddingVertical: itemHeight * Math.floor(visibleItems / 2) }}
        style={styles.flatList}
        // Enhanced momentum and responsiveness
        maximumZoomScale={1}
        minimumZoomScale={1}
        pagingEnabled={false}
        nestedScrollEnabled={false}
        removeClippedSubviews={true}
        windowSize={visibleItems + 4}
        initialNumToRender={visibleItems + 4}
        maxToRenderPerBatch={visibleItems + 2}
      />
    </View>
  );
};export const TimePicker: React.FC<TimePickerProps> = ({
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

  // Update parent when time changes
  useEffect(() => {
    const newDate = new Date(value);
    const hour24 = get24Hour(mode === '12h' ? parseInt(hourItems[hours]) : hours, period);
    newDate.setHours(hour24, minutes, 0, 0);
    onChange(newDate);
  }, [hours, minutes, period, mode, value, onChange, hourItems, get24Hour]);

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
  flatList: {
    flexGrow: 0,
  },
});

export default TimePicker;
