export function printHtml(title, html, css=""){
  const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if(!w) return;
  const body = `<!doctype html><html lang="ar" dir="rtl">
  <head><meta charset="utf-8"/><title>${title||"طباعة"}</title>
  <style>
    body{font-family:Tahoma,Arial;direction:rtl;color:#111}
    .wrap{padding:16px}
    h2{margin:0 0 12px 0}
    table{width:100%;border-collapse:collapse}
    th,td{border-bottom:1px solid #ddd;padding:8px;text-align:right;font-size:14px}
    th{background:#f7f7f7}
    .kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:12px 0}
    .box{border:1px solid #ddd;border-radius:10px;padding:10px}
    .muted{color:#666}
  </style>
  ${css||""}</head><body><div class="wrap">${html||""}</div></body></html>`;
  w.document.open(); w.document.write(body); w.document.close();
  setTimeout(()=>{ try{ w.focus(); w.print(); }catch{} }, 300);
}
