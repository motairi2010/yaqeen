import { useEffect } from 'react';
import { useInvoiceStore } from '../stores/useInvoiceStore';

export function useInvoices() {
  const {
    invoices,
    isLoading,
    error,
    loadInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices,
    getStats,
    clearError
  } = useInvoiceStore();

  useEffect(() => {
    if (invoices.length === 0 && !isLoading) {
      loadInvoices();
    }
  }, []);

  return {
    invoices,
    isLoading,
    error,
    loadInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices,
    getStats,
    clearError
  };
}

export function useInvoice(id) {
  const {
    currentInvoice,
    isLoading,
    error,
    loadInvoice,
    updateInvoice,
    clearError
  } = useInvoiceStore();

  useEffect(() => {
    if (id && (!currentInvoice || currentInvoice.id !== id)) {
      loadInvoice(id);
    }
  }, [id]);

  return {
    invoice: currentInvoice,
    isLoading,
    error,
    updateInvoice,
    clearError
  };
}
