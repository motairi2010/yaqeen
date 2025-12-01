import { supabase, isSupabaseAvailable } from './supabase';

const STORAGE_KEY = 'yaqeen-invoices';

async function getFromSupabase(companyId) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*)
      `)
      .eq('company_id', companyId)
      .order('invoice_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices from Supabase:', error);
    return null;
  }
}

function getFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(invoices) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export async function getAllInvoices(companyId = 'default') {
  if (isSupabaseAvailable()) {
    const data = await getFromSupabase(companyId);
    if (data) return data;
  }
  return getFromLocalStorage();
}

export async function getInvoiceById(id, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          items:invoice_items(*)
        `)
        .eq('id', id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  }

  const invoices = getFromLocalStorage();
  return invoices.find(inv => inv.id === id) || null;
}

export async function createInvoice(invoice, companyId = 'default') {
  const newInvoice = {
    ...invoice,
    company_id: companyId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseAvailable()) {
    try {
      const { items, ...invoiceData } = newInvoice;

      const { data: createdInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      if (items && items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: createdInvoice.id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      return createdInvoice;
    } catch (error) {
      console.error('Error creating invoice in Supabase:', error);
    }
  }

  const invoices = getFromLocalStorage();
  invoices.unshift(newInvoice);
  saveToLocalStorage(invoices);
  return newInvoice;
}

export async function updateInvoice(id, updates, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  }

  const invoices = getFromLocalStorage();
  const index = invoices.findIndex(inv => inv.id === id);
  if (index >= 0) {
    invoices[index] = { ...invoices[index], ...updates, updated_at: new Date().toISOString() };
    saveToLocalStorage(invoices);
    return invoices[index];
  }
  return null;
}

export async function deleteInvoice(id, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  const invoices = getFromLocalStorage();
  const filtered = invoices.filter(inv => inv.id !== id);
  saveToLocalStorage(filtered);
  return true;
}

export async function searchInvoices(query, companyId = 'default') {
  const invoices = await getAllInvoices(companyId);
  const searchTerm = query.toLowerCase();

  return invoices.filter(inv => {
    const invoiceNumber = (inv.invoice_number || '').toLowerCase();
    const customerName = (inv.customer?.name || '').toLowerCase();
    const notes = (inv.notes || '').toLowerCase();

    return (
      invoiceNumber.includes(searchTerm) ||
      customerName.includes(searchTerm) ||
      notes.includes(searchTerm)
    );
  });
}

export async function getInvoicesByDateRange(startDate, endDate, companyId = 'default') {
  const invoices = await getAllInvoices(companyId);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return invoices.filter(inv => {
    const invDate = new Date(inv.invoice_date);
    return invDate >= start && invDate <= end;
  });
}

export async function syncLocalToSupabase(companyId = 'default') {
  if (!isSupabaseAvailable()) {
    return { success: false, message: 'Supabase not available' };
  }

  try {
    const localInvoices = getFromLocalStorage();
    if (localInvoices.length === 0) {
      return { success: true, synced: 0 };
    }

    let synced = 0;
    for (const invoice of localInvoices) {
      await createInvoice(invoice, companyId);
      synced++;
    }

    localStorage.setItem(STORAGE_KEY + '_backup', JSON.stringify(localInvoices));
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    return { success: true, synced };
  } catch (error) {
    console.error('Error syncing to Supabase:', error);
    return { success: false, error: error.message };
  }
}
