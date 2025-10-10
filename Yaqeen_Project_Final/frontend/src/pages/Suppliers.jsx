import React from "react";
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from "../lib/suppliers";

export default function Suppliers(){
  const [rows, setRows] = React.useState(getSuppliers());
  const [form, setForm] = React.useState({ name:"", vat:"", phone:"", terms:"" });
  const [editing, setEditing] = React.useState(null);

  function refresh(){ setRows(getSuppliers()); }
  function save(){
    if(editing){
      updateSupplier(editing, form);
      setEditing(null);
    }else{
      addSupplier(form);
    }
    setForm({ name:"", vat:"", phone:"", terms:"" });
    refresh();
  }
  function startEdit(s){
    setEditing(s.id);
    setForm({ name:s.name||"", vat:s.vat||"", phone:s.phone||"", terms:s.terms||"" });
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>المورّدون</h3>
        <div className="actions" style={{gap:8, flexWrap:"wrap", marginBottom:12}}>
          <input placeholder="اسم المورّد" value={form.name} onChange={e=> setForm(f=>({...f, name:e.target.value}))}
            style={{minWidth:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <input placeholder="VAT" value={form.vat} onChange={e=> setForm(f=>({...f, vat:e.target.value}))}
            style={{minWidth:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <input placeholder="هاتف" value={form.phone} onChange={e=> setForm(f=>({...f, phone:e.target.value}))}
            style={{minWidth:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <input placeholder="شروط الدفع" value={form.terms} onChange={e=> setForm(f=>({...f, terms:e.target.value}))}
            style={{minWidth:200, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn primary" onClick={save}>{editing? "تحديث" : "إضافة"}</button>
          {editing && <button className="btn" onClick={()=>{ setEditing(null); setForm({ name:"", vat:"", phone:"", terms:"" }); }}>إلغاء</button>}
        </div>

        <table className="table">
          <thead><tr><th>الاسم</th><th>VAT</th><th>هاتف</th><th>شروط الدفع</th><th>إجراءات</th></tr></thead>
          <tbody>
            {rows.length===0? (
              <tr><td colSpan={5}><div className="badge">لا يوجد مورّدون.</div></td></tr>
            ) : rows.map(s=>(
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.vat||"—"}</td><td>{s.phone||"—"}</td><td>{s.terms||"—"}</td>
                <td className="actions">
                  <button className="btn" onClick={()=> startEdit(s)}>تعديل</button>
                  <button className="btn" onClick={()=> { deleteSupplier(s.id); refresh(); }}>حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


