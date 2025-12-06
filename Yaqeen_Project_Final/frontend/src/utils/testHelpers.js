import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

export const renderWithRouter = (ui, options = {}) => {
  const { route = '/' } = options;

  window.history.pushState({}, 'Test page', route);

  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
};

export const mockLocalStorage = () => {
  const store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

export const mockSupabase = () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => Promise.resolve({ data: [], error: null })),
    insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    update: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    delete: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    eq: jest.fn(function() { return this; }),
    single: jest.fn(function() { return this; }),
    maybeSingle: jest.fn(function() { return this; }),
  })),
  auth: {
    signIn: jest.fn(() => Promise.resolve({ user: null, error: null })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    user: jest.fn(() => null),
  },
});

export const mockInvoice = {
  id: '123',
  invoice_number: 'INV-001',
  company_id: 'company-1',
  customer_id: 'customer-1',
  invoice_date: new Date().toISOString(),
  subtotal: 100,
  vat_amount: 15,
  total: 115,
  discount: 0,
  payment_method: 'cash',
  status: 'paid',
  notes: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockProduct = {
  id: '456',
  company_id: 'company-1',
  sku: 'PROD-001',
  name: 'Test Product',
  price: 100,
  cost: 50,
  quantity: 10,
  vat_rate: 0.15,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockCustomer = {
  id: '789',
  company_id: 'company-1',
  name: 'Test Customer',
  mobile: '0500000000',
  email: 'test@example.com',
  loyalty_points: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const waitFor = (callback, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error);
        } else {
          setTimeout(check, 100);
        }
      }
    };

    check();
  });
};

export const mockFetch = (data, ok = true) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
    })
  );
};
