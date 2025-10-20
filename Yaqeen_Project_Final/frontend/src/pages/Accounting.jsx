import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Receipt, FileText, Download, Calculator, TrendingUp } from 'lucide-react';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('vat');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [vatData, setVatData] = useState({
    sales: { total: 0, vat: 0, count: 0 },
    purchases: { total: 0, vat: 0, count: 0 },
    netVat: 0,
    details: []
  });
  const [zakatData, setZakatData] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    netAssets: 0,
    zakatAmount: 0,
    zakatRate: 0.025
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
      loadAccountingData();
    }
  }, [dateRange]);

  const loadAccountingData = async () => {
    setLoading(true);
    try {
      const { from, to } = dateRange;
      const toEnd = new Date(to);
      toEnd.setHours(23, 59, 59, 999);

      const [salesRes, purchasesRes, productsRes, inventoryRes] = await Promise.all([
        supabase.from('invoices')
          .select('invoice_number, invoice_date, subtotal, vat_amount, total_amount')
          .eq('invoice_type', 'sale')
          .gte('invoice_date', from)
          .lte('invoice_date', toEnd.toISOString())
          .eq('is_cancelled', false),

        supabase.from('invoices')
          .select('invoice_number, invoice_date, subtotal, vat_amount, total_amount')
          .eq('invoice_type', 'purchase')
          .gte('invoice_date', from)
          .lte('invoice_date', toEnd.toISOString())
          .eq('is_cancelled', false),

        supabase.from('products')
          .select('cost_price, sale_price')
          .eq('is_active', true),

        supabase.from('inventory')
          .select('quantity, products!inner(cost_price)')
      ]);

      const salesData = salesRes.data || [];
      const purchasesData = purchasesRes.data || [];
      const productsData = productsRes.data || [];
      const inventoryData = inventoryRes.data || [];

      const salesTotal = salesData.reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0);
      const salesVAT = salesData.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0);

      const purchasesTotal = purchasesData.reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0);
      const purchasesVAT = purchasesData.reduce((sum, inv) => sum + Number(inv.vat_amount || 0), 0);

      const netVat = salesVAT - purchasesVAT;

      const details = [
        ...salesData.map(inv => ({
          type: 'sale',
          number: inv.invoice_number,
          date: inv.invoice_date,
          amount: inv.subtotal,
          vat: inv.vat_amount
        })),
        ...purchasesData.map(inv => ({
          type: 'purchase',
          number: inv.invoice_number,
          date: inv.invoice_date,
          amount: inv.subtotal,
          vat: inv.vat_amount
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setVatData({
        sales: { total: salesTotal, vat: salesVAT, count: salesData.length },
        purchases: { total: purchasesTotal, vat: purchasesVAT, count: purchasesData.length },
        netVat,
        details
      });

      const inventoryValue = inventoryData.reduce((sum, item) => {
        const cost = Number(item.products?.cost_price || 0);
        const qty = Number(item.quantity || 0);
        return sum + (cost * qty);
      }, 0);

      const cashEquivalent = salesTotal * 0.3;
      const receivables = salesTotal * 0.2;
      const totalAssets = inventoryValue + cashEquivalent + receivables;
      const totalLiabilities = purchasesTotal * 0.3;
      const netAssets = totalAssets - totalLiabilities;
      const zakatAmount = netAssets * 0.025;

      setZakatData({
        totalAssets,
        totalLiabilities,
        netAssets,
        zakatAmount,
        zakatRate: 0.025
      });
    } catch (error) {
      console.error('Error loading accounting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const exportVATReport = () => {
    const csvContent = `رقم الفاتورة,النوع,التاريخ,المبلغ,الضريبة\n` +
      vatData.details.map(d =>
        `${d.number},${d.type === 'sale' ? 'مبيعات' : 'مشتريات'},${new Date(d.date).toLocaleDateString('ar-SA')},${d.amount},${d.vat}`
      ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vat-report-${dateRange.from}-${dateRange.to}.csv`;
    link.click();
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calculator size={28} />
            المحاسبة والضرائب
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>إدارة ضريبة القيمة المضافة والزكاة</p>
        </div>
        <button
          onClick={exportVATReport}
          style={{
            padding: '10px 20px',
            background: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <Download size={18} />
          تصدير تقرير الضريبة
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
            من:
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              style={{ marginRight: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
          </label>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>
            إلى:
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              style={{ marginRight: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
          </label>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('vat')}
            style={{
              flex: 1,
              padding: '16px 20px',
              border: 'none',
              background: activeTab === 'vat' ? '#0A3A6B' : 'transparent',
              color: activeTab === 'vat' ? 'white' : '#64748b',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            ضريبة القيمة المضافة (VAT)
          </button>
          <button
            onClick={() => setActiveTab('zakat')}
            style={{
              flex: 1,
              padding: '16px 20px',
              border: 'none',
              background: activeTab === 'zakat' ? '#0A3A6B' : 'transparent',
              color: activeTab === 'zakat' ? 'white' : '#64748b',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer'
            }}
          >
            حساب الزكاة
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0A3A6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '16px', color: '#64748b' }}>جارٍ التحميل...</p>
            </div>
          ) : (
            <>
              {activeTab === 'vat' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                      <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>ضريبة المبيعات (مستحقة)</div>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(vatData.sales.vat)} ﷼</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '6px' }}>{vatData.sales.count} فاتورة</div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                      <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>ضريبة المشتريات (قابلة للخصم)</div>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(vatData.purchases.vat)} ﷼</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '6px' }}>{vatData.purchases.count} فاتورة</div>
                    </div>

                    <div style={{ background: vatData.netVat >= 0 ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '12px', padding: '20px', color: 'white' }}>
                      <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>
                        {vatData.netVat >= 0 ? 'صافي الضريبة المستحقة' : 'صافي الضريبة القابلة للاسترداد'}
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(Math.abs(vatData.netVat))} ﷼</div>
                      <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '6px' }}>
                        {vatData.netVat >= 0 ? 'للدفع للهيئة' : 'للاسترداد من الهيئة'}
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>تفاصيل المعاملات</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>رقم الفاتورة</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>النوع</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>التاريخ</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>المبلغ</th>
                          <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569' }}>الضريبة (15%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vatData.details.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد معاملات</td>
                          </tr>
                        ) : (
                          vatData.details.slice(0, 50).map((detail, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontWeight: '500' }}>{detail.number}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  background: detail.type === 'sale' ? '#d1fae5' : '#fed7aa',
                                  color: detail.type === 'sale' ? '#065f46' : '#9a3412'
                                }}>
                                  {detail.type === 'sale' ? 'مبيعات' : 'مشتريات'}
                                </span>
                              </td>
                              <td style={{ padding: '12px', color: '#64748b' }}>{new Date(detail.date).toLocaleDateString('ar-SA')}</td>
                              <td style={{ padding: '12px', fontWeight: '600' }}>{formatCurrency(detail.amount)} ﷼</td>
                              <td style={{ padding: '12px', fontWeight: '600', color: '#0A3A6B' }}>{formatCurrency(detail.vat)} ﷼</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'zakat' && (
                <div>
                  <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#0c4a6e' }}>حساب الزكاة</h3>
                    <p style={{ color: '#475569', marginBottom: '20px' }}>
                      الزكاة تُحسب على صافي الأصول بنسبة 2.5% سنوياً
                    </p>
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: '10px' }}>
                        <span style={{ fontWeight: '600', color: '#334155' }}>إجمالي الأصول</span>
                        <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '18px' }}>{formatCurrency(zakatData.totalAssets)} ﷼</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: '10px' }}>
                        <span style={{ fontWeight: '600', color: '#334155' }}>إجمالي الخصوم</span>
                        <span style={{ fontWeight: '700', color: '#dc2626', fontSize: '18px' }}>({formatCurrency(zakatData.totalLiabilities)}) ﷼</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'white', borderRadius: '10px', border: '2px solid #0369a1' }}>
                        <span style={{ fontWeight: '700', color: '#0c4a6e' }}>صافي الأصول</span>
                        <span style={{ fontWeight: '700', color: '#0369a1', fontSize: '18px' }}>{formatCurrency(zakatData.netAssets)} ﷼</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '32px', textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '12px' }}>الزكاة المستحقة سنوياً (2.5%)</div>
                    <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>{formatCurrency(zakatData.zakatAmount)} ﷼</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>بناءً على صافي الأصول الحالي</div>
                  </div>

                  <div style={{ marginTop: '24px', padding: '20px', background: '#fef3c7', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#78350f', marginBottom: '12px' }}>ملاحظة هامة</h4>
                    <p style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.6' }}>
                      هذا الحساب تقديري ويعتمد على البيانات الحالية. يُنصح باستشارة متخصص شرعي أو محاسب قانوني لحساب الزكاة الدقيق.
                      الزكاة واجبة على المسلمين عند توفر الشروط الشرعية.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


