import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard(){
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    totalProfit: 0,
    lowStockCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayISO = firstDayOfMonth.toISOString();

      const { data: todayInvoices } = await supabase
        .from("invoices")
        .select("total_amount")
        .gte("created_at", todayISO)
        .eq("status", "paid");

      const todaySales = todayInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;

      const { data: monthInvoices } = await supabase
        .from("invoices")
        .select("total_amount, subtotal_amount")
        .gte("created_at", firstDayISO)
        .eq("status", "paid");

      const monthSales = monthInvoices?.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) || 0;
      const monthSubtotal = monthInvoices?.reduce((sum, inv) => sum + Number(inv.subtotal_amount || 0), 0) || 0;

      const { data: products } = await supabase
        .from("products")
        .select("id, cost_price");

      const { data: invoiceItems } = await supabase
        .from("invoice_items")
        .select("product_id, quantity, unit_price")
        .gte("created_at", firstDayISO);

      let totalCost = 0;
      if (invoiceItems && products) {
        invoiceItems.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            totalCost += Number(product.cost_price || 0) * Number(item.quantity || 0);
          }
        });
      }

      const totalProfit = monthSubtotal - totalCost;

      const { data: lowStock } = await supabase
        .from("inventory")
        .select("id")
        .lt("quantity", supabase.raw("min_stock_level"));

      const lowStockCount = lowStock?.length || 0;

      setStats({
        todaySales,
        monthSales,
        totalProfit,
        lowStockCount
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid">
        <div className="card" style={{gridColumn:"span 12", textAlign: "center", padding: "40px"}}>
          <p>جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const profitMargin = stats.monthSales > 0 ? (stats.totalProfit / stats.monthSales * 100).toFixed(1) : 0;

  return (
    <div className="grid">
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">مبيعات اليوم</div>
        <div className="value amount-RiyalSymbolToken">{stats.todaySales.toFixed(2)} ﷼</div>
        <div className="delta" style={{color:"var(--muted)"}}>اليوم</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">مبيعات هذا الشهر</div>
        <div className="value amount-RiyalSymbolToken">{stats.monthSales.toFixed(2)} ﷼</div>
        <div className="delta" style={{color:"var(--muted)"}}>الشهر الحالي</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">الربح الإجمالي</div>
        <div className="value amount-RiyalSymbolToken">{stats.totalProfit.toFixed(2)} ﷼</div>
        <div className="delta" style={{color:"var(--ok)"}}>هامش {profitMargin}%</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">الأصناف منخفضة المخزون</div>
        <div className="value">{stats.lowStockCount} صنف</div>
        <div className="delta" style={{color: stats.lowStockCount > 0 ? "var(--warning)" : "var(--ok)"}}>
          {stats.lowStockCount > 0 ? "بحاجة لإعادة طلب" : "المخزون جيد"}
        </div>
      </div>
      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="label">مرحبًا {profile?.full_name || user?.email || ""} في يَقين</div>
        <p>تم تطبيق الهيكل والـ POS والإعدادات الافتراضية. استخدم القائمة للتنقل.</p>
      </div>
    </div>
  );
}







