import { useCallback } from 'react';
import { useAppSettings } from './useStores';
import { formatTime, formatTimeString, formatCurrentTime, parseTimeString } from '@/lib/utils';

export const useTimeFormat = () => {
  const { settings } = useAppSettings();
  const timeFormat = settings.timeFormat;

  const formatDisplayTime = useCallback(
    (date: Date): string => {
      return formatTime(date, timeFormat);
    },
    [timeFormat]
  );

  const formatAlarmTime = useCallback(
    (timeString: string): string => {
      return formatTimeString(timeString, timeFormat);
    },
    [timeFormat]
  );

  const getCurrentTime = useCallback(
    (includeSeconds: boolean = false): string => {
      return formatCurrentTime(timeFormat, includeSeconds);
    },
    [timeFormat]
  );

  const parseTime = useCallback((timeString: string) => {
    return parseTimeString(timeString);
  }, []);

  const is24HourFormat = timeFormat === '24h';

  return {
    formatDisplayTime,
    formatAlarmTime,
    getCurrentTime,
    parseTime,
    is24HourFormat,
    timeFormat,
  };
};
