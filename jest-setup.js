import 'react-native-gesture-handler/jestSetup';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  return {
    default: {
      call: jest.fn(),
      Value: jest.fn(),
      event: jest.fn(() => jest.fn()),
      add: jest.fn(),
      eq: jest.fn(),
      set: jest.fn(),
      cond: jest.fn(),
      interpolate: jest.fn(),
      View: jest.fn(() => 'Animated.View'),
      Extrapolate: { CLAMP: jest.fn() },
      Transition: {
        Together: 'Together',
        Out: 'Out',
        In: 'In',
      },
      Easing: {
        in: jest.fn(),
        out: jest.fn(),
        inOut: jest.fn(),
      },
    },
    Easing: {
      in: jest.fn(),
      out: jest.fn(),
      inOut: jest.fn(),
    },
    Extrapolate: {
      CLAMP: jest.fn(),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));
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
