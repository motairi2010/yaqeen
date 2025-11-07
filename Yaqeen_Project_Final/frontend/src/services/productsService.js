import { supabase } from '../lib/supabase';

/**
 * خدمة المنتجات - التعامل مع المنتجات في قاعدة البيانات
 */

// جلب جميع المنتجات النشطة
export async function getAllProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name_ar');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, error };
  }
}

// جلب منتج بواسطة SKU أو Barcode
export async function findProductByCode(code) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`sku.eq.${code},barcode.eq.${code}`)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error finding product:', error);
    return { data: null, error };
  }
}

// جلب منتج بواسطة ID
export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { data: null, error };
  }
}

// البحث عن المنتجات
export async function searchProducts(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name_ar.ilike.%${searchTerm}%,name_en.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .order('name_ar')
      .limit(50);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching products:', error);
    return { data: null, error };
  }
}

// إنشاء منتج جديد
export async function createProduct(productData) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        sku: productData.sku,
        barcode: productData.barcode,
        name_ar: productData.name_ar,
        name_en: productData.name_en,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        cost: productData.cost || 0,
        vat_rate: productData.vat_rate || 0.15,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating product:', error);
    return { data: null, error };
  }
}

// تحديث منتج
export async function updateProduct(id, updates) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating product:', error);
    return { data: null, error };
  }
}

// حذف منتج (soft delete)
export async function deleteProduct(id) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { data: null, error };
  }
}

// جلب المنتجات حسب الفئة
export async function getProductsByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name_ar');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return { data: null, error };
  }
}

// جلب جميع الفئات
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true)
      .order('category');

    if (error) throw error;

    // استخراج الفئات الفريدة
    const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];

    return { data: uniqueCategories, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error };
  }
}
