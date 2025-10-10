export function getPrintMode(){
  try { return (JSON.parse(localStorage.getItem("yaq-print"))||{}).mode || "thermal"; } catch { return "thermal"; }
}
export function setPrintMode(mode){
  const v = { mode: (mode==="a4"?"a4":"thermal") };
  localStorage.setItem("yaq-print", JSON.stringify(v));
}
export function printInvoice({mode, cart, totals, paymentMethod, invoiceNo}){
  mode = mode || getPrintMode();
  const css = mode==="thermal" ? `
    body{font-family:system-ui,-apple-system,"Segoe UI","Tajawal",Arial;direction:rtl}
    .w{width:72mm;margin:0 auto}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{padding:4px 0;border-bottom:1px dashed #999;text-align:center}
    th:first-child,td:first-child{text-align:right}
    h3{margin:6px 0 8px;font-size:14px;text-align:center}
  ` : `
    @page{size:A4;margin:16mm}
    body{font-family:system-ui,-apple-system,"Segoe UI","Tajawal",Arial;direction:rtl}
    h2{margin:0 0 12px}
    table{width:100%;border-collapse:collapse}
    th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:center}
    th:first-child,td:first-child{text-align:right}
    .tot{margin-top:16px;font-size:14px}
  `;
  const rows = (cart||[]).map(i=> 
    `<tr><td>${esc(i.name||"")}</td><td class="amount-RiyalSymbolToken">${i.qty||1}</td><td class="amount-RiyalSymbolToken">${fmt(i.price||0)}</td><td class="amount-RiyalSymbolToken">${fmt((i.price||0)*(i.qty||1)*(1+(i.vat??0.15)))}</td></tr>`
  ).join("");
  const title = mode==="thermal" ? "إيصال" : "فاتورة مبيعات";
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head>
  <body><div class="w">
    <h3>يَقين — ${title}</h3>
    <div style="margin:4px 0;font-size:12px;text-align:center">رقم: ${invoiceNo||"-"} — طريقة الدفع: ${paymentMethod||"غير محدد"}</div>
    <table><thead><tr><th>الصنف</th><th>كمية</th><th>سعر</th><th>الإجمالي</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="tot">
      <div>إجمالي قبل الضريبة: <b>${fmt(totals?.net||0)}</b></div>
      <div>الضريبة (15%): <b>${fmt(totals?.vat||0)}</b></div>
      <div>الإجمالي المستحق: <b>${fmt(totals?.gross||0)}</b></div>
    </div>
  </div></body></html>`;
  const w = window.open("", "_blank", "width=800,height=900"); if(!w) return;
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(()=>{w.focus(); w.print(); w.close();}, 300);
  function fmt(n){ return new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)+" ﷼"; }
  function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
}




