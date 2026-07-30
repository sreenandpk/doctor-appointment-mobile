import Keychain from 'react-native-keychain';
import logger from './logger';

export const saveToken = async (
  key: string,
  token: string,
): Promise<boolean> => {
  try {
    await Keychain.setGenericPassword(key, token, {
      service: key,
    });
    return true;
  } catch (error) {
    logger.error('Failed to save secure token:', error);
    return false;
  }
};

export const getToken = async (key: string): Promise<string | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({
      service: key,
    });
    if (credentials) {
      return credentials.password;
    }
    return null;
  } catch (error) {
    logger.error('Failed to retrieve secure token:', error);
    return null;
  }
};

export const removeToken = async (key: string): Promise<boolean> => {
  try {
    await Keychain.resetGenericPassword({
      service: key,
    });
    return true;
  } catch (error) {
    logger.error('Failed to remove secure token:', error);
    return false;
  }
};
