import { supabase, isSupabaseAvailable } from './supabase';

const STORAGE_KEY = 'yaq-customers';

async function getFromSupabase(companyId) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers from Supabase:', error);
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

function saveToLocalStorage(customers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export async function getAllCustomers(companyId = 'default') {
  if (isSupabaseAvailable()) {
    const data = await getFromSupabase(companyId);
    if (data) return data;
  }
  return getFromLocalStorage();
}

export async function getCustomerById(id, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  }

  const customers = getFromLocalStorage();
  return customers.find(c => c.id === id) || null;
}

export async function getCustomerByMobile(mobile, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('company_id', companyId)
        .eq('mobile', mobile)
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  }

  const customers = getFromLocalStorage();
  return customers.find(c => c.mobile === mobile) || null;
}

export async function createCustomer(customer, companyId = 'default') {
  const newCustomer = {
    id: crypto.randomUUID(),
    ...customer,
    company_id: companyId,
    loyalty_points: customer.loyalty_points || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating customer in Supabase:', error);
    }
  }

  const customers = getFromLocalStorage();
  customers.push(newCustomer);
  saveToLocalStorage(customers);
  return newCustomer;
}

export async function updateCustomer(id, updates, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('company_id', companyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  }

  const customers = getFromLocalStorage();
  const index = customers.findIndex(c => c.id === id);
  if (index >= 0) {
    customers[index] = { ...customers[index], ...updates, updated_at: new Date().toISOString() };
    saveToLocalStorage(customers);
    return customers[index];
  }
  return null;
}

export async function deleteCustomer(id, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('company_id', companyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  }

  const customers = getFromLocalStorage();
  const filtered = customers.filter(c => c.id !== id);
  saveToLocalStorage(filtered);
  return true;
}

export async function updateLoyaltyPoints(id, points, companyId = 'default') {
  const customer = await getCustomerById(id, companyId);
  if (!customer) return null;

  const newPoints = Math.max(0, (customer.loyalty_points || 0) + points);
  return updateCustomer(id, { loyalty_points: newPoints }, companyId);
}

export async function searchCustomers(query, companyId = 'default') {
  const customers = await getAllCustomers(companyId);
  const searchTerm = query.toLowerCase();

  return customers.filter(customer => {
    const name = (customer.name || '').toLowerCase();
    const mobile = (customer.mobile || '').toLowerCase();
    const email = (customer.email || '').toLowerCase();

    return name.includes(searchTerm) || mobile.includes(searchTerm) || email.includes(searchTerm);
  });
}
