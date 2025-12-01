import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as invoiceService from '../services/invoiceService';

export const useInvoiceStore = create(
  persist(
    (set, get) => ({
      invoices: [],
      currentInvoice: null,
      isLoading: false,
      error: null,
      companyId: 'default',

      setCompanyId: (companyId) => set({ companyId }),

      loadInvoices: async () => {
        set({ isLoading: true, error: null });
        try {
          const invoices = await invoiceService.getAllInvoices(get().companyId);
          set({ invoices, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      loadInvoice: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const invoice = await invoiceService.getInvoiceById(id, get().companyId);
          set({ currentInvoice: invoice, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      createInvoice: async (invoice) => {
        set({ isLoading: true, error: null });
        try {
          const newInvoice = await invoiceService.createInvoice(invoice, get().companyId);
          set(state => ({
            invoices: [newInvoice, ...state.invoices],
            currentInvoice: newInvoice,
            isLoading: false
          }));
          return newInvoice;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateInvoice: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedInvoice = await invoiceService.updateInvoice(id, updates, get().companyId);
          set(state => ({
            invoices: state.invoices.map(inv => inv.id === id ? updatedInvoice : inv),
            currentInvoice: state.currentInvoice?.id === id ? updatedInvoice : state.currentInvoice,
            isLoading: false
          }));
          return updatedInvoice;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteInvoice: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await invoiceService.deleteInvoice(id, get().companyId);
          set(state => ({
            invoices: state.invoices.filter(inv => inv.id !== id),
            currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice,
            isLoading: false
          }));
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      searchInvoices: async (query) => {
        set({ isLoading: true, error: null });
        try {
          const results = await invoiceService.searchInvoices(query, get().companyId);
          set({ invoices: results, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      getInvoicesByDateRange: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const results = await invoiceService.getInvoicesByDateRange(startDate, endDate, get().companyId);
          set({ invoices: results, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      getStats: () => {
        const { invoices } = get();
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const totalCount = invoices.length;
        const paidCount = invoices.filter(inv => inv.status === 'paid').length;
        const pendingCount = invoices.filter(inv => inv.status === 'pending').length;

        return {
          totalRevenue,
          totalCount,
          paidCount,
          pendingCount,
          averageInvoice: totalCount > 0 ? totalRevenue / totalCount : 0
        };
      },

      clearError: () => set({ error: null }),

      reset: () => set({
        invoices: [],
        currentInvoice: null,
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'yaqeen-invoice-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ companyId: state.companyId })
    }
  )
);
