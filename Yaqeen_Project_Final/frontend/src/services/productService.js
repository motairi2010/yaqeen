import { supabase, isSupabaseAvailable } from './supabase';

const STORAGE_KEY = 'yaqeen-inventory';

async function getFromSupabase(companyId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    return null;
  }
}

function getFromLocalStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return {};
    const obj = JSON.parse(data);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function saveToLocalStorage(productsMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productsMap));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export async function getAllProducts(companyId = 'default') {
  if (isSupabaseAvailable()) {
    const data = await getFromSupabase(companyId);
    if (data) return data;
  }

  const map = getFromLocalStorage();
  return Object.values(map);
}

export async function getProductBySku(sku, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', companyId)
        .eq('sku', sku)
        .maybeSingle();

      if (error) throw error;
      if (data) return data;
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }

  const map = getFromLocalStorage();
  return map[sku] || null;
}

export async function createProduct(product, companyId = 'default') {
  const newProduct = {
    ...product,
    company_id: companyId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product in Supabase:', error);
    }
  }

  const map = getFromLocalStorage();
  map[product.sku] = newProduct;
  saveToLocalStorage(map);
  return newProduct;
}

export async function updateProduct(sku, updates, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('company_id', companyId)
        .eq('sku', sku)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  const map = getFromLocalStorage();
  if (map[sku]) {
    map[sku] = { ...map[sku], ...updates, updated_at: new Date().toISOString() };
    saveToLocalStorage(map);
    return map[sku];
  }
  return null;
}

export async function deleteProduct(sku, companyId = 'default') {
  if (isSupabaseAvailable()) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('company_id', companyId)
        .eq('sku', sku);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  const map = getFromLocalStorage();
  delete map[sku];
  saveToLocalStorage(map);
  return true;
}

export async function updateStock(sku, quantityChange, companyId = 'default') {
  const product = await getProductBySku(sku, companyId);
  if (!product) return null;

  const newQuantity = (product.quantity || 0) + quantityChange;
  return updateProduct(sku, { quantity: newQuantity }, companyId);
}

export async function searchProducts(query, companyId = 'default') {
  const products = await getAllProducts(companyId);
  const searchTerm = query.toLowerCase();

  return products.filter(product => {
    const name = (product.name || '').toLowerCase();
    const sku = (product.sku || '').toLowerCase();

    return name.includes(searchTerm) || sku.includes(searchTerm);
  });
}
