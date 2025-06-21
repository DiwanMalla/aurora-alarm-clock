/* global jest */
import 'react-native-gesture-handler/jestSetup';
import ReanimatedMock from 'react-native-reanimated/mock';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  ReanimatedMock.default.call = () => {};

  return ReanimatedMock;
});

// Mock AsyncStorage
import AsyncStorageMock from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => AsyncStorageMock);
// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: (platforms) => platforms.ios,
}));

// Global test setup
globalThis.__DEV__ = true;
