import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const SarFmt = v => (v).toLocaleString("ar-SA",{ minimumFractionDigits:2, maximumFractionDigits:2 });

export default function Inventory(){
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    loadBranches();
    loadInventory();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [selectedBranch]);

  async function loadBranches() {
    try {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name_ar")
        .eq("is_active", true)
        .order("name_ar");

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  }

  async function loadInventory() {
    try {
      let query = supabase
        .from("inventory")
        .select(`
          *,
          products (
            name_ar,
            barcode,
            sale_price,
            unit
          ),
          branches (
            name_ar
          )
        `)
        .order("quantity", { ascending: true });

      if (selectedBranch) {
        query = query.eq("branch_id", selectedBranch);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error("Error loading inventory:", error);
      alert("فشل تحميل المخزون");
    } finally {
      setLoading(false);
    }
  }

  const filtered = rows.filter(x => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      x.products?.name_ar?.toLowerCase().includes(term) ||
      x.products?.barcode?.includes(searchTerm) ||
      x.branches?.name_ar?.includes(searchTerm)
    );
  });

  const lowStockItems = filtered.filter(x => x.quantity < x.min_stock_level);

  if (loading) {
    return (
      <div className="grid">
        <div className="card" style={{gridColumn:"span 12", textAlign: "center", padding: "40px"}}>
          <p>جارٍ تحميل المخزون...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 3"}}>
        <div className="label">إجمالي الأصناف</div>
        <div className="value">{filtered.length}</div>
      </div>
      <div className="card" style={{gridColumn:"span 3"}}>
        <div className="label">أصناف منخفضة المخزون</div>
        <div className="value" style={{color: lowStockItems.length > 0 ? "var(--warning)" : "var(--ok)"}}>
          {lowStockItems.length}
        </div>
      </div>
      <div className="card" style={{gridColumn:"span 3"}}>
        <div className="label">إجمالي الكمية</div>
        <div className="value">
          {filtered.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
        </div>
      </div>
      <div className="card" style={{gridColumn:"span 3"}}>
        <div className="label">قيمة المخزون</div>
        <div className="value amount-RiyalSymbolToken">
          {SarFmt(filtered.reduce((sum, item) =>
            sum + (Number(item.quantity || 0) * Number(item.avg_cost || 0)), 0
          ))} ﷼
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="actions" style={{justifyContent:"space-between", marginBottom:16, flexWrap: "wrap", gap: 12}}>
          <div style={{display: "flex", gap: 12, alignItems: "center"}}>
            <div className="badge">المخزون — {filtered.length} صنف</div>
            {lowStockItems.length > 0 && (
              <div className="badge" style={{background: "var(--warning)", color: "white"}}>
                {lowStockItems.length} صنف بحاجة لإعادة طلب
              </div>
            )}
          </div>
          <div style={{display: "flex", gap: 12}}>
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              style={{minWidth:160, background:"white", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}
            >
              <option value="">جميع الفروع</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name_ar}</option>
              ))}
            </select>
            <input
              placeholder="بحث بالاسم أو الباركود..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{minWidth:260, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>الباركود</th>
              <th>الصنف</th>
              <th>الفرع</th>
              <th>الكمية</th>
              <th>الحد الأدنى</th>
              <th>التكلفة المتوسطة</th>
              <th>سعر البيع</th>
              <th>الوحدة</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{textAlign: "center", padding: "32px"}}>
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد أصناف في المخزون"}
                </td>
              </tr>
            ) : (
              filtered.map(item => {
                const isLowStock = item.quantity < item.min_stock_level;
                return (
                  <tr key={item.id} style={isLowStock ? {background: "#fff3cd"} : {}}>
                    <td style={{fontFamily: "monospace"}}>{item.products?.barcode || "—"}</td>
                    <td>{item.products?.name_ar || "—"}</td>
                    <td><span className="badge">{item.branches?.name_ar || "—"}</span></td>
                    <td style={{fontWeight: isLowStock ? "bold" : "normal", color: isLowStock ? "var(--warning)" : "inherit"}}>
                      {item.quantity}
                    </td>
                    <td>{item.min_stock_level}</td>
                    <td className="amount-RiyalSymbolToken">{SarFmt(item.avg_cost || 0)} ﷼</td>
                    <td className="amount-RiyalSymbolToken">{SarFmt(item.products?.sale_price || 0)} ﷼</td>
                    <td>{item.products?.unit || "قطعة"}</td>
                    <td>
                      {isLowStock ? (
                        <span className="badge" style={{background: "var(--warning)", color: "white"}}>
                          منخفض
                        </span>
                      ) : (
                        <span className="badge" style={{background: "var(--ok)", color: "white"}}>
                          متوفر
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
