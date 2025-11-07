import { supabase } from '../lib/supabase';
import { buildZatcaTLVBase64 } from '../lib/zatca';

/**
 * خدمة الفواتير - إدارة الفواتير والمبيعات
 */

// إنشاء فاتورة جديدة
export async function createInvoice(invoiceData) {
  try {
    // توليد رقم فاتورة
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

    // إنشاء الفاتورة
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([{
        invoice_number: invoiceNumber,
        invoice_type: invoiceData.invoice_type || 'sale',
        customer_id: invoiceData.customer_id,
        branch_id: invoiceData.branch_id,
        user_id: invoiceData.user_id,
        invoice_date: new Date().toISOString(),
        payment_status: invoiceData.payment_status || 'paid',
        payment_method: invoiceData.payment_method,
        notes: invoiceData.notes
      }])
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // إضافة عناصر الفاتورة
    if (invoiceData.items && invoiceData.items.length > 0) {
      const items = invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        description: item.description || item.name,
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        vat_rate: item.vat_rate || 0.15,
        vat_amount: (item.quantity * item.unit_price * (item.vat_rate || 0.15)),
        discount_amount: item.discount_amount || 0,
        line_total: (item.quantity * item.unit_price * (1 + (item.vat_rate || 0.15))) - (item.discount_amount || 0)
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(items);

      if (itemsError) throw itemsError;
    }

    // جلب الفاتورة الكاملة مع العناصر
    const { data: fullInvoice } = await getInvoiceById(invoice.id);

    // توليد رمز ZATCA QR
    if (fullInvoice) {
      const zatcaData = await generateZatcaQR(fullInvoice);
      await supabase
        .from('invoices')
        .update({ zatca_qr: zatcaData })
        .eq('id', invoice.id);
    }

    return { data: fullInvoice, error: null };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { data: null, error };
  }
}

// جلب فاتورة بواسطة ID
export async function getInvoiceById(id) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        branch:branches(*),
        user:users_profile(full_name),
        items:invoice_items(
          *,
          product:products(*)
        ),
        payments:payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { data: null, error };
  }
}

// جلب فاتورة بواسطة رقم الفاتورة
export async function getInvoiceByNumber(invoiceNumber) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        branch:branches(*),
        user:users_profile(full_name),
        items:invoice_items(
          *,
          product:products(*)
        ),
        payments:payments(*)
      `)
      .eq('invoice_number', invoiceNumber)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return { data: null, error };
  }
}

// جلب قائمة الفواتير
export async function getInvoices(filters = {}) {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(name),
        branch:branches(name_ar),
        user:users_profile(full_name)
      `)
      .order('invoice_date', { ascending: false });

    if (filters.branchId) {
      query = query.eq('branch_id', filters.branchId);
    }

    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    if (filters.paymentStatus) {
      query = query.eq('payment_status', filters.paymentStatus);
    }

    if (filters.invoiceType) {
      query = query.eq('invoice_type', filters.invoiceType);
    }

    if (filters.startDate) {
      query = query.gte('invoice_date', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('invoice_date', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { data: null, error };
  }
}

// تحديث حالة الدفع
export async function updatePaymentStatus(invoiceId, paymentStatus) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ payment_status: paymentStatus })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { data: null, error };
  }
}

// تسجيل دفعة
export async function recordPayment(paymentData) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        invoice_id: paymentData.invoice_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        reference_number: paymentData.reference_number,
        user_id: paymentData.user_id
      }])
      .select()
      .single();

    if (error) throw error;

    // تحديث حالة الفاتورة
    const { data: invoice } = await getInvoiceById(paymentData.invoice_id);
    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const newStatus = totalPaid >= Number(invoice.total_amount) ? 'paid' :
                       totalPaid > 0 ? 'partial' : 'pending';

      await updatePaymentStatus(paymentData.invoice_id, newStatus);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { data: null, error };
  }
}

// إلغاء فاتورة
export async function cancelInvoice(invoiceId, reason) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        payment_status: 'cancelled',
        notes: reason
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    return { data: null, error };
  }
}

// توليد رمز ZATCA QR
async function generateZatcaQR(invoice) {
  try {
    const branch = invoice.branch || {};

    const zatcaData = buildZatcaTLVBase64({
      sellerName: branch.name_ar || 'يَقين للتجزئة',
      vatNumber: branch.vat_number || '300000000000003',
      timestamp: invoice.invoice_date,
      totalWithVat: invoice.total_amount,
      vatAmount: invoice.vat_amount
    });

    return zatcaData;
  } catch (error) {
    console.error('Error generating ZATCA QR:', error);
    return null;
  }
}

// إحصائيات المبيعات
export async function getSalesStats(branchId, startDate, endDate) {
  try {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('branch_id', branchId)
      .eq('invoice_type', 'sale')
      .gte('invoice_date', startDate)
      .lte('invoice_date', endDate);

    if (error) throw error;

    const stats = {
      totalInvoices: invoices.length,
      totalSales: invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0),
      totalVat: invoices.reduce((sum, inv) => sum + Number(inv.vat_amount), 0),
      paidInvoices: invoices.filter(inv => inv.payment_status === 'paid').length,
      pendingInvoices: invoices.filter(inv => inv.payment_status === 'pending').length,
      averageInvoiceValue: invoices.length > 0 ?
        invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0) / invoices.length : 0
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return { data: null, error };
  }
}

// البحث عن الفواتير
export async function searchInvoices(searchTerm) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(name),
        branch:branches(name_ar)
      `)
      .or(`invoice_number.ilike.%${searchTerm}%,customer.name.ilike.%${searchTerm}%`)
      .order('invoice_date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error searching invoices:', error);
    return { data: null, error };
  }
}
