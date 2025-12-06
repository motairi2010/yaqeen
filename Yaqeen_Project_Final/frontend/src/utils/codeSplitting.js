import { lazy } from 'react';

export const createAsyncComponent = (loader, options = {}) => {
  const {
    fallback = null,
    delay = 200,
    timeout = 10000
  } = options;

  let Component = null;
  let promise = null;
  let error = null;

  const load = () => {
    if (!promise) {
      promise = Promise.race([
        loader(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Load timeout')), timeout)
        )
      ]).then(module => {
        Component = module.default || module;
        return Component;
      }).catch(err => {
        error = err;
        throw err;
      });
    }
    return promise;
  };

  const LazyComponent = lazy(load);

  return {
    Component: LazyComponent,
    preload: load,
    isLoaded: () => Component !== null,
    hasError: () => error !== null,
  };
};

export const routeBasedSplitting = {
  Dashboard: () => import('../pages/Dashboard'),
  Products: () => import('../pages/Products'),
  Customers: () => import('../pages/Customers'),
  Invoices: () => import('../pages/Invoices'),
  Reports: () => import('../pages/Reports'),
  Settings: () => import('../pages/Settings'),
  POS: () => import('../pages/POS'),
  Inventory: () => import('../pages/Inventory'),
  Suppliers: () => import('../pages/Suppliers'),
  CashManagement: () => import('../pages/CashManagement'),
  Promotions: () => import('../pages/Promotions'),
  Returns: () => import('../pages/Returns'),
  Sales: () => import('../pages/Sales'),
  Purchasing: () => import('../pages/Purchasing'),
  Accounting: () => import('../pages/Accounting'),
  PricingEngine: () => import('../pages/PricingEngine'),
};

export const preloadRoute = (routeName) => {
  if (routeBasedSplitting[routeName]) {
    return routeBasedSplitting[routeName]();
  }
  return Promise.resolve();
};

export const preloadRoutes = (routeNames) => {
  return Promise.all(routeNames.map(preloadRoute));
};

export const createLoadableRoute = (importFunc) => {
  return createAsyncComponent(importFunc, {
    fallback: <div>جاري التحميل...</div>,
    delay: 200,
    timeout: 10000
  });
};
