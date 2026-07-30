const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log('[LOG]:', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn('[WARN]:', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]:', ...args);
  },
};

export default logger;
