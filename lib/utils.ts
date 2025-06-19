import { Platform } from 'react-native';

export const formatDate = (date: Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return date.toLocaleDateString('en-US', optionsMap[format]);
};

export const formatTime = (date: Date, format: '12h' | '24h' = '12h'): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: format === '12h',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeString = (timeString: string, format: '12h' | '24h' = '12h'): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return formatTime(date, format);
};

export const parseTimeString = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

export const formatCurrentTime = (
  format: '12h' | '24h' = '12h',
  includeSeconds: boolean = false
): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour12: format === '12h',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (includeSeconds) {
    options.second = '2-digit';
  }

  return now.toLocaleTimeString('en-US', options);
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(date, 'short');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof globalThis.setTimeout>;

  return (...args: Parameters<T>) => {
    (globalThis as typeof globalThis).clearTimeout(timeoutId);
    timeoutId = (globalThis as typeof globalThis).setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
  };
};
