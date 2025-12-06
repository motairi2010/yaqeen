import { performanceMonitor } from './performanceMonitor';
import { errorTracker } from './errorTracking';
import { analytics } from './analytics';

class Monitoring {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    this.setupPerformanceObserver();
    this.setupResourceTiming();
    this.initialized = true;
  }

  setupPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry);
          } else if (entry.entryType === 'resource') {
            this.trackResourceTiming(entry);
          } else if (entry.entryType === 'paint') {
            this.trackPaintTiming(entry);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    } catch (error) {
      console.error('Failed to setup PerformanceObserver:', error);
    }
  }

  trackNavigationTiming(entry) {
    const timing = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      load: entry.loadEventEnd - entry.loadEventStart,
      total: entry.loadEventEnd - entry.fetchStart,
    };

    analytics.track('navigation_timing', timing);
  }

  trackResourceTiming(entry) {
    if (entry.duration > 1000) {
      analytics.track('slow_resource', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
      });
    }
  }

  trackPaintTiming(entry) {
    analytics.track('paint_timing', {
      name: entry.name,
      startTime: entry.startTime,
    });
  }

  setupResourceTiming() {
    if (!window.performance || !window.performance.getEntriesByType) return;

    const resources = window.performance.getEntriesByType('resource');
    const slowResources = resources.filter(r => r.duration > 1000);

    if (slowResources.length > 0) {
      analytics.track('slow_resources_detected', {
        count: slowResources.length,
        resources: slowResources.map(r => ({
          name: r.name,
          duration: r.duration,
        })),
      });
    }
  }

  getMetrics() {
    return {
      performance: performanceMonitor.getMetrics(),
      errors: errorTracker.getErrors(),
      analytics: analytics.getEvents(),
    };
  }

  exportData() {
    return {
      performance: performanceMonitor.getMetrics(),
      errors: errorTracker.exportErrors(),
      analytics: analytics.exportEvents(),
      timestamp: Date.now(),
    };
  }

  clearData() {
    performanceMonitor.clearMetrics();
    errorTracker.clearErrors();
    analytics.clearEvents();
  }
}

export const monitoring = new Monitoring();

export const initMonitoring = () => monitoring.init();
export const getMonitoringData = () => monitoring.exportData();
export const clearMonitoringData = () => monitoring.clearData();
