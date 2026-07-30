import axios from 'axios';
import Config from 'react-native-config';
import { STORAGE_KEYS } from '@/constants';
import { getToken } from '@/utils/storage';

const api = axios.create({
  baseURL: Config.API_URL || 'http://10.0.2.2:3000/api/v1',
  timeout: Number(Config.API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor Placeholder
api.interceptors.request.use(
  async config => {
    const token = await getToken(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response Interceptor Placeholder
api.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    // Placeholder logic for token refresh rotation
    return Promise.reject(error);
  },
);

export default api;
