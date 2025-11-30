import React from "react";
import {
  listCustomers, upsertCustomer, findCustomerByMobile,
  getLoyaltyConfig, setLoyaltyConfig,
  addPoints, consumePoints, pointsToValue, valueToPoints
} from "../lib/loyalty";

export default function Customers(){
  const [rows, setRows] = React.useState(()=> listCustomers());
  const [q, setQ] = React.useState("");
  const [form, setForm] = React.useState({id:"", name:"", mobile:""});
  const [cfg, setCfg] = React.useState(()=> getLoyaltyConfig());
  const [adj, setAdj] = React.useState({id:"", plus:"", minus:""});

  function refresh(){ setRows(listCustomers()); }
  function saveCustomer(){
    if(!form.name || !form.mobile) { alert("أدخل الاسم والجوال"); return; }
    upsertCustomer(form);
    setForm({id:"", name:"", mobile:""});
    refresh();
  }
  function edit(c){ setForm({id:c.id, name:c.name||"", mobile:c.mobile||""}); }
  function search(){
    if(!q) { refresh(); return; }
    const bym = findCustomerByMobile(q);
    setRows(bym? [bym]: []);
  }
  function saveCfg(){
    setLoyaltyConfig(cfg);
    alert("تم حفظ إعدادات الولاء.");
  }
  function doPlus(){
    const id = adj.id; const val = Number(adj.plus)||0;
    if(!id || val<=0) return;
    addPoints(id, val); refresh(); setAdj({...adj, plus:""});
  }
  function doMinus(){
    const id = adj.id; const val = Number(adj.minus)||0;
    if(!id || val<=0) return;
    consumePoints(id, val); refresh(); setAdj({...adj, minus:""});
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>إعدادات الولاء</h3>
        <div className="actions" style={{gap:12, alignItems:"center", flexWrap:"wrap"}}>
          <label className="badge">معدل الكسب (نقطة/﷼)</label>
          <input type="number" value={cfg.earnRate} onChange={e=> setCfg(s=>({...s, earnRate:e.target.value}))}
            style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <label className="badge">قيمة النقطة (﷼)</label>
          <input type="number" value={cfg.valuePerPoint} onChange={e=> setCfg(s=>({...s, valuePerPoint:e.target.value}))}
            style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <label className="badge">الحد الأدنى للاستبدال (نقطة)</label>
          <input type="number" value={cfg.minRedeem} onChange={e=> setCfg(s=>({...s, minRedeem:e.target.value}))}
            style={{width:140, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn primary" onClick={saveCfg}>حفظ الإعدادات</button>
        </div>
        <p className="muted">مثال: 1 نقطة/﷼ و قيمة النقطة 0.01 ⇒ كاش باك 1% تقريبا.</p>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>بحث بالجوّال</h3>
        <div className="actions" style={{gap:12, alignItems:"center"}}>
          <input placeholder="05xxxxxxxx" value={q} onChange={e=> setQ(e.target.value)}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn" onClick={search}>بحث</button>
          <button className="btn" onClick={refresh}>عرض الكل</button>
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>إضافة/تعديل عميل</h3>
        <div className="actions" style={{gap:12, alignItems:"center", flexWrap:"wrap"}}>
          <input placeholder="الاسم" value={form.name} onChange={e=> setForm(s=>({...s, name:e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <input placeholder="الجوال" value={form.mobile} onChange={e=> setForm(s=>({...s, mobile:e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn primary" onClick={saveCustomer}>{form.id? "حفظ التعديلات":"إضافة"}</button>
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>العملاء</h3>
        <table className="table">
          <thead>
            <tr><th>الاسم</th><th>الجوال</th><th>النقاط</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {rows.map(c=>(
              <tr key={c.id}>
                <td>{c.name||"—"}</td>
                <td>{c.mobile||"—"}</td>
                <td className="amount-RiyalSymbolToken">{Number(c.points||0)}</td>
                <td className="actions" style={{gap:8}}>
                  <button className="btn" onClick={()=> edit(c)}>تعديل</button>
                  <select value={adj.id===c.id? "sel": ""} onChange={()=> setAdj(a=>({...a, id:c.id}))}>
                    <option value="">اختر للتعديل</option>
                    <option value="sel">—</option>
                  </select>
                  <input type="number" placeholder="+ نقاط" value={adj.id===c.id? adj.plus:""} onChange={e=> setAdj(a=>({...a, id:c.id, plus:e.target.value}))}
                    style={{width:110, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
                  <button className="btn" onClick={doPlus}>إضافة</button>
                  <input type="number" placeholder="- نقاط" value={adj.id===c.id? adj.minus:""} onChange={e=> setAdj(a=>({...a, id:c.id, minus:e.target.value}))}
                    style={{width:110, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
                  <button className="btn" onClick={doMinus}>خصم</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={4}>لا نتائج.</td></tr>}
          </tbody>
        </table>
        <p className="muted">تحويلات: 100 نقطة ≈ {pointsToValue(100).toFixed(2)} ﷼ — و 10 ﷼ ≈ {valueToPoints(10)} نقطة.</p>
      </div>
    </div>
  );
}




