const MAX_LOGS = 100;
const STORAGE_KEY = 'yaqeen-error-logs';

class ErrorLogger {
  constructor() {
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveLogs() {
    try {
      const logsToSave = this.logs.slice(-MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToSave));
    } catch (error) {
      console.warn('Failed to save error logs:', error);
    }
  }

  log(errorData) {
    const logEntry = {
      id: Date.now(),
      timestamp: errorData.timestamp || new Date().toISOString(),
      error: errorData.error || 'Unknown error',
      stack: errorData.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...errorData
    };

    this.logs.push(logEntry);
    this.saveLogs();

    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorLogger]', logEntry);
    }

    return logEntry;
  }

  getLogs() {
    return [...this.logs];
  }

  getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }

  clear() {
    this.logs = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  export() {
    const data = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yaqeen-error-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const errorLogger = new ErrorLogger();

export function setupGlobalErrorHandler() {
  window.errorLogger = errorLogger;

  window.addEventListener('error', (event) => {
    errorLogger.log({
      type: 'global-error',
      error: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.log({
      type: 'unhandled-rejection',
      error: event.reason?.message || String(event.reason),
      stack: event.reason?.stack
    });
  });
}

export default errorLogger;
