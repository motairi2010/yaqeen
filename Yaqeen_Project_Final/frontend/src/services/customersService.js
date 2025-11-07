import { supabase } from '../lib/supabase';

/**
 * خدمة العملاء - إدارة العملاء ونقاط الولاء
 */

// جلب جميع العملاء
export async function getAllCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching customers:', error);
    return { data: null, error };
  }
}

// جلب عميل بواسطة ID
export async function getCustomerById(id) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching customer:', error);
    return { data: null, error };
  }
}

// جلب عميل بواسطة رقم الهاتف
export async function getCustomerByPhone(phone) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    return { data: null, error };
  }
}

// البحث عن العملاء
export async function searchCustomers(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .order('name')
      .limit(50);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching customers:', error);
    return { data: null, error };
  }
}

// إنشاء عميل جديد
export async function createCustomer(customerData) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        vat_number: customerData.vat_number,
        loyalty_points: 0,
        total_purchases: 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating customer:', error);
    return { data: null, error };
  }
}

// تحديث بيانات عميل
export async function updateCustomer(id, updates) {
  try {
    const { data, error } = await supabase
      .from('customers')
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
    console.error('Error updating customer:', error);
    return { data: null, error };
  }
}

// حذف عميل (soft delete)
export async function deleteCustomer(id) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deleting customer:', error);
    return { data: null, error };
  }
}

// إضافة نقاط ولاء
export async function addLoyaltyPoints(customerId, points, purchaseAmount = 0) {
  try {
    const { data: customer } = await getCustomerById(customerId);

    if (!customer) {
      throw new Error('العميل غير موجود');
    }

    const newPoints = Number(customer.loyalty_points || 0) + Number(points);
    const newTotalPurchases = Number(customer.total_purchases || 0) + Number(purchaseAmount);

    const { data, error } = await supabase
      .from('customers')
      .update({
        loyalty_points: newPoints,
        total_purchases: newTotalPurchases,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding loyalty points:', error);
    return { data: null, error };
  }
}

// خصم نقاط ولاء (عند الاستخدام)
export async function deductLoyaltyPoints(customerId, points) {
  try {
    const { data: customer } = await getCustomerById(customerId);

    if (!customer) {
      throw new Error('العميل غير موجود');
    }

    const currentPoints = Number(customer.loyalty_points || 0);

    if (currentPoints < points) {
      throw new Error('نقاط الولاء غير كافية');
    }

    const newPoints = currentPoints - Number(points);

    const { data, error } = await supabase
      .from('customers')
      .update({
        loyalty_points: newPoints,
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error deducting loyalty points:', error);
    return { data: null, error };
  }
}

// جلب تاريخ مشتريات العميل
export async function getCustomerPurchaseHistory(customerId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        branch:branches(name_ar),
        items:invoice_items(*)
      `)
      .eq('customer_id', customerId)
      .eq('invoice_type', 'sale')
      .order('invoice_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching customer purchase history:', error);
    return { data: null, error };
  }
}

// إحصائيات العميل
export async function getCustomerStats(customerId) {
  try {
    const { data: customer } = await getCustomerById(customerId);
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', customerId)
      .eq('invoice_type', 'sale');

    if (!customer || !invoices) {
      throw new Error('فشل في جلب بيانات العميل');
    }

    const stats = {
      totalPurchases: customer.total_purchases || 0,
      loyaltyPoints: customer.loyalty_points || 0,
      totalInvoices: invoices.length,
      averagePurchase: invoices.length > 0 ?
        invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0) / invoices.length : 0,
      lastPurchaseDate: invoices.length > 0 ?
        invoices.sort((a, b) => new Date(b.invoice_date) - new Date(a.invoice_date))[0].invoice_date : null
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return { data: null, error };
  }
}

// جلب أفضل العملاء (حسب المشتريات)
export async function getTopCustomers(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('total_purchases', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching top customers:', error);
    return { data: null, error };
  }
}

// حساب نقاط الولاء من مبلغ الشراء
export function calculateLoyaltyPoints(purchaseAmount, pointsPerRiyal = 1) {
  // كل ريال = نقطة واحدة (يمكن تخصيصها)
  return Math.floor(purchaseAmount * pointsPerRiyal);
}

// تحويل نقاط الولاء إلى خصم
export function convertPointsToDiscount(points, pointValue = 0.1) {
  // كل نقطة = 0.1 ريال (يمكن تخصيصها)
  return points * pointValue;
}
