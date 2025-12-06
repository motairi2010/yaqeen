import { lazy, Suspense } from 'react';

export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={fallback || <div>جاري التحميل...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export const lazyLoadWithRetry = (importFunc, retries = 3, fallback = null) => {
  const loadWithRetry = () => {
    return new Promise((resolve, reject) => {
      const attemptLoad = (attemptsLeft) => {
        importFunc()
          .then(resolve)
          .catch((error) => {
            if (attemptsLeft === 1) {
              reject(error);
              return;
            }
            setTimeout(() => attemptLoad(attemptsLeft - 1), 1000);
          });
      };
      attemptLoad(retries);
    });
  };

  const LazyComponent = lazy(loadWithRetry);

  return (props) => (
    <Suspense fallback={fallback || <div>جاري التحميل...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export const preloadComponent = (importFunc) => {
  return importFunc();
};
