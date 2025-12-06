class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.enabled = process.env.NODE_ENV === 'development';
  }

  mark(name) {
    if (!this.enabled) return;
    performance.mark(name);
  }

  measure(name, startMark, endMark) {
    if (!this.enabled) return null;

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];

      this.metrics.push({
        name,
        duration: measure.duration,
        timestamp: Date.now()
      });

      return measure;
    } catch (error) {
      console.error('Performance measurement error:', error);
      return null;
    }
  }

  getMetrics() {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = [];
    performance.clearMarks();
    performance.clearMeasures();
  }

  logMetrics() {
    if (!this.enabled) return;

    console.group('Performance Metrics');
    this.metrics.forEach(metric => {
      console.log(`${metric.name}: ${metric.duration.toFixed(2)}ms`);
    });
    console.groupEnd();
  }

  async measureAsync(name, asyncFn) {
    if (!this.enabled) return await asyncFn();

    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    this.mark(startMark);
    const result = await asyncFn();
    this.mark(endMark);

    this.measure(name, startMark, endMark);

    return result;
  }

  measureSync(name, syncFn) {
    if (!this.enabled) return syncFn();

    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    this.mark(startMark);
    const result = syncFn();
    this.mark(endMark);

    this.measure(name, startMark, endMark);

    return result;
  }

  reportWebVitals(metric) {
    if (!this.enabled) return;

    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta
    });

    this.metrics.push({
      name: `web-vital-${metric.name}`,
      duration: metric.value,
      timestamp: Date.now(),
      rating: metric.rating
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();

export const measureRender = (componentName) => {
  return {
    start: () => performanceMonitor.mark(`${componentName}-render-start`),
    end: () => {
      performanceMonitor.mark(`${componentName}-render-end`);
      performanceMonitor.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );
    }
  };
};

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => {
      console.warn('web-vitals package not installed');
    });
  }
};
