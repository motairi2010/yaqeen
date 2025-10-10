import React from "react";
import RiyalSymbol from '../components/RiyalSymbol';
import { getSuppliers } from "../lib/suppliers";
import { listInventory, receiveItems } from "../lib/inventory";

const PO_KEY = "yaqeen-pos";  // أوامر الشراء
const GRN_KEY = "yaqeen-grn"; // محاضر الاستلام

const num = (v, d=0)=>{ const n=Number(v); return Number.isFinite(n)? n : d; };
const SarFmt = v => (v).toLocaleString("ar-SA",{ minimumFractionDigits:2, maximumFractionDigits:2 });

function uid(p){ return p + "-" + Date.now().toString(36).toUpperCase(); }
function load(key){ try { const x = JSON.parse(localStorage.getItem(key)||"[]"); return Array.isArray(x)? x:[]; } catch{ return []; } }
function save(key, arr){ localStorage.setItem(key, JSON.stringify(arr||[])); return arr; }

function openPrint(html, css){
  const w = window.open("", "_blank", "noopener,noreferrer,width=820,height=900");
  if(!w) return;
  w.document.open();
  w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>GRN</title><style>\${css}</style></head><body>\${html}</body></html>`);
  w.document.close();
  setTimeout(()=>{ w.focus(); w.print(); w.close(); }, 350);
}

export default function Purchasing(){
  const [tab, setTab] = React.useState("list"); // list | new | receive
  const [pos, setPOs] = React.useState(load(PO_KEY));
  const [grns, setGRNs] = React.useState(load(GRN_KEY));
  const [suppliers, setSuppliers] = React.useState(getSuppliers());
  const [inv, setInv] = React.useState(listInventory());

  const [form, setForm] = React.useState({ supplierId:"", lines:[], note:"" });
  const [recv, setRecv] = React.useState({ poId:null, lines:[] });

  React.useEffect(()=>{
    const h = ()=> setInv(listInventory());
    window.addEventListener("yaqeen:inv-changed", h);
    return ()=> window.removeEventListener("yaqeen:inv-changed", h);
  }, []);

  // === تبويب القائمة ===
  function refreshAll(){ setPOs(load(PO_KEY)); setGRNs(load(GRN_KEY)); setSuppliers(getSuppliers()); setInv(listInventory()); }
  function startNew(){ setForm({ supplierId:"", lines:[], note:"" }); setTab("new"); }
  function startReceive(po){
    setRecv({ poId: po.id, lines: po.lines.map(l=> ({ ...l, recvQty: l.qty, recvCost: l.cost })) });
    setTab("receive");
  }

  // === إنشاء أمر شراء ===
  function addLine(){
    setForm(f=> ({ ...f, lines:[...f.lines, { sku:"", name:"", qty:1, cost:0 }] }));
  }
  function setLine(ix, patch){
    setForm(f=>{
      const arr=[...f.lines];
      arr[ix] = { ...arr[ix], ...patch };
      return { ...f, lines: arr };
    });
  }
  function removeLine(ix){
    setForm(f=>{
      const arr=[...f.lines]; arr.splice(ix,1);
      return { ...f, lines: arr };
    });
  }
  function savePO(){
    if(!form.supplierId){ alert("اختر المورّد"); return; }
    if(form.lines.length===0){ alert("أضف بنودًا"); return; }
    const id = uid("PO");
    const po = {
      id, at: new Date().toISOString(),
      supplierId: form.supplierId,
      note: form.note||"",
      lines: form.lines.map(l=> ({ sku:String(l.sku||"").trim(), name:l.name||"غير مسمّى", qty: Math.max(1, num(l.qty,1)), cost: Math.max(0, num(l.cost,0)) })),
      status: "Open"
    };
    const all = [ ...pos, po ];
    save(PO_KEY, all); setPOs(all);
    setTab("list");
    alert("تم حفظ أمر الشراء ✅");
  }

  // === الاستلام (GRN) ===
  function submitGRN(){
    const po = pos.find(p=> p.id===recv.poId);
    if(!po){ alert("لم يتم العثور على PO"); return; }
    const id = uid("GRN");
    const lines = recv.lines.map(l=> ({
      sku: String(l.sku||"").trim(),
      name: l.name||"غير مسمّى",
      qty: Math.max(0, num(l.recvQty,0)),
      cost: Math.max(0, num(l.recvCost,0))
    })).filter(x=> x.sku && x.qty>0);

    // تحديث المخزون بالتكلفة المتوسطة
    receiveItems(lines);

    // حفظ GRN
    const grn = { id, at:new Date().toISOString(), poId: po.id, supplierId: po.supplierId, lines };
    const allG = [ ...grns, grn ]; save(GRN_KEY, allG); setGRNs(allG);

    // تحديث حالة الـPO
    const allP = pos.map(p=> p.id===po.id ? { ...p, status:"Received", receivedAt: new Date().toISOString() } : p);
    save(PO_KEY, allP); setPOs(allP);

    // طباعة GRN (A4)
    const sup = suppliers.find(s=> s.id===po.supplierId);
    const rows = lines.map(l=> `<tr><td>\${l.sku}</td><td>\${l.name}</td><td>\${l.qty}</td><td>\${SarFmt(l.cost)}</td><td>\${SarFmt(l.qty*l.cost)}</td></tr>`).join("");
    const html = `
      <div class="doc">
        <h2>محضر استلام (GRN)</h2>
        <div>المورّد: <b>\${sup? sup.name : "—"}</b> — VAT: \${sup?.vat||"—"} — هاتف: \${sup?.phone||"—"}</div>
        <div>رقم PO: \${po.id} — رقم GRN: \${id} — التاريخ: \${new Date().toLocaleString("ar-SA")}</div>
        <table class="tbl"><thead><tr><th>الباركود</th><th>الوصف</th><th>الكمية</th><th>تكلفة الوحدة</th><th>الإجمالي</th></tr></thead><tbody>\${rows||"<tr><td colspan='5' class='empty'>لا توجد بنود</td></tr>"}</tbody></table>
      </div>`;
    const css = `
      @page{size:A4;margin:12mm}
      body{font-family:"Tajawal", Arial, sans-serif; color:#111}
      h2{margin:0 0 8px 0}
      .tbl{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
      .tbl th,.tbl td{border:1px solid #ddd;padding:6px 8px;text-align:right}
      .tbl th{background:#f3f4f6}
      .empty{text-align:center;color:#777}
    `;
    openPrint(html, css);

    setTab("list");
    alert("تم إنشاء GRN وتحديث المخزون ✅");
  }

  // واجهة
  const supById = React.useMemo(()=> Object.fromEntries(suppliers.map(s=> [s.id, s])), [suppliers]);

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="actions" style={{justifyContent:"space-between", marginBottom:10}}>
          <div className="badge">المشتريات — أوامر الشراء ومحاضر الاستلام</div>
          <div className="actions" style={{gap:8}}>
            <button className={"btn"+(tab==="list"?" primary":"")} onClick={()=> setTab("list")}>القائمة</button>
            <button className={"btn"+(tab==="new"?" primary":"")}  onClick={startNew}>أمر شراء جديد</button>
          </div>
        </div>

        {tab==="list" && (
          <>
            <table className="table">
              <thead><tr>
                <th>رقم PO</th><th>التاريخ</th><th>المورّد</th><th>البنود</th><th>الحالة</th><th>إجراءات</th>
              </tr></thead>
              <tbody>
                {pos.length===0? (
                  <tr><td colSpan={6}><div className="badge">لا توجد أوامر شراء.</div></td></tr>
                ) : pos.slice().reverse().map(p=>(
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{new Date(p.at).toLocaleString("ar-SA")}</td>
                    <td>{supById[p.supplierId]?.name || "—"}</td>
                    <td>{p.lines.length}</td>
                    <td>{p.status==="Open" ? <span className="badge">مفتوح</span> : <b>مستلم</b>}</td>
                    <td className="actions">
                      {p.status==="Open" && <button className="btn" onClick={()=> startReceive(p)}>استلام (GRN)</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="card" style={{marginTop:10}}>
              <div className="badge">المخزون الحالي: {inv.length} صنف</div>
            </div>
          </>
        )}

        {tab==="new" && (
          <div className="card">
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12}}>
              <div>
                <label className="label">المورّد</label>
                <select value={form.supplierId} onChange={e=> setForm(f=> ({...f, supplierId:e.target.value}))}
                  style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px"}}>
                  <option value="">— اختر —</option>
                  {suppliers.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ملاحظة</label>
                <input value={form.note} onChange={e=> setForm(f=> ({...f, note:e.target.value}))}
                  style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"8px"}}/>
              </div>
            </div>

            <div className="actions" style={{margin:"12px 0"}}>
              <button className="btn" onClick={addLine}>إضافة بند (+)</button>
            </div>

            <table className="table">
              <thead><tr><th>الباركود</th><th>الوصف</th><th>الكمية</th><th>تكلفة الوحدة (بدون ضريبة)</th><th>إجمالي</th><th></th></tr></thead>
              <tbody>
                {form.lines.length===0? (
                  <tr><td colSpan={6}><div className="badge">أضف بنود أمر الشراء.</div></td></tr>
                ) : form.lines.map((l,ix)=>(
                  <tr key={ix}>
                    <td><input value={l.sku} onChange={e=> setLine(ix, { sku:e.target.value })}
                      style={{width:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                    <td><input value={l.name} onChange={e=> setLine(ix, { name:e.target.value })}
                      style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                    <td><input type="number" min="1" value={l.qty} onChange={e=> setLine(ix, { qty: Math.max(1, num(e.target.value,1)) })}
                      style={{width:90, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                    <td><input type="number" min="0" step="0.01" value={l.cost} onChange={e=> setLine(ix, { cost: Math.max(0, num(e.target.value,0)) })}
                      style={{width:140, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                    <td className="amount-sar">{SarFmt(num(l.qty,1)*num(l.cost,0))} ﷼</td>
                    <td><button className="btn" onClick={()=> removeLine(ix)}>حذف</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="actions" style={{marginTop:12}}>
              <button className="btn primary" onClick={savePO}>حفظ أمر الشراء (F12)</button>
              <button className="btn" onClick={()=> setTab("list")}>إلغاء</button>
            </div>
          </div>
        )}

        {tab==="receive" && (
          <div className="card">
            <div className="badge">استلام أمر الشراء: {recv.poId}</div>
            <table className="table">
              <thead><tr><th>الباركود</th><th>الوصف</th><th>المُتوقَّع</th><th>المستلم</th><th>تكلفة الوحدة</th><th>إجمالي</th></tr></thead>
              <tbody>
                {recv.lines.map((l,ix)=>(
                  <tr key={ix}>
                    <td>{l.sku}</td>
                    <td>{l.name}</td>
                    <td>{l.qty}</td>
                    <td><input type="number" min="0" value={l.recvQty} onChange={e=> setRecv(r=>{
                      const arr=[...r.lines]; arr[ix]={...arr[ix], recvQty: Math.max(0, num(e.target.value,0))}; return { ...r, lines:arr };
                    })}
                    style={{width:110, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                    <td><input type="number" min="0" step="0.01" value={l.recvCost} onChange={e=> setRecv(r=>{
                      const arr=[...r.lines]; arr[ix]={...arr[ix], recvCost: Math.max(0, num(e.target.value,0))}; return { ...r, lines:arr };
                    })}
                    style={{width:140, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                    <td className="amount-sar">{SarFmt(num(l.recvQty,0)*num(l.recvCost,0))} ﷼</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="actions" style={{marginTop:12}}>
              <button className="btn primary" onClick={submitGRN}>إنشاء GRN وتحديث المخزون</button>
              <button className="btn" onClick={()=> setTab("list")}>رجوع</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}











