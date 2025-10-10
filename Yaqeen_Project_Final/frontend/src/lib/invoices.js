const KEY = "yaq-invoices";

/** تحميل جميع الفواتير من localStorage */
export function loadAll(){
  try{ return JSON.parse(localStorage.getItem(KEY)||"[]"); }catch{ return []; }
}

/** حفظ كامل المصفوفة */
function saveAll(arr){ localStorage.setItem(KEY, JSON.stringify(arr||[])); }

/** إرجاع قائمة (مع فرز تنازلي بالتاريخ) + فلترة اختيارية */
export function listInvoices(opts={}){
  const q = String(opts.q||"").trim().toLowerCase();
  const from = opts.from ? new Date(opts.from) : null;
  const to   = opts.to   ? new Date(opts.to)   : null;

  const all = (loadAll()||[]).slice().sort((a,b)=> (new Date(b.date||b.createdAt||0)) - (new Date(a.date||a.createdAt||0)));
  return all.filter(inv=>{
    const t = (inv.id||"").toLowerCase() + " " + (inv.customerName||"").toLowerCase();
    if(q && !t.includes(q)) return false;
    const d = new Date(inv.date || inv.createdAt || Date.now());
    if(from && d < from) return false;
    if(to   && d > to)   return false;
    return true;
  });
}

/** إيجاد فاتورة */
export function findInvoice(id){
  return loadAll().find(i=> i.id === id);
}

/** إضافة/تحديث فاتورة */
export function upsertInvoice(inv){
  if(!inv || !inv.id) return;
  const all = loadAll();
  const i = all.findIndex(x=> x.id === inv.id);
  if(i>=0) all[i] = {...all[i], ...inv};
  else all.unshift({...inv, createdAt: inv.createdAt || new Date().toISOString()});
  saveAll(all);
}

/** حذف فاتورة */
export function removeInvoice(id){
  saveAll(loadAll().filter(i=> i.id !== id));
}

/** منشئ UBL مبسّط (بدون اعتماد زاتكا الكامل) — يصلح للتنزيل والارشفة */
export function exportUBL(inv){
  const esc = (s)=> String(s??"").replace(/[<>&'"]/g, m=>({ "<":"&lt;","&": "&amp;","'":"&apos;",'"':"&quot;",">":"&gt;" }[m]));
  const items = Array.isArray(inv?.items)? inv.items : [];
  const lines = items.map((it,idx)=>`
    <cac:InvoiceLine>
      <cbc:ID>${idx+1}</cbc:ID>
      <cbc:InvoicedQuantity>${Number(it.qty||1).toFixed(2)}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount>${Number((it.price||0)*(it.qty||1)).toFixed(2)}</cbc:LineExtensionAmount>
      <cac:Item><cbc:Name>${esc(it.name||it.sku||"")}</cbc:Name></cac:Item>
      <cac:Price><cbc:PriceAmount>${Number(it.price||0).toFixed(2)}</cbc:PriceAmount></cac:Price>
    </cac:InvoiceLine>
  `).join("");

  const totalNet  = Number(inv.netTotal||0).toFixed(2);
  const totalVat  = Number(inv.vatTotal||0).toFixed(2);
  const totalGross= Number(inv.grossTotal|| (Number(inv.netTotal||0)+Number(inv.vatTotal||0))).toFixed(2);
  const dt = new Date(inv.date||inv.createdAt||Date.now());
  const date = dt.toISOString().slice(0,10);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${esc(inv.id||"")}</cbc:ID>
  <cbc:IssueDate>${date}</cbc:IssueDate>
  <cac:AccountingSupplierParty><cac:Party><cbc:Name>${esc(inv.sellerName||"Yaqeen POS")}</cbc:Name></cac:Party></cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty><cac:Party><cbc:Name>${esc(inv.customerName||"")}</cbc:Name></cac:Party></cac:AccountingCustomerParty>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount>${totalNet}</cbc:TaxExclusiveAmount>
    <cbc:TaxAmount>${totalVat}</cbc:TaxAmount>
    <cbc:PayableAmount>${totalGross}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lines}
</Invoice>`;
  return xml;
}


