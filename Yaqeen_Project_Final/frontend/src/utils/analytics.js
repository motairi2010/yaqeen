class Analytics {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'production';
    this.events = [];
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  track(eventName, properties = {}) {
    if (!this.enabled) {
      console.log('[Analytics]', eventName, properties);
      return;
    }

    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  sendEvent(event) {
    const stored = localStorage.getItem('analytics-events') || '[]';
    const events = JSON.parse(stored);
    events.push(event);
    localStorage.setItem('analytics-events', JSON.stringify(events.slice(-100)));
  }

  page(pageName, properties = {}) {
    this.track('page_view', {
      page: pageName,
      ...properties,
    });
  }

  click(elementName, properties = {}) {
    this.track('click', {
      element: elementName,
      ...properties,
    });
  }

  formSubmit(formName, properties = {}) {
    this.track('form_submit', {
      form: formName,
      ...properties,
    });
  }

  error(error, context = {}) {
    this.track('error', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
    localStorage.removeItem('analytics-events');
  }

  exportEvents() {
    const stored = localStorage.getItem('analytics-events') || '[]';
    return JSON.parse(stored);
  }
}

export const analytics = new Analytics();

export const trackPageView = (pageName) => analytics.page(pageName);
export const trackClick = (element) => analytics.click(element);
export const trackEvent = (name, props) => analytics.track(name, props);
