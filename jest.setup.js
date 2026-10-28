/* eslint-disable no-undef */

const mockStorage = {};

const mockAsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key, value) => {
    mockStorage[key] = String(value);
    return Promise.resolve(null);
  }),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve(null);
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    return Promise.resolve(null);
  }),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

jest.mock('react-native-screens', () => ({
  ...jest.requireActual('react-native-screens'),
  enableScreens: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const mockContext = React.createContext(insets);

  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaConsumer: ({ children }: any) => children(insets),
    SafeAreaInsetsContext: mockContext,
    useSafeAreaInsets: () => insets,
    SafeAreaView: ({ children }: any) => children,
  };
});

