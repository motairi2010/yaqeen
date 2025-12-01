import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as customerService from '../services/customerService';

export const useCustomerStore = create(
  persist(
    (set, get) => ({
      customers: [],
      currentCustomer: null,
      isLoading: false,
      error: null,
      companyId: 'default',

      setCompanyId: (companyId) => set({ companyId }),

      loadCustomers: async () => {
        set({ isLoading: true, error: null });
        try {
          const customers = await customerService.getAllCustomers(get().companyId);
          set({ customers, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadCustomer: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const customer = await customerService.getCustomerById(id, get().companyId);
          set({ currentCustomer: customer, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadCustomerByMobile: async (mobile) => {
        set({ isLoading: true, error: null });
        try {
          const customer = await customerService.getCustomerByMobile(mobile, get().companyId);
          set({ currentCustomer: customer, isLoading: false });
          return customer;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      createCustomer: async (customer) => {
        set({ isLoading: true, error: null });
        try {
          const newCustomer = await customerService.createCustomer(customer, get().companyId);
          set(state => ({
            customers: [...state.customers, newCustomer],
            currentCustomer: newCustomer,
            isLoading: false
          }));
          return newCustomer;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateCustomer: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedCustomer = await customerService.updateCustomer(id, updates, get().companyId);
          set(state => ({
            customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
            currentCustomer: state.currentCustomer?.id === id ? updatedCustomer : state.currentCustomer,
            isLoading: false
          }));
          return updatedCustomer;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteCustomer: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await customerService.deleteCustomer(id, get().companyId);
          set(state => ({
            customers: state.customers.filter(c => c.id !== id),
            currentCustomer: state.currentCustomer?.id === id ? null : state.currentCustomer,
            isLoading: false
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateLoyaltyPoints: async (id, points) => {
        set({ isLoading: true, error: null });
        try {
          const updatedCustomer = await customerService.updateLoyaltyPoints(id, points, get().companyId);
          set(state => ({
            customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
            currentCustomer: state.currentCustomer?.id === id ? updatedCustomer : state.currentCustomer,
            isLoading: false
          }));
          return updatedCustomer;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      searchCustomers: async (query) => {
        set({ isLoading: true, error: null });
        try {
          const results = await customerService.searchCustomers(query, get().companyId);
          set({ customers: results, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      getTopCustomers: (limit = 10) => {
        const { customers } = get();
        return customers
          .slice()
          .sort((a, b) => (b.loyalty_points || 0) - (a.loyalty_points || 0))
          .slice(0, limit);
      },

      clearError: () => set({ error: null }),

      reset: () => set({
        customers: [],
        currentCustomer: null,
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'yaqeen-customer-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ companyId: state.companyId })
    }
  )
);
