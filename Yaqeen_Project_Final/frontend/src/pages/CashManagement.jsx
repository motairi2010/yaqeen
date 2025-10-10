import { formatSar } from "../lib/formatSar";
import React from "react";
import { ensureShift, getShift, xReport, closeShift } from "../lib/shift";
import { printHtml } from "../lib/printer";

export default function CashManagement(){
  const [rep, setRep] = React.useState(()=> xReport());
  const [counted, setCounted] = React.useState("");

  React.useEffect(()=>{
    ensureShift();           // يضمن أن هناك وردية مفتوحة
    setRep(xReport());       // سحب التقرير الأولي
  }, []);

  function refresh(){ setRep(xReport()); }

  function doPrintX(){
    const r = xReport();
    const html = renderReport("تقرير X (لحظي)", r, false);
    printHtml("تقرير X", html);
  }

  function doCloseZ(){
    const cash = Number(counted)||0;
    const closed = closeShift(cash);     // يغلق ويُرجع نسخة مختومة
    const html = renderReport("تقرير Z — إغلاق وردية", closed, true);
    printHtml("تقرير Z", html);
    // افتح وردية جديدة مباشرة بعد الإغلاق
    ensureShift();
    setCounted("");
    refresh();
    alert("تم إغلاق الوردية وفتح وردية جديدة.");
  }

  const p   = rep?.payments || {};
  const movIn  = Number(rep?.cashIn||0);
  const movOut = Number(rep?.cashOut||0);
  const expectedCash = Number(rep?.expectedCash||0);

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>إدارة النقد — الوردية الحالية</h3>
        <div className="grid" style={{gridTemplateColumns:"repeat(12,1fr)"}}>
          <div className="card" style={{gridColumn:"span 3"}}>
            <div className="label">مبيعات نقدية</div>
            <div className="value"><span className="money">{fmt(p.cash)}</span></div>
          </div>
          <div className="card" style={{gridColumn:"span 3"}}>
            <div className="label">مبيعات بطاقة</div>
            <div className="value"><span className="money">{fmt(p.card)}</span></div>
          </div>
          <div className="card" style={{gridColumn:"span 3"}}>
            <div className="label">تحويل بنكي</div>
            <div className="value"><span className="money">{fmt(p.transfer)}</span></div>
          </div>
          <div className="card" style={{gridColumn:"span 3"}}>
            <div className="label">محافظ رقمية</div>
            <div className="value"><span className="money">{fmt(p.wallet)}</span></div>
          </div>

          <div className="card" style={{gridColumn:"span 4"}}>
            <div className="label">توريد نقدي (Cash-In)</div>
            <div className="value"><span className="money">{fmt(movIn)}</span></div>
          </div>
          <div className="card" style={{gridColumn:"span 4"}}>
            <div className="label">مصروف نقدي (Cash-Out)</div>
            <div className="value"><span className="money">{fmt(movOut)}</span></div>
          </div>
          <div className="card" style={{gridColumn:"span 4"}}>
            <div className="label">النقد المتوقع بالصندوق</div>
            <div className="value"><span className="money">{fmt(expectedCash)}</span></div>
          </div>
        </div>

        <div className="actions" style={{marginTop:16, gap:12}}>
          <button className="btn" onClick={doPrintX}>🖨️ طباعة تقرير X</button>
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>إغلاق الوردية (Z)</h3>
        <div className="actions" style={{gap:12, alignItems:"center"}}>
          <label className="badge">أدخل النقد المُحصى فعليًا بالصندوق:</label>
          <input type="number" value={counted} onChange={e=> setCounted(e.target.value)}
            style={{width:200, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn primary" onClick={doCloseZ}>إغلاق وطباعة Z</button>
        </div>
        <p className="muted">عند الإغلاق، تُحفَظ الوردية وتُفتح وردية جديدة تلقائيًا.</p>
      </div>
    </div>
  );
}

function fmt(v){ return formatSar(Number(v||0)); }

function renderReport(title, r, isZ){
  const openAt   = r?.openAt ? new Date(r.openAt).toLocaleString("ar-SA") : "—";
  const closeAt  = r?.closeAt? new Date(r.closeAt).toLocaleString("ar-SA") : (isZ? new Date().toLocaleString("ar-SA") : "—");
  const pay = r?.payments || {};
  const expected = Number(r?.expectedCash||0);
  const counted  = Number(r?.countedCash||0);
  const diff     = isZ ? (counted - expected) : 0;

  return `
    <h2>${title}</h2>
    <div class="kpis">
      <div class="box"><div class="muted">وقت فتح الوردية</div><div><b>${openAt}</b></div></div>
      <div class="box"><div class="muted">وقت الإغلاق</div><div><b>${closeAt}</b></div></div>
      <div class="box"><div class="muted">توريد نقدي</div><div><b>$<span className="money">{fmt(r.cashIn)}</span></b></div></div>
      <div class="box"><div class="muted">مصروف نقدي</div><div><b>$<span className="money">{fmt(r.cashOut)}</span></b></div></div>
    </div>
    <h3>طرق الدفع</h3>
    <table>
      <thead><tr><th>الطريقة</th><th>المبلغ</th></tr></thead>
      <tbody>
        <tr><td>نقد</td><td>$<span className="money">{fmt(pay.cash)}</span></td></tr>
        <tr><td>بطاقة</td><td>$<span className="money">{fmt(pay.card)}</span></td></tr>
        <tr><td>تحويل</td><td>$<span className="money">{fmt(pay.transfer)}</span></td></tr>
        <tr><td>محفظة</td><td>$<span className="money">{fmt(pay.wallet)}</span></td></tr>
      </tbody>
    </table>
    <h3>النقد بالصندوق</h3>
    <table>
      <tbody>
        <tr><td>النقد المتوقع</td><td>$<span className="money">{fmt(expected)}</span></td></tr>
        ${isZ ? `<tr><td>النقد المُحصى</td><td>$<span className="money">{fmt(counted)}</span></td></tr>` : ``}
        ${isZ ? `<tr><td>الفارق</td><td>$<span className="money">{fmt(diff)}</span></td></tr>` : ``}
      </tbody>
    </table>
  `;
}










