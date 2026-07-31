/* eslint-env jest */

jest.mock('react-native-config', () => ({
  API_URL: 'http://10.0.2.2:3001/api/v1',
  API_TIMEOUT: '10000',
}));

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve({ username: 'key', password: 'mock-token' })),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));
