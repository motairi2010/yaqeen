import React from "react";
import { getSettings, patchSettings } from "../lib/settings";
import { getPolicy, savePolicy, DEFAULT_POLICY, setPin } from "../lib/policy";
import MFASettings from "../components/MFASettings";

export default function Settings(){
  const [s, setS] = React.useState(()=> {
    const cur = getSettings();
    return { printMode: "thermal", theme:"dark", lang:"ar", pins:{ manager:"0000", supervisor:"1111" }, ...cur };
  });
  const [policy, setPolicy] = React.useState(()=> {
    const p = getPolicy();
    return {
      cashier:    { ...DEFAULT_POLICY.cashier,    ...(p.cashier||{}) },
      supervisor: { ...DEFAULT_POLICY.supervisor, ...(p.supervisor||{}) },
      manager:    { ...DEFAULT_POLICY.manager,    ...(p.manager||{}) },
    };
  });

  function saveAll(){
    // احفظ الإعدادات العامة
    patchSettings(s);
    // احفظ السياسة
    savePolicy(policy);
    alert("تم حفظ الإعدادات والصلاحيات.");
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>الإعدادات العامة</h3>
        <div className="actions" style={{gap:16, flexWrap:"wrap"}}>
          <div>
            <div className="label">وضع الطباعة الافتراضي</div>
            <label className="badge"><input type="radio" name="print" checked={s.printMode==="thermal"} onChange={()=>setS(v=>({...v, printMode:"thermal"}))}/> حراري</label>
            <label className="badge"><input type="radio" name="print" checked={s.printMode==="a4"} onChange={()=>setS(v=>({...v, printMode:"a4"}))}/> A4</label>
          </div>
          <div>
            <div className="label">الثيم</div>
            <label className="badge"><input type="radio" name="theme" checked={s.theme==="dark"} onChange={()=>setS(v=>({...v, theme:"dark"}))}/> داكن</label>
            <label className="badge"><input type="radio" name="theme" checked={s.theme==="light"} onChange={()=>setS(v=>({...v, theme:"light"}))}/> فاتح</label>
          </div>
          <div>
            <div className="label">اللغة</div>
            <label className="badge"><input type="radio" name="lang" checked={s.lang==="ar"} onChange={()=>setS(v=>({...v, lang:"ar"}))}/> العربية</label>
            <label className="badge"><input type="radio" name="lang" checked={s.lang==="en"} onChange={()=>setS(v=>({...v, lang:"en"}))}/> English</label>
          </div>
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>رموز PIN</h3>
        <div className="actions" style={{gap:12, alignItems:"center", flexWrap:"wrap"}}>
          <label className="badge">PIN المدير</label>
          <input type="password" value={s.pins?.manager||""}
            onChange={e=> setS(v=> ({...v, pins:{ ...(v.pins||{}), manager:e.target.value }}))}
            style={{width:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <label className="badge">PIN المشرف</label>
          <input type="password" value={s.pins?.supervisor||""}
            onChange={e=> setS(v=> ({...v, pins:{ ...(v.pins||{}), supervisor:e.target.value }}))}
            style={{width:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn" onClick={()=>{ setPin("manager", s.pins?.manager||""); setPin("supervisor", s.pins?.supervisor||""); alert("تم تحديث PINs."); }}>تحديث PINs</button>
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>صلاحيات الكاشير</h3>
        <div className="actions" style={{gap:16, flexWrap:"wrap"}}>
          <label className="badge"><input type="checkbox"
            checked={!!policy.cashier.addManualItem}
            onChange={e=> setPolicy(p=> ({...p, cashier:{...p.cashier, addManualItem:e.target.checked}}))}
          /> السماح ببند يدوي</label>

          <label className="badge"><input type="checkbox"
            checked={!!policy.cashier.changePrice}
            onChange={e=> setPolicy(p=> ({...p, cashier:{...p.cashier, changePrice:e.target.checked}}))}
          /> السماح بتغيير السعر</label>

          <div className="badge">
            سقف الخصم ٪
            <input type="number" value={policy.cashier.discountPercentMax}
              onChange={e=> setPolicy(p=> ({...p, cashier:{...p.cashier, discountPercentMax: Math.max(0, Number(e.target.value)||0)}}))}
              style={{width:90, marginRight:8, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 8px"}}/>
          </div>
        </div>
        <p className="muted">أي إجراء يتجاوز هذه الحدود سيطلب موافقة PIN (مدير/مشرف).</p>
      </div>

      <div className="actions" style={{gridColumn:"span 12", gap:12}}>
        <button className="btn primary" onClick={saveAll}>💾 حفظ</button>
      </div>

      <div style={{gridColumn:"span 12"}}>
        <MFASettings />
      </div>
    </div>
  );
}
