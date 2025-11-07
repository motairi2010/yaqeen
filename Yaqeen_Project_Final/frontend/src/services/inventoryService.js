import { supabase } from '../lib/supabase';

/**
 * خدمة المخزون - إدارة المخزون والكميات
 */

// جلب المخزون لجميع المنتجات في فرع معين
export async function getInventoryByBranch(branchId) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*)
      `)
      .eq('branch_id', branchId)
      .order('product(name_ar)');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { data: null, error };
  }
}

// جلب كمية منتج معين في فرع
export async function getProductStock(productId, branchId) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq('branch_id', branchId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product stock:', error);
    return { data: null, error };
  }
}

// جلب المنتجات التي وصلت لنقطة إعادة الطلب
export async function getLowStockProducts(branchId) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(*)
      `)
      .eq('branch_id', branchId)
      .filter('quantity', 'lte', 'reorder_point');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return { data: null, error };
  }
}

// تحديث كمية المخزون
export async function updateStock(productId, branchId, newQuantity) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('product_id', productId)
      .eq('branch_id', branchId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { data: null, error };
  }
}

// إضافة كمية للمخزون
export async function addToStock(productId, branchId, quantity) {
  try {
    // جلب الكمية الحالية
    const { data: currentStock } = await getProductStock(productId, branchId);

    if (currentStock) {
      // تحديث الكمية الموجودة
      return await updateStock(
        productId,
        branchId,
        Number(currentStock.quantity) + Number(quantity)
      );
    } else {
      // إنشاء سجل جديد
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          product_id: productId,
          branch_id: branchId,
          quantity: quantity,
          reorder_point: 10
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error adding to stock:', error);
    return { data: null, error };
  }
}

// خصم كمية من المخزون
export async function deductFromStock(productId, branchId, quantity) {
  try {
    const { data: currentStock } = await getProductStock(productId, branchId);

    if (!currentStock) {
      throw new Error('المنتج غير موجود في المخزون');
    }

    const newQuantity = Number(currentStock.quantity) - Number(quantity);

    if (newQuantity < 0) {
      throw new Error('الكمية المطلوبة غير متوفرة في المخزون');
    }

    return await updateStock(productId, branchId, newQuantity);
  } catch (error) {
    console.error('Error deducting from stock:', error);
    return { data: null, error };
  }
}

// جلب حركات المخزون
export async function getStockMovements(filters = {}) {
  try {
    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        product:products(name_ar, sku),
        branch:branches(name_ar),
        user:users_profile(full_name)
      `)
      .order('movement_date', { ascending: false })
      .limit(100);

    if (filters.productId) {
      query = query.eq('product_id', filters.productId);
    }

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }

    if (filters.movementType) {
      query = query.eq('movement_type', filters.movementType);
    }

    if (filters.startDate) {
      query = query.gte('movement_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('movement_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return { data: null, error };
  }
}

// تسجيل حركة مخزون
export async function recordStockMovement(movementData) {
  try {
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([{
        product_id: movementData.product_id,
        branch_id: movementData.branch_id,
        movement_type: movementData.movement_type,
        reference_type: movementData.reference_type,
        reference_id: movementData.reference_id,
        quantity: movementData.quantity,
        cost_per_unit: movementData.cost_per_unit,
        movement_date: new Date().toISOString(),
        user_id: movementData.user_id,
        notes: movementData.notes
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error recording stock movement:', error);
    return { data: null, error };
  }
}

// تحديث نقطة إعادة الطلب
export async function updateReorderPoint(productId, branchId, reorderPoint) {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ reorder_point: reorderPoint })
      .eq('product_id', productId)
      .eq('branch_id', branchId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating reorder point:', error);
    return { data: null, error };
  }
}

// إحصائيات المخزون
export async function getInventoryStats(branchId) {
  try {
    const { data: inventory, error } = await supabase
      .from('inventory')
      .select(`
        *,
        product:products(price, cost)
      `)
      .eq('branch_id', branchId);

    if (error) throw error;

    const stats = {
      totalProducts: inventory.length,
      totalQuantity: inventory.reduce((sum, item) => sum + Number(item.quantity), 0),
      totalValue: inventory.reduce((sum, item) =>
        sum + (Number(item.quantity) * Number(item.product?.price || 0)), 0
      ),
      totalCost: inventory.reduce((sum, item) =>
        sum + (Number(item.quantity) * Number(item.product?.cost || 0)), 0
      ),
      lowStockCount: inventory.filter(item =>
        Number(item.quantity) <= Number(item.reorder_point)
      ).length,
      outOfStockCount: inventory.filter(item => Number(item.quantity) === 0).length
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return { data: null, error };
  }
}
