import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Suppliers(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    tax_number: ""
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      alert("فشل تحميل الموردين");
    } finally {
      setLoading(false);
    }
  }

  async function saveSupplier() {
    if (!form.name || !form.phone) {
      alert("أدخل اسم المورد ورقم الجوال");
      return;
    }

    try {
      const supplierData = {
        name: form.name,
        contact_person: form.contact_person || null,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
        tax_number: form.tax_number || null,
        is_active: true
      };

      let error;
      if (form.id) {
        ({ error } = await supabase
          .from("suppliers")
          .update(supplierData)
          .eq("id", form.id));
      } else {
        ({ error } = await supabase
          .from("suppliers")
          .insert([supplierData]));
      }

      if (error) throw error;

      setForm({
        id: "",
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        tax_number: ""
      });
      loadSuppliers();
      alert(form.id ? "تم تحديث المورد بنجاح" : "تم إضافة المورد بنجاح");
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("فشل حفظ المورد");
    }
  }

  async function toggleActive(supplier) {
    try {
      const { error } = await supabase
        .from("suppliers")
        .update({ is_active: !supplier.is_active })
        .eq("id", supplier.id);

      if (error) throw error;
      loadSuppliers();
    } catch (error) {
      console.error("Error toggling supplier status:", error);
      alert("فشل تحديث حالة المورد");
    }
  }

  function edit(s) {
    setForm({
      id: s.id,
      name: s.name || "",
      contact_person: s.contact_person || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      tax_number: s.tax_number || ""
    });
  }

  function cancelEdit() {
    setForm({
      id: "",
      name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      tax_number: ""
    });
  }

  const filteredRows = rows.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.contact_person?.toLowerCase().includes(term) ||
      s.phone?.includes(searchTerm) ||
      s.email?.toLowerCase().includes(term) ||
      s.tax_number?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="grid">
        <div className="card" style={{gridColumn:"span 12", textAlign: "center", padding: "40px"}}>
          <p>جارٍ تحميل الموردين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>{form.id ? "تعديل مورد" : "إضافة مورد جديد"}</h3>
        <div className="actions" style={{gap:12, flexWrap:"wrap", marginBottom: 12}}>
          <input
            placeholder="اسم المورد"
            value={form.name}
            onChange={e => setForm(s => ({...s, name: e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="الشخص المسؤول"
            value={form.contact_person}
            onChange={e => setForm(s => ({...s, contact_person: e.target.value}))}
            style={{width:200, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="رقم الجوال"
            value={form.phone}
            onChange={e => setForm(s => ({...s, phone: e.target.value}))}
            style={{width:180, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="البريد الإلكتروني"
            type="email"
            value={form.email}
            onChange={e => setForm(s => ({...s, email: e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="الرقم الضريبي"
            value={form.tax_number}
            onChange={e => setForm(s => ({...s, tax_number: e.target.value}))}
            style={{width:180, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="العنوان"
            value={form.address}
            onChange={e => setForm(s => ({...s, address: e.target.value}))}
            style={{width:300, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
        </div>
        <div className="actions" style={{gap:8}}>
          <button className="btn primary" onClick={saveSupplier}>
            {form.id ? "حفظ التعديلات" : "إضافة مورد"}
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
          <h3 style={{margin: 0}}>الموردين ({filteredRows.length})</h3>
          <input
            placeholder="بحث..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{width:280, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>اسم المورد</th>
              <th>الشخص المسؤول</th>
              <th>الجوال</th>
              <th>البريد الإلكتروني</th>
              <th>الرقم الضريبي</th>
              <th>العنوان</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(s => (
              <tr key={s.id} style={{opacity: s.is_active ? 1 : 0.5}}>
                <td><strong>{s.name}</strong></td>
                <td>{s.contact_person || "—"}</td>
                <td style={{fontFamily: "monospace"}}>{s.phone}</td>
                <td>{s.email || "—"}</td>
                <td style={{fontFamily: "monospace"}}>{s.tax_number || "—"}</td>
                <td>{s.address || "—"}</td>
                <td>
                  <span className={`badge ${s.is_active ? 'success' : ''}`}>
                    {s.is_active ? "نشط" : "غير نشط"}
                  </span>
                </td>
                <td className="actions" style={{gap:6}}>
                  <button className="btn" onClick={() => edit(s)}>تعديل</button>
                  <button
                    className="btn"
                    onClick={() => toggleActive(s)}
                    style={{background: s.is_active ? "var(--warning)" : "var(--ok)"}}
                  >
                    {s.is_active ? "تعطيل" : "تفعيل"}
                  </button>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={8} style={{textAlign: "center", padding: "32px"}}>
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد موردين"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
