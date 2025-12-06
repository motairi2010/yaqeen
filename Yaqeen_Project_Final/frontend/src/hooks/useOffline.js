import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState({
    online: navigator.onLine,
    since: Date.now(),
  });

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus({
        online: true,
        since: Date.now(),
      });
    };

    const handleOffline = () => {
      setNetworkStatus({
        online: false,
        since: Date.now(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return networkStatus;
};
