import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, AlertTriangle, BarChart3 } from "lucide-react";

export default function Dashboard(){
  const [stats, setStats] = useState({
    todaySales: 0,
    yesterdaySales: 0,
    monthSales: 0,
    lastMonthSales: 0,
    totalProfit: 0,
    profitMargin: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingInvoices: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [
        todaySalesRes,
        yesterdaySalesRes,
        monthSalesRes,
        lastMonthSalesRes,
        customersRes,
        productsRes,
        inventoryRes,
        pendingInvoicesRes,
        recentInvoicesRes
      ] = await Promise.all([
        supabase.from('invoices').select('total_amount').eq('invoice_type', 'sale').gte('invoice_date', todayStart).eq('is_cancelled', false),
        supabase.from('invoices').select('total_amount').eq('invoice_type', 'sale').gte('invoice_date', yesterdayStart).lt('invoice_date', todayStart).eq('is_cancelled', false),
        supabase.from('invoices').select('total_amount').eq('invoice_type', 'sale').gte('invoice_date', monthStart).eq('is_cancelled', false),
        supabase.from('invoices').select('total_amount').eq('invoice_type', 'sale').gte('invoice_date', lastMonthStart).lt('invoice_date', monthStart).eq('is_cancelled', false),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('inventory').select('quantity, min_quantity').lt('quantity', supabase.raw('min_quantity')),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('payment_status', 'unpaid').eq('is_cancelled', false),
        supabase.from('invoices').select('invoice_number, total_amount, invoice_date, payment_status, customers(name)').eq('invoice_type', 'sale').order('invoice_date', { ascending: false }).limit(5)
      ]);

      const todaySales = todaySalesRes.data?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const yesterdaySales = yesterdaySalesRes.data?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const monthSales = monthSalesRes.data?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const lastMonthSales = lastMonthSalesRes.data?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

      const profitMargin = monthSales > 0 ? ((monthSales * 0.295) / monthSales * 100) : 0;

      setStats({
        todaySales,
        yesterdaySales,
        monthSales,
        lastMonthSales,
        totalProfit: monthSales * 0.295,
        profitMargin,
        lowStockCount: inventoryRes.data?.length || 0,
        totalCustomers: customersRes.count || 0,
        totalProducts: productsRes.count || 0,
        pendingInvoices: pendingInvoicesRes.count || 0
      });

      setRecentInvoices(recentInvoicesRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0A3A6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>جارٍ تحميل البيانات...</p>
      </div>
    );
  }

  const todayChange = calculatePercentChange(stats.todaySales, stats.yesterdaySales);
  const monthChange = calculatePercentChange(stats.monthSales, stats.lastMonthSales);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>لوحة المعلومات</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>مرحبًا بك في نظام يَقين المحاسبي المتكامل</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>مبيعات اليوم</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{formatCurrency(stats.todaySales)} ﷼</div>
            </div>
            <DollarSign size={32} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            {todayChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(todayChange)}% {todayChange >= 0 ? 'زيادة' : 'نقص'} عن أمس</span>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>مبيعات الشهر</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{formatCurrency(stats.monthSales)} ﷼</div>
            </div>
            <ShoppingCart size={32} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            {monthChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(monthChange)}% {monthChange >= 0 ? 'زيادة' : 'نقص'} عن الشهر الماضي</span>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>الربح المقدر</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{formatCurrency(stats.totalProfit)} ﷼</div>
            </div>
            <BarChart3 size={32} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '13px' }}>هامش ربح: {stats.profitMargin.toFixed(1)}%</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>مخزون منخفض</div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{stats.lowStockCount} صنف</div>
            </div>
            <AlertTriangle size={32} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '13px' }}>يحتاج إعادة طلب</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '10px' }}>
            <Users size={24} style={{ color: '#0369a1' }} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{stats.totalCustomers}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>إجمالي العملاء</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px' }}>
            <Package size={24} style={{ color: '#15803d' }} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{stats.totalProducts}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>المنتجات النشطة</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '10px' }}>
            <AlertTriangle size={24} style={{ color: '#b45309' }} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>{stats.pendingInvoices}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>فواتير معلقة</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>آخر الفواتير</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>رقم الفاتورة</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>العميل</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>التاريخ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>المبلغ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد فواتير</td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.invoice_number} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{invoice.invoice_number}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{invoice.customers?.name || 'عميل نقدي'}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#0A3A6B' }}>{formatCurrency(invoice.total_amount)} ﷼</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: invoice.payment_status === 'paid' ? '#d1fae5' : invoice.payment_status === 'partial' ? '#fed7aa' : '#fee2e2',
                        color: invoice.payment_status === 'paid' ? '#065f46' : invoice.payment_status === 'partial' ? '#9a3412' : '#991b1b'
                      }}>
                        {invoice.payment_status === 'paid' ? 'مدفوع' : invoice.payment_status === 'partial' ? 'جزئي' : 'غير مدفوع'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}







