/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@/stores/auth.store', () => {
  const mockState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    isLoading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    restoreSession: jest.fn(() => Promise.resolve()),
    refreshAccessToken: jest.fn(() => Promise.resolve(null)),
  };
  const useAuthStoreMock = Object.assign(
    () => mockState,
    { getState: () => mockState }
  );
  return {
    useAuthStore: useAuthStoreMock,
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
