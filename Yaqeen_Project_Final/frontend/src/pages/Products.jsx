import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function Products(){
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: "",
    name_ar: "",
    category: "",
    sale_price: "",
    cost_price: "",
    vat_rate: "0.15",
    barcode: "",
    unit: "قطعة"
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name_ar", { ascending: true });

      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!form.name_ar || !form.category || !form.sale_price) {
      alert("أدخل الاسم والفئة والسعر");
      return;
    }

    try {
      const productData = {
        name_ar: form.name_ar,
        category: form.category,
        sale_price: Number(form.sale_price),
        cost_price: form.cost_price ? Number(form.cost_price) : null,
        vat_rate: Number(form.vat_rate),
        barcode: form.barcode || null,
        unit: form.unit,
        is_active: true
      };

      let error;
      if (form.id) {
        ({ error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", form.id));
      } else {
        ({ error } = await supabase
          .from("products")
          .insert([productData]));
      }

      if (error) throw error;

      setForm({
        id: "",
        name_ar: "",
        category: "",
        sale_price: "",
        cost_price: "",
        vat_rate: "0.15",
        barcode: "",
        unit: "قطعة"
      });
      loadProducts();
      alert(form.id ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("فشل حفظ المنتج");
    }
  }

  async function toggleActive(product) {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_active: !product.is_active })
        .eq("id", product.id);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error("Error toggling product status:", error);
      alert("فشل تحديث حالة المنتج");
    }
  }

  function edit(r) {
    setForm({
      id: r.id,
      name_ar: r.name_ar || "",
      category: r.category || "",
      sale_price: r.sale_price || "",
      cost_price: r.cost_price || "",
      vat_rate: r.vat_rate || "0.15",
      barcode: r.barcode || "",
      unit: r.unit || "قطعة"
    });
  }

  function cancelEdit() {
    setForm({
      id: "",
      name_ar: "",
      category: "",
      sale_price: "",
      cost_price: "",
      vat_rate: "0.15",
      barcode: "",
      unit: "قطعة"
    });
  }

  const filteredRows = rows.filter(r =>
    !searchTerm ||
    r.name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.barcode?.includes(searchTerm) ||
    r.category?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="grid">
        <div className="card" style={{gridColumn:"span 12", textAlign: "center", padding: "40px"}}>
          <p>جارٍ تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>{form.id ? "تعديل منتج" : "إضافة منتج جديد"}</h3>
        <div className="actions" style={{gap:12, flexWrap:"wrap", marginBottom: 12}}>
          <input
            placeholder="اسم المنتج"
            value={form.name_ar}
            onChange={e=> setForm(s=>({...s, name_ar:e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <select
            value={form.category}
            onChange={e=> setForm(s=>({...s, category:e.target.value}))}
            style={{width:160, background:"white", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          >
            <option value="">اختر الفئة</option>
            <option value="مشروبات">مشروبات</option>
            <option value="أغذية">أغذية</option>
            <option value="ألبان">ألبان</option>
            <option value="خبز ومعجنات">خبز ومعجنات</option>
            <option value="تمور">تمور</option>
            <option value="قهوة وشاي">قهوة وشاي</option>
            <option value="أخرى">أخرى</option>
          </select>
          <input
            placeholder="سعر البيع"
            type="number"
            step="0.01"
            value={form.sale_price}
            onChange={e=> setForm(s=>({...s, sale_price:e.target.value}))}
            style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="سعر التكلفة"
            type="number"
            step="0.01"
            value={form.cost_price}
            onChange={e=> setForm(s=>({...s, cost_price:e.target.value}))}
            style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="VAT (0.15)"
            type="number"
            step="0.01"
            value={form.vat_rate}
            onChange={e=> setForm(s=>({...s, vat_rate:e.target.value}))}
            style={{width:100, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="Barcode"
            value={form.barcode}
            onChange={e=> setForm(s=>({...s, barcode:e.target.value}))}
            style={{width:180, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="الوحدة"
            value={form.unit}
            onChange={e=> setForm(s=>({...s, unit:e.target.value}))}
            style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
        </div>
        <div className="actions" style={{gap:8}}>
          <button className="btn primary" onClick={save}>
            {form.id ? "حفظ التعديلات" : "إضافة منتج"}
          </button>
          {form.id && (
            <button className="btn" onClick={cancelEdit}>
              إلغاء
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
          <h3 style={{margin: 0}}>المنتجات ({filteredRows.length})</h3>
          <input
            placeholder="بحث..."
            value={searchTerm}
            onChange={e=> setSearchTerm(e.target.value)}
            style={{width:280, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الفئة</th>
              <th>السعر</th>
              <th>التكلفة</th>
              <th>VAT</th>
              <th>Barcode</th>
              <th>الوحدة</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(r=>
              <tr key={r.id} style={{opacity: r.is_active ? 1 : 0.5}}>
                <td>{r.name_ar}</td>
                <td><span className="badge">{r.category}</span></td>
                <td className="amount-RiyalSymbolToken">{Number(r.sale_price).toFixed(2)} ﷼</td>
                <td className="amount-RiyalSymbolToken">
                  {r.cost_price ? `${Number(r.cost_price).toFixed(2)} ﷼` : "—"}
                </td>
                <td>{(Number(r.vat_rate||0)*100).toFixed(0)}%</td>
                <td style={{fontFamily: "monospace"}}>{r.barcode||"—"}</td>
                <td>{r.unit}</td>
                <td>
                  <span className={`badge ${r.is_active ? 'success' : ''}`}>
                    {r.is_active ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="actions" style={{gap:6}}>
                  <button className="btn" onClick={()=> edit(r)}>تعديل</button>
                  <button
                    className="btn"
                    onClick={()=> toggleActive(r)}
                    style={{background: r.is_active ? "var(--warning)" : "var(--ok)"}}
                  >
                    {r.is_active ? "تعطيل" : "تفعيل"}
                  </button>
                </td>
              </tr>
            )}
            {filteredRows.length===0 && (
              <tr>
                <td colSpan={9} style={{textAlign: "center", padding: "32px"}}>
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد منتجات"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
