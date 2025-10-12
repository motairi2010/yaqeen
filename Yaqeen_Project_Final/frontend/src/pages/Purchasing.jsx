import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { TrendingUp, ShoppingCart, Package, DollarSign, Download, Plus, Truck } from "lucide-react";

export default function Purchasing() {
  const [loading, setLoading] = useState(true);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalOrders: 0,
    pendingOrders: 0,
    receivedOrders: 0,
    avgOrderValue: 0,
    totalItems: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState(new Set());

  useEffect(() => {
    loadPurchasingData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [purchaseOrders, searchTerm, dateRange, statusFilter]);

  const loadPurchasingData = async () => {
    try {
      setLoading(true);

      const { data: ordersData, error: ordersError } = await supabase
        .from('invoices')
        .select('*, suppliers(name, contact_person, email, phone), invoice_items(quantity, price, vat_amount)')
        .eq('invoice_type', 'purchase')
        .eq('is_cancelled', false)
        .order('invoice_date', { ascending: false });

      if (ordersError) throw ordersError;

      setPurchaseOrders(ordersData || []);
      calculateStats(ordersData || []);
    } catch (error) {
      console.error('Error loading purchasing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let totalPurchases = 0;
    let pendingOrders = 0;
    let receivedOrders = 0;
    let totalItems = 0;

    data.forEach(order => {
      const amount = Number(order.total_amount || 0);
      totalPurchases += amount;
      totalItems += (order.invoice_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

      if (order.payment_status === 'unpaid' || order.payment_status === 'partial') {
        pendingOrders++;
      } else {
        receivedOrders++;
      }
    });

    setStats({
      totalPurchases,
      totalOrders: data.length,
      pendingOrders,
      receivedOrders,
      avgOrderValue: data.length > 0 ? totalPurchases / data.length : 0,
      totalItems
    });
  };

  const filterOrders = () => {
    let filtered = [...purchaseOrders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.invoice_number.toLowerCase().includes(term) ||
        order.suppliers?.name?.toLowerCase().includes(term)
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(order => new Date(order.invoice_date) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter(order => new Date(order.invoice_date) <= new Date(dateRange.end));
    }

    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter(order => order.payment_status === 'unpaid' || order.payment_status === 'partial');
      } else if (statusFilter === "received") {
        filtered = filtered.filter(order => order.payment_status === 'paid');
      }
    }

    setFilteredOrders(filtered);
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    }
  };

  const exportToCSV = () => {
    const selectedData = filteredOrders.filter(order => selectedOrders.has(order.id));
    if (selectedData.length === 0) {
      alert('الرجاء تحديد أوامر للتصدير');
      return;
    }

    const headers = ['رقم الأمر', 'التاريخ', 'المورد', 'المبلغ قبل الضريبة', 'الضريبة', 'الإجمالي', 'الحالة'];
    const rows = selectedData.map(order => [
      order.invoice_number,
      new Date(order.invoice_date).toLocaleDateString('ar-SA'),
      order.suppliers?.name || 'غير محدد',
      (Number(order.total_amount || 0) - Number(order.vat_amount || 0)).toFixed(2),
      Number(order.vat_amount || 0).toFixed(2),
      Number(order.total_amount || 0).toFixed(2),
      order.payment_status === 'paid' ? 'مستلم' : order.payment_status === 'partial' ? 'جزئي' : 'معلق'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `purchases_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#0A3A6B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>جارٍ تحميل بيانات المشتريات...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>إدارة المشتريات</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>تتبع وتحليل أوامر الشراء والموردين</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>إجمالي المشتريات</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(stats.totalPurchases)} ﷼</div>
            </div>
            <DollarSign size={28} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>{stats.totalOrders} أمر شراء</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>أوامر معلقة</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.pendingOrders}</div>
            </div>
            <ShoppingCart size={28} style={{ opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>في انتظار الاستلام</div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '20px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>متوسط قيمة الأمر</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{formatCurrency(stats.avgOrderValue)} ﷼</div>
            </div>
            <TrendingUp size={28} style={{ opacity: 0.8 }} />
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
              placeholder="رقم الأمر أو اسم المورد"
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="all">الكل</option>
              <option value="pending">معلق</option>
              <option value="received">مستلم</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={exportToCSV}
            disabled={selectedOrders.size === 0}
            style={{
              padding: '10px 20px',
              background: selectedOrders.size === 0 ? '#e2e8f0' : '#0A3A6B',
              color: selectedOrders.size === 0 ? '#94a3b8' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: selectedOrders.size === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={18} />
            تصدير المحدد ({selectedOrders.size})
          </button>
          <button
            onClick={loadPurchasingData}
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
          أوامر الشراء ({filteredOrders.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px', textAlign: 'right' }}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.size > 0 && selectedOrders.size === filteredOrders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>رقم الأمر</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>التاريخ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>المورد</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الأصناف</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>المبلغ</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الضريبة</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الإجمالي</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#475569', fontSize: '14px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>لا توجد أوامر مطابقة</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                      />
                    </td>
                    <td style={{ padding: '12px', color: '#334155', fontWeight: '500' }}>{order.invoice_number}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{new Date(order.invoice_date).toLocaleDateString('ar-SA')}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{order.suppliers?.name || 'غير محدد'}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{order.invoice_items?.length || 0}</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{formatCurrency(Number(order.total_amount || 0) - Number(order.vat_amount || 0))} ﷼</td>
                    <td style={{ padding: '12px', color: '#64748b' }}>{formatCurrency(order.vat_amount)} ﷼</td>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#0A3A6B' }}>{formatCurrency(order.total_amount)} ﷼</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: order.payment_status === 'paid' ? '#d1fae5' : order.payment_status === 'partial' ? '#fed7aa' : '#fef3c7',
                        color: order.payment_status === 'paid' ? '#065f46' : order.payment_status === 'partial' ? '#9a3412' : '#92400e'
                      }}>
                        {order.payment_status === 'paid' ? 'مستلم' : order.payment_status === 'partial' ? 'جزئي' : 'معلق'}
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
