import React from "react";\nimport { getRole, setRole, setPin } from "../lib/policy";\nimport { getSettings, patchSettings } from "../lib/settings";

export default function Settings(){
  const [s, setS] = React.useState(getSettings());
  React.useEffect(()=>{
    const h = ()=> setS(getSettings());
    window.addEventListener("yaqeen:settings-changed", h);
    return ()=> window.removeEventListener("yaqeen:settings-changed", h);
  }, []);
  const pmAll = ["cash","card","bank","wallet"];
  const pmLabel = { cash:"نقد", card:"بطاقة", bank:"تحويل بنكي", wallet:"محفظة" };

  function toggleMethod(k){
    const cur = new Set(s.pos.paymentMethods||[]);
    if(cur.has(k)) cur.delete(k); else cur.add(k);
    const arr = pmAll.filter(x=> cur.has(x));
    const next = { ...s, pos:{ ...s.pos, paymentMethods: arr }};
    // تأكد أن الطريقة الافتراضية ما تزال مفعلة
    if(!arr.includes(next.pos.defaultMethod)) next.pos.defaultMethod = arr[0] || "cash";
    setS(next);
  }
  function save(){
    patchSettings({ pos: s.pos });
    alert("تم حفظ الإعدادات");
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>إعدادات نقطة البيع</h3>

        <div className="card" style={{marginTop:12}}>
          <h4 style={{marginTop:0}}>نوع الطباعة الافتراضي</h4>
          <div className="actions" style={{gap:8, flexWrap:"wrap"}}>
            <label className="badge"><input type="radio" name="prt" checked={s.pos.defaultPrint==="thermal"} onChange={()=> setS(p=>({...p, pos:{...p.pos, defaultPrint:"thermal"}}))}/> إيصال حراري (80mm)</label>
            <label className="badge"><input type="radio" name="prt" checked={s.pos.defaultPrint==="a4"} onChange={()=> setS(p=>({...p, pos:{...p.pos, defaultPrint:"a4"}}))}/> A4</label>
          </div>
        </div>

        <div className="card" style={{marginTop:12}}>
          <h4 style={{marginTop:0}}>طرق الدفع المفعّلة</h4>
          <div className="actions" style={{gap:8, flexWrap:"wrap"}}>
            {pmAll.map(k=>(
              <label key={k} className="badge">
                <input type="checkbox" checked={(s.pos.paymentMethods||[]).includes(k)} onChange={()=> toggleMethod(k)}/> {pmLabel[k]}
              </label>
            ))}
          </div>
          <div className="actions" style={{gap:8, flexWrap:"wrap", marginTop:8}}>
            <div className="badge">الطريقة الافتراضية:</div>
            {pmAll.filter(k=> (s.pos.paymentMethods||[]).includes(k)).map(k=>(
              <label key={k} className="badge">
                <input type="radio" name="defpm" checked={s.pos.defaultMethod===k} onChange={()=> setS(p=>({...p, pos:{...p.pos, defaultMethod:k}}))}/> {pmLabel[k]}
              </label>
            ))}
          </div>
        </div>

        <div className="actions" style={{marginTop:12}}>
          <button className="btn primary" onClick={save}>حفظ</button>
        </div>
      </div>
    </div>
  );
}


