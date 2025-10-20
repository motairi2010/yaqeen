import React from "react";
import RiyalSymbol from '../components/RiyalSymbol';
import { buildUBLXml } from "../lib/zatca";
import { getSettings } from "../lib/settings";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function SarFmt(v){ return (v).toLocaleString("ar-SA", { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function downloadFile(name, text, mime="application/xml"){
  const blob = new Blob([text], {type:mime});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

export default function Sales(){
  const [q, setQ] = React.useState("");
  const [rows, setRows] = React.useState(()=>{
    try { return JSON.parse(localStorage.getItem("yaqeen-orders") || "[]"); }
    catch { return []; }
  });
  const [selected, setSelected] = React.useState(()=> new Set());

  function refresh(){
    try { setRows(JSON.parse(localStorage.getItem("yaqeen-orders") || "[]")); }
    catch { setRows([]); }
    setSelected(new Set());
  }

  const filtered = rows.filter(r=>{
    const term = q.trim();
    if(!term) return true;
    const hitText = (r.id||"") + " " + (r.items||[]).map(i=> `${i.sku} ${i.name}`).join(" ");
    return hitText.includes(term);
  }).reverse(); // الأحدث أولاً

  function toggle(id){
    setSelected(prev=>{
      const next = new Set(prev);
      if(next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleAll(){
    if(selected.size === filtered.length){
      setSelected(new Set());
    }else{
      setSelected(new Set(filtered.map(r=> r.id)));
    }
  }

  async function exportSelectedZip(){
    if(selected.size===0) return;
    const S = getSettings();
    const zip = new JSZip();
    for(const o of filtered){
      if(!selected.has(o.id)) continue;
      const xml = buildUBLXml({
        invoiceNo: o.id,
        issueDateTime: o.at,
        supplier: { name: S.storeName || "Yaqeen", vat: S.storeVAT || "" },
        items: o.items || [],
        totals: { net: o.net, vat: o.vat, gross: o.gross },
        currency: "RiyalSymbolToken"
      });
      zip.file(`${o.id}.xml`, xml);
    }
    const blob = await zip.generateAsync({ type:"blob" });
    const date = new Date().toISOString().slice(0,10);
    saveAs(blob, `UBL_${date}.zip`);
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="actions" style={{justifyContent:"space-between", marginBottom:10}}>
          <div className="badge">المبيعات — {filtered.length} فاتورة</div>
          <div className="actions" style={{gap:8, flexWrap:"wrap"}}>
            <input
              placeholder="بحث برقم الفاتورة/باركود/اسم"
              value={q} onChange={e=> setQ(e.target.value)}
              style={{minWidth:280, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <button className="btn" onClick={refresh}>تحديث</button>
            <button className="btn" disabled={selected.size===0} onClick={exportSelectedZip}>
              تصدير XML للمحدّد (ZIP) — {selected.size}
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th><input type="checkbox"
                checked={selected.size>0 && selected.size===filtered.length}
                indeterminate={selected.size>0 && selected.size<filtered.length ? "true" : undefined}
                onChange={toggleAll}/></th>
              <th>رقم الفاتورة</th>
              <th>التاريخ</th>
              <th>عدد الأصناف</th>
              <th>قبل الضريبة</th>
              <th>الضريبة</th>
              <th>الإجمالي</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 ? (
              <tr><td colSpan={8}><div className="badge">لا توجد فواتير بعد.</div></td></tr>
            ) : filtered.map((o)=>(
              <tr key={o.id}>
                <td>
                  <input type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={()=> toggle(o.id)} />
                </td>
                <td>{o.id}</td>
                <td>{new Date(o.at).toLocaleString("ar-SA")}</td>
                <td>{(o.items||[]).length}</td>
                <td>{SarFmt(o.net)} ﷼</td>
                <td>{SarFmt(o.vat)} ﷼</td>
                <td><b>{SarFmt(o.gross)} ﷼</b></td>
                <td className="actions">
                  <button className="btn" onClick={()=>{
                    const S = getSettings();
                    const xml = buildUBLXml({
                      invoiceNo: o.id,
                      issueDateTime: o.at,
                      supplier: { name: S.storeName || "Yaqeen", vat: S.storeVAT || "" },
                      items: o.items||[],
                      totals: { net: o.net, vat: o.vat, gross: o.gross },
                      currency: "RiyalSymbolToken"
                    });
                    downloadFile(`${o.id}.xml`, xml, "application/xml");
                  }}>تنزيل UBL (XML)</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="badge" style={{marginTop:8}}>
          استخدم مربعات التحديد لاختيار مجموعة فواتير ثم اضغط “تصدير XML للمحدّد (ZIP)”.
        </div>
      </div>
    </div>
  );
}











