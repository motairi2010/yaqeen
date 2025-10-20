import React from "react";
import { listInvoices, downloadUBL } from "../lib/invoices";

export default function Reports(){
  const [from, setFrom] = React.useState("");
  const [to, setTo]     = React.useState("");

  function inRange(at){
    if(!at) return false;
    const d = new Date(at);
    const a = from ? new Date(from) : null;
    const b = to   ? new Date(to)   : null;
    if(a && d < a) return false;
    if(b && d > new Date(b.getTime()+24*3600*1000-1)) return false;
    return true;
  }
  function exportUBL(){
    const rows = listInvoices().filter(x=> inRange(x.at));
    if(!rows.length){ alert("لا توجد فواتير في الفترة المحددة"); return; }
    // تنزيل كل فاتورة كملف XML (متعدد التنزيلات)
    rows.forEach(r => downloadUBL(r));
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>التقارير والتصدير</h3>
        <div className="actions" style={{gap:8, flexWrap:"wrap"}}>
          <label className="badge">من: <input type="date" value={from} onChange={e=> setFrom(e.target.value)}
            style={{marginInlineStart:6, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}/></label>
          <label className="badge">إلى: <input type="date" value={to} onChange={e=> setTo(e.target.value)}
            style={{marginInlineStart:6, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}/></label>
          <button className="btn primary" onClick={exportUBL}>تصدير UBL (XML) للفترة</button>
        </div>
        <div className="badge" style={{marginTop:10}}>سيتم تنزيل ملف XML لكل فاتورة ضمن الفترة المحددة (حل عملي كبداية بدون ضغط ZIP).</div>
      </div>
    </div>
  );
}
