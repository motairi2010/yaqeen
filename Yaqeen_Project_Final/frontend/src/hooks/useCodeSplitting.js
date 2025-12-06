import { useState, useEffect } from 'react';

export const usePreload = (loader) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    loader()
      .then(() => {
        if (mounted) setLoaded(true);
      })
      .catch((err) => {
        if (mounted) setError(err);
      });

    return () => {
      mounted = false;
    };
  }, [loader]);

  return { loaded, error };
};

export const usePrefetch = (routes) => {
  useEffect(() => {
    if (!Array.isArray(routes)) return;

    const prefetchLinks = routes.map(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      prefetchLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [routes]);
};

export const useIntersectionPreload = (ref, loader) => {
  const [preloaded, setPreloaded] = useState(false);

  useEffect(() => {
    if (!ref.current || preloaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !preloaded) {
            loader().then(() => setPreloaded(true));
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, loader, preloaded]);

  return preloaded;
};
