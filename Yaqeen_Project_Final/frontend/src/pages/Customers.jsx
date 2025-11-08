import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Customers(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({id:"", name:"", phone:"", email:""});

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setRows(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      alert("فشل تحميل العملاء");
    } finally {
      setLoading(false);
    }
  }

  async function saveCustomer() {
    if (!form.name || !form.phone) {
      alert("أدخل الاسم والجوال");
      return;
    }

    try {
      const customerData = {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        loyalty_points: 0
      };

      let error;
      if (form.id) {
        ({ error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", form.id));
      } else {
        ({ error } = await supabase
          .from("customers")
          .insert([customerData]));
      }

      if (error) throw error;

      setForm({id:"", name:"", phone:"", email:""});
      loadCustomers();
      alert(form.id ? "تم تحديث العميل بنجاح" : "تم إضافة العميل بنجاح");
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("فشل حفظ العميل");
    }
  }

  async function addPoints(customerId, points) {
    if (!points || points <= 0) return;

    try {
      const customer = rows.find(c => c.id === customerId);
      if (!customer) return;

      const newPoints = Number(customer.loyalty_points || 0) + Number(points);

      const { error } = await supabase
        .from("customers")
        .update({ loyalty_points: newPoints })
        .eq("id", customerId);

      if (error) throw error;
      loadCustomers();
    } catch (error) {
      console.error("Error adding points:", error);
      alert("فشل إضافة النقاط");
    }
  }

  async function consumePoints(customerId, points) {
    if (!points || points <= 0) return;

    try {
      const customer = rows.find(c => c.id === customerId);
      if (!customer) return;

      const currentPoints = Number(customer.loyalty_points || 0);
      if (currentPoints < points) {
        alert("النقاط المتاحة غير كافية");
        return;
      }

      const newPoints = currentPoints - Number(points);

      const { error } = await supabase
        .from("customers")
        .update({ loyalty_points: newPoints })
        .eq("id", customerId);

      if (error) throw error;
      loadCustomers();
    } catch (error) {
      console.error("Error consuming points:", error);
      alert("فشل خصم النقاط");
    }
  }

  function edit(c) {
    setForm({
      id: c.id,
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || ""
    });
  }

  function cancelEdit() {
    setForm({id:"", name:"", phone:"", email:""});
  }

  const filteredRows = rows.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.phone?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="grid">
        <div className="card" style={{gridColumn:"span 12", textAlign: "center", padding: "40px"}}>
          <p>جارٍ تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>{form.id ? "تعديل عميل" : "إضافة عميل جديد"}</h3>
        <div className="actions" style={{gap:12, flexWrap:"wrap", marginBottom: 12}}>
          <input
            placeholder="الاسم"
            value={form.name}
            onChange={e => setForm(s => ({...s, name: e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="الجوال (05xxxxxxxx)"
            value={form.phone}
            onChange={e => setForm(s => ({...s, phone: e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
          <input
            placeholder="البريد الإلكتروني (اختياري)"
            type="email"
            value={form.email}
            onChange={e => setForm(s => ({...s, email: e.target.value}))}
            style={{width:240, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px"}}
          />
        </div>
        <div className="actions" style={{gap:8}}>
          <button className="btn primary" onClick={saveCustomer}>
            {form.id ? "حفظ التعديلات" : "إضافة عميل"}
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
          <h3 style={{margin: 0}}>العملاء ({filteredRows.length})</h3>
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
              <th>الاسم</th>
              <th>الجوال</th>
              <th>البريد الإلكتروني</th>
              <th>نقاط الولاء</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(c => {
              const [pointsToAdd, setPointsToAdd] = useState("");
              const [pointsToConsume, setPointsToConsume] = useState("");

              return (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td style={{fontFamily: "monospace"}}>{c.phone}</td>
                  <td>{c.email || "—"}</td>
                  <td>
                    <span className="badge" style={{background: "var(--primary)", color: "white"}}>
                      {Number(c.loyalty_points || 0).toFixed(0)} نقطة
                    </span>
                  </td>
                  <td className="actions" style={{gap:6, flexWrap: "wrap"}}>
                    <button className="btn" onClick={() => edit(c)}>تعديل</button>
                    <div style={{display: "flex", gap: 4, alignItems: "center"}}>
                      <input
                        type="number"
                        placeholder="+ نقاط"
                        value={pointsToAdd}
                        onChange={e => setPointsToAdd(e.target.value)}
                        style={{width:90, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          addPoints(c.id, Number(pointsToAdd));
                          setPointsToAdd("");
                        }}
                        style={{background: "var(--ok)"}}
                      >
                        +
                      </button>
                    </div>
                    <div style={{display: "flex", gap: 4, alignItems: "center"}}>
                      <input
                        type="number"
                        placeholder="- نقاط"
                        value={pointsToConsume}
                        onChange={e => setPointsToConsume(e.target.value)}
                        style={{width:90, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}
                      />
                      <button
                        className="btn"
                        onClick={() => {
                          consumePoints(c.id, Number(pointsToConsume));
                          setPointsToConsume("");
                        }}
                        style={{background: "var(--warning)"}}
                      >
                        -
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{textAlign: "center", padding: "32px"}}>
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد عملاء"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{marginTop: 16, padding: "12px", background: "var(--bg-secondary)", borderRadius: 8}}>
          <p className="muted" style={{margin: 0}}>
            <strong>نظام الولاء:</strong> يتم تجميع النقاط تلقائياً مع كل عملية شراء.
            كل 100 ريال = 100 نقطة | قيمة كل 100 نقطة = 1 ريال
          </p>
        </div>
      </div>
    </div>
  );
}
