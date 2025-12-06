import { useEffect, useRef, useCallback } from 'react';

export const usePerformance = (componentName) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(null);

  useEffect(() => {
    renderCountRef.current += 1;

    if (!mountTimeRef.current) {
      mountTimeRef.current = performance.now();
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered ${renderCountRef.current} times`);
    }
  });

  const measureOperation = useCallback((operationName, operation) => {
    const start = performance.now();
    const result = operation();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}.${operationName} took ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }, [componentName]);

  const measureAsyncOperation = useCallback(async (operationName, operation) => {
    const start = performance.now();
    const result = await operation();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}.${operationName} took ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }, [componentName]);

  return {
    renderCount: renderCountRef.current,
    measureOperation,
    measureAsyncOperation
  };
};

export const useRenderCount = (componentName) => {
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered: ${renderCountRef.current} times`);
    }
  });

  return renderCountRef.current;
};

export const useWhyDidYouUpdate = (name, props) => {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current && process.env.NODE_ENV === 'development') {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
};
