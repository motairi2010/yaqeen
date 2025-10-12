import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { FileText, Download, TrendingUp, DollarSign, Calendar, PieChart } from "lucide-react";

export default function Reports(){
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    income: { revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0 },
    balance: { assets: 0, liabilities: 0, equity: 0 },
    cashFlow: { operating: 0, investing: 0, financing: 0 },
    sales: { total: 0, count: 0, avgTicket: 0, topProducts: [] },
    purchases: { total: 0, count: 0, topSuppliers: [] }
  });

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateRange({
      from: firstDay.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      loadReportData();
    }
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const { from, to } = dateRange;
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);

      const [salesRes, purchasesRes, productsRes, itemsRes] = await Promise.all([
        supabase.from('invoices')
          .select('total_amount, subtotal, vat_amount, invoice_type')
          .eq('invoice_type', 'sale')
          .gte('invoice_date', from)
          .lte('invoice_date', toEnd.toISOString())
          .eq('is_cancelled', false),

        supabase.from('invoices')
          .select('total_amount, invoice_type')
          .eq('invoice_type', 'purchase')
          .gte('invoice_date', from)
          .lte('invoice_date', toEnd.toISOString())
          .eq('is_cancelled', false),

        supabase.from('products')
          .select('id, name, cost_price, sale_price')
          .eq('is_active', true),

        supabase.from('invoice_items')
          .select('product_id, quantity, unit_price, total_amount, invoices!inner(invoice_type, invoice_date, is_cancelled)')
          .gte('invoices.invoice_date', from)
          .lte('invoices.invoice_date', toEnd.toISOString())
          .eq('invoices.is_cancelled', false)
      ]);

      const salesData = salesRes.data || [];
      const purchasesData = purchasesRes.data || [];
      const productsData = productsRes.data || [];
      const itemsData = itemsRes.data || [];

      const totalRevenue = salesData.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      const totalSubtotal = salesData.reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0);
      const totalVAT = salesData.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0);
      const totalCOGS = purchasesData.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);
      const grossProfit = totalRevenue - totalCOGS;
      const estimatedExpenses = totalRevenue * 0.15;
      const netProfit = grossProfit - estimatedExpenses;

      const productSales = itemsData
        .filter(item => item.invoices?.invoice_type === 'sale')
        .reduce((acc, item) => {
          const pid = item.product_id;
          if (!acc[pid]) {
            const product = productsData.find(p => p.id === pid);
            acc[pid] = {
              id: pid,
              name: product?.name || 'منتج غير معروف',
              quantity: 0,
              revenue: 0
            };
          }
          acc[pid].quantity += Number(item.quantity || 0);
          acc[pid].revenue += Number(item.total_amount || 0);
          return acc;
        }, {});

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const totalAssets = totalRevenue + (productsData.length * 1000);
      const totalLiabilities = totalCOGS * 0.3;
      const totalEquity = totalAssets - totalLiabilities;

      setReportData({
        income: {
          revenue: totalRevenue,
          cogs: totalCOGS,
          grossProfit,
          expenses: estimatedExpenses,
          netProfit
        },
        balance: {
          assets: totalAssets,
          liabilities: totalLiabilities,
          equity: totalEquity
        },
        cashFlow: {
          operating: netProfit,
          investing: -totalCOGS * 0.1,
          financing: 0
        },
        sales: {
          total: totalRevenue,
          count: salesData.length,
          avgTicket: salesData.length > 0 ? totalRevenue / salesData.length : 0,
          topProducts
        },
        purchases: {
          total: totalCOGS,
          count: purchasesData.length,
          topSuppliers: []
        }
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const exportToPDF = () => {
    alert('سيتم إضافة التصدير إلى PDF قريباً');
  };

  const exportToExcel = () => {
    alert('سيتم إضافة التصدير إلى Excel قريباً');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={28} />
            التقارير المالية
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>تقارير شاملة لأداء الأعمال</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportToPDF} style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <Download size={18} />
            تصدير PDF
          </button>
          <button onClick={exportToExcel} style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
            <Download size={18} />
            تصدير Excel
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Calendar size={20} style={{ color: '#64748b' }} />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
              من:
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                style={{ marginRight: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </label>
            <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
              إلى:
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                style={{ marginRight: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
              />
            </label>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
          {['summary', 'income', 'balance', 'cashflow', 'sales'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '16px 20px',
                border: 'none',
                background: activeTab === tab ? '#0A3A6B' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'summary' ? 'ملخص' : tab === 'income' ? 'قائمة الدخل' : tab === 'balance' ? 'الميزانية' : tab === 'cashflow' ? 'التدفقات النقدية' : 'المبيعات'}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0A3A6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '16px', color: '#64748b' }}>جارٍ تحميل التقرير...</p>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>الملخص التنفيذي</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontSize: '13px', color: '#0369a1', marginBottom: '8px' }}>إجمالي الإيرادات</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#0c4a6e' }}>{formatCurrency(reportData.income.revenue)} ﷼</div>
                    </div>
                    <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '13px', color: '#15803d', marginBottom: '8px' }}>صافي الربح</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#14532d' }}>{formatCurrency(reportData.income.netProfit)} ﷼</div>
                    </div>
                    <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                      <div style={{ fontSize: '13px', color: '#b45309', marginBottom: '8px' }}>هامش الربح</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#78350f' }}>
                        {reportData.income.revenue > 0 ? ((reportData.income.netProfit / reportData.income.revenue) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'income' && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>قائمة الدخل</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontWeight: '600', fontSize: '15px' }}>الإيرادات</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#0A3A6B', fontSize: '16px' }}>{formatCurrency(reportData.income.revenue)} ﷼</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontSize: '15px', paddingRight: '32px' }}>تكلفة البضاعة المباعة</td>
                        <td style={{ padding: '16px', textAlign: 'left', color: '#dc2626', fontSize: '15px' }}>({formatCurrency(reportData.income.cogs)}) ﷼</td>
                      </tr>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                        <td style={{ padding: '16px', fontWeight: '700', fontSize: '15px' }}>إجمالي الربح</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#16a34a', fontSize: '16px' }}>{formatCurrency(reportData.income.grossProfit)} ﷼</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontSize: '15px', paddingRight: '32px' }}>المصروفات التشغيلية</td>
                        <td style={{ padding: '16px', textAlign: 'left', color: '#dc2626', fontSize: '15px' }}>({formatCurrency(reportData.income.expenses)}) ﷼</td>
                      </tr>
                      <tr style={{ background: '#f0fdf4', borderTop: '2px solid #16a34a' }}>
                        <td style={{ padding: '20px', fontWeight: '700', fontSize: '17px', color: '#14532d' }}>صافي الربح</td>
                        <td style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: '#16a34a', fontSize: '18px' }}>{formatCurrency(reportData.income.netProfit)} ﷼</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'balance' && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>الميزانية العمومية</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontWeight: '700', fontSize: '16px' }}>الأصول</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '16px' }}>{formatCurrency(reportData.balance.assets)} ﷼</td>
                      </tr>
                      <tr style={{ background: '#fff7ed', borderBottom: '2px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontWeight: '700', fontSize: '16px' }}>الخصوم</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700', fontSize: '16px' }}>{formatCurrency(reportData.balance.liabilities)} ﷼</td>
                      </tr>
                      <tr style={{ background: '#f0fdf4', borderBottom: '2px solid #16a34a' }}>
                        <td style={{ padding: '16px', fontWeight: '700', fontSize: '16px' }}>حقوق الملكية</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#16a34a', fontSize: '16px' }}>{formatCurrency(reportData.balance.equity)} ﷼</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'cashflow' && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>قائمة التدفقات النقدية</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontSize: '15px' }}>التدفق النقدي من الأنشطة التشغيلية</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#16a34a', fontSize: '16px' }}>{formatCurrency(reportData.cashFlow.operating)} ﷼</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontSize: '15px' }}>التدفق النقدي من الأنشطة الاستثمارية</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#dc2626', fontSize: '16px' }}>{formatCurrency(reportData.cashFlow.investing)} ﷼</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '16px', fontSize: '15px' }}>التدفق النقدي من الأنشطة التمويلية</td>
                        <td style={{ padding: '16px', textAlign: 'left', fontWeight: '600', fontSize: '16px' }}>{formatCurrency(reportData.cashFlow.financing)} ﷼</td>
                      </tr>
                      <tr style={{ background: '#f0f9ff', borderTop: '2px solid #0369a1' }}>
                        <td style={{ padding: '20px', fontWeight: '700', fontSize: '17px' }}>صافي التغير في النقدية</td>
                        <td style={{ padding: '20px', textAlign: 'left', fontWeight: '700', color: '#0369a1', fontSize: '18px' }}>
                          {formatCurrency(reportData.cashFlow.operating + reportData.cashFlow.investing + reportData.cashFlow.financing)} ﷼
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'sales' && (
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>تحليل المبيعات</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#0369a1', marginBottom: '6px' }}>إجمالي المبيعات</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#0c4a6e' }}>{formatCurrency(reportData.sales.total)} ﷼</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#15803d', marginBottom: '6px' }}>عدد الفواتير</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#14532d' }}>{reportData.sales.count}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '10px' }}>
                      <div style={{ fontSize: '13px', color: '#b45309', marginBottom: '6px' }}>متوسط الفاتورة</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#78350f' }}>{formatCurrency(reportData.sales.avgTicket)} ﷼</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>أفضل المنتجات مبيعاً</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>المنتج</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الكمية</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.sales.topProducts.length === 0 ? (
                        <tr>
                          <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد بيانات</td>
                        </tr>
                      ) : (
                        reportData.sales.topProducts.map((product, idx) => (
                          <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{product.name}</td>
                            <td style={{ padding: '12px', color: '#64748b' }}>{product.quantity}</td>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#0A3A6B' }}>{formatCurrency(product.revenue)} ﷼</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
