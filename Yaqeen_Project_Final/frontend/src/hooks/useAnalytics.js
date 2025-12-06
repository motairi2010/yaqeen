import { useEffect, useCallback } from 'react';
import { analytics } from '../utils/analytics';

export const useAnalytics = () => {
  const track = useCallback((eventName, properties) => {
    analytics.track(eventName, properties);
  }, []);

  const page = useCallback((pageName, properties) => {
    analytics.page(pageName, properties);
  }, []);

  const click = useCallback((elementName, properties) => {
    analytics.click(elementName, properties);
  }, []);

  return { track, page, click };
};

export const usePageTracking = (pageName) => {
  useEffect(() => {
    analytics.page(pageName);
  }, [pageName]);
};

export const useEventTracking = () => {
  const trackClick = useCallback((event) => {
    const target = event.currentTarget;
    const elementName = target.getAttribute('data-track') || target.id || 'unknown';
    analytics.click(elementName);
  }, []);

  const trackFormSubmit = useCallback((formName) => {
    analytics.formSubmit(formName);
  }, []);

  return { trackClick, trackFormSubmit };
};
