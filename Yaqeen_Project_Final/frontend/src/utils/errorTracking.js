class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.enabled = true;
    this.init();
  }

  init() {
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  handleGlobalError(event) {
    this.logError({
      type: 'global',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: Date.now(),
    });
  }

  handleUnhandledRejection(event) {
    this.logError({
      type: 'promise',
      reason: event.reason,
      promise: event.promise,
      timestamp: Date.now(),
    });
  }

  logError(errorInfo) {
    if (!this.enabled) return;

    const errorEntry = {
      ...errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
    };

    this.errors.push(errorEntry);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    this.persistError(errorEntry);

    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Tracker]', errorEntry);
    }
  }

  persistError(error) {
    try {
      const stored = localStorage.getItem('error-logs') || '[]';
      const errors = JSON.parse(stored);
      errors.push(error);
      localStorage.setItem('error-logs', JSON.stringify(errors.slice(-100)));
    } catch (e) {
      console.error('Failed to persist error:', e);
    }
  }

  getErrors() {
    return this.errors;
  }

  getStoredErrors() {
    try {
      const stored = localStorage.getItem('error-logs') || '[]';
      return JSON.parse(stored);
    } catch (e) {
      return [];
    }
  }

  clearErrors() {
    this.errors = [];
    localStorage.removeItem('error-logs');
  }

  exportErrors() {
    return {
      current: this.errors,
      stored: this.getStoredErrors(),
    };
  }

  captureError(error, context = {}) {
    this.logError({
      type: 'captured',
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    });
  }
}

export const errorTracker = new ErrorTracker();

export const captureError = (error, context) => {
  errorTracker.captureError(error, context);
};

export const getErrorLogs = () => errorTracker.exportErrors();
