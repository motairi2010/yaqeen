import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Download, FileText, Calendar } from "lucide-react";

export default function Sales() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInvoices: 0,
    avgInvoiceValue: 0,
    totalItems: 0,
    totalVAT: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedInvoices, setSelectedInvoices] = useState(new Set());

  useEffect(() => {
    loadSalesData();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, dateRange, paymentFilter]);

  const loadSalesData = async () => {
    try {
      setLoading(true);

      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*, customers(name, email, phone), invoice_items(quantity, price, vat_amount)')
        .eq('invoice_type', 'sale')
        .eq('is_cancelled', false)
        .order('invoice_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      setInvoices(invoicesData || []);
      calculateStats(invoicesData || []);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalSales = 0;
    let totalVAT = 0;
    let totalItems = 0;
    let todaySales = 0;
    let weekSales = 0;
    let monthSales = 0;

    data.forEach(inv => {
      const amount = Number(inv.total_amount || 0);
      totalSales += amount;
      totalVAT += Number(inv.vat_amount || 0);
      totalItems += (inv.invoice_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

      const invDate = new Date(inv.invoice_date);
      if (invDate >= todayStart) todaySales += amount;
      if (invDate >= weekStart) weekSales += amount;
      if (invDate >= monthStart) monthSales += amount;
    });

    setStats({
      totalSales,
      totalInvoices: data.length,
      avgInvoiceValue: data.length > 0 ? totalSales / data.length : 0,
      totalItems,
      totalVAT,
      todaySales,
      weekSales,
      monthSales
    });
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoice_number.toLowerCase().includes(term) ||
        inv.customers?.name?.toLowerCase().includes(term)
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(inv => new Date(inv.invoice_date) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter(inv => new Date(inv.invoice_date) <= new Date(dateRange.end));
    }

    if (paymentFilter !== "all") {
      filtered = filtered.filter(inv => inv.payment_status === paymentFilter);
    }

    setFilteredInvoices(filtered);
  };

  const toggleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(invoiceId)) {
        newSet.delete(invoiceId);
      } else {
        newSet.add(invoiceId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.size === filteredInvoices.length) {
      setSelectedInvoices(new Set());
    } else {
      setSelectedInvoices(new Set(filteredInvoices.map(inv => inv.id)));
    }
  };

  const exportToCSV = () => {
    const selectedData = filteredInvoices.filter(inv => selectedInvoices.has(inv.id));
    if (selectedData.length === 0) {
      alert('الرجاء تحديد فواتير للتصدير');
      return;
    }

    const headers = ['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ قبل الضريبة', 'الضريبة', 'الإجمالي', 'حالة الدفع'];
    const rows = selectedData.map(inv => [
      inv.invoice_number,
      new Date(inv.invoice_date).toLocaleDateString('ar-SA'),
      inv.customers?.name || 'عميل نقدي',
      (Number(inv.total_amount || 0) - Number(inv.vat_amount || 0)).toFixed(2),
      Number(inv.vat_amount || 0).toFixed(2),
      Number(inv.total_amount || 0).toFixed(2),
      inv.payment_status === 'paid' ? 'مدفوع' : inv.payment_status === 'partial' ? 'جزئي' : 'غير مدفوع'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0A3A6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>جارٍ تحميل بيانات المبيعات...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>تحليل المبيعات</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>تتبع وتحليل أداء المبيعات بشكل شامل</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>إجمالي المبيعات</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(stats.totalSales)} ﷼</div>
            </div>
            <DollarSign size={28} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{stats.totalInvoices} فاتورة</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>مبيعات اليوم</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(stats.todaySales)} ﷼</div>
            </div>
            <TrendingUp size={28} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>متوسط قيمة الفاتورة</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(stats.avgInvoiceValue)} ﷼</div>
            </div>
            <FileText size={28} style={{ opacity: 0.8 }} />
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>إجمالي الأصناف</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalItems}</div>
            </div>
            <Package size={28} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>بحث</label>
            <input
              type="text"
              placeholder="رقم الفاتورة أو اسم العميل"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>من تاريخ</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>إلى تاريخ</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>حالة الدفع</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="all">الكل</option>
              <option value="paid">مدفوع</option>
              <option value="partial">جزئي</option>
              <option value="unpaid">غير مدفوع</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={exportToCSV}
            disabled={selectedInvoices.size === 0}
            style={{
              padding: '10px 20px',
              background: selectedInvoices.size === 0 ? '#e2e8f0' : '#0A3A6B',
              color: selectedInvoices.size === 0 ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: selectedInvoices.size === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={18} />
            تصدير المحدد ({selectedInvoices.size})
          </button>
          <button
            onClick={loadSalesData}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#0A3A6B',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            تحديث
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
          فواتير المبيعات ({filteredInvoices.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  <input
                    type="checkbox"
                    checked={selectedInvoices.size > 0 && selectedInvoices.size === filteredInvoices.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>رقم الفاتورة</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>التاريخ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>العميل</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الأصناف</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>المبلغ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الضريبة</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الإجمالي</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>حالة الدفع</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد فواتير مطابقة</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.has(invoice.id)}
                        onChange={() => toggleInvoiceSelection(invoice.id)}
                      />
                    </td>
                    <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{invoice.invoice_number}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{invoice.customers?.name || 'عميل نقدي'}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{invoice.invoice_items?.length || 0}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{formatCurrency(Number(invoice.total_amount || 0) - Number(invoice.vat_amount || 0))} ﷼</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{formatCurrency(invoice.vat_amount)} ﷼</td>
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
