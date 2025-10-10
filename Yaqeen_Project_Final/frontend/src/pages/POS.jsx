import React, { useState, useEffect, useRef, useMemo } from "react";
import RiyalSymbol from '../components/RiyalSymbol';
import { parseScan, mergeIntoCart, beep } from "../lib/scan";
import { getPolicy, requireApproval } from "../lib/policy";
import { getSettings } from "../lib/settings";
import { makeZatcaQrDataUrl, buildUBLXml } from "../lib/zatca";
import { findLocalProduct } from "../lib/catalog";const FALLBACK_CATALOG = [
  { sku:"1001", name:"قهوة عربية 250g", price:28,  vat:0.15 },
  { sku:"1002", name:"شاي أسود 100 فتلة", price:16, vat:0.15 },
  { sku:"2001", name:"ماء 330ml",          price:2.5, vat:0.15 },
  { sku:"3001", name:"حليب طازج 1L",       price:7.5, vat:0.15 },
  { sku:"4001", name:"خبز بر",             price:4,   vat:0.15 },
  { sku:"5001", name:"تمر سكري 1kg",       price:32,  vat:0.15 }
];

const FALLBACK_STORE = {
  nameAr: "يَقين للتجزئة",
  vat: "123456789012345",
  cr:  "1010000000",
  contact: "الرياض — المملكة العربية السعودية — 0500000000"
};

function SarFmt(v){ return (v).toLocaleString("ar-SA", { minimumFractionDigits:2, maximumFractionDigits:2 }); }
const toNumberOr = (val, fb) => { const n = Number(val); return Number.isFinite(n) ? n : fb; };
const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function nextInvoiceNo(){
  const key="yaqeen-invoice-seq";
  const year = new Date().getFullYear();
  const obj = JSON.parse(localStorage.getItem(key) || "{}");
  if(!obj[year]) obj[year]=1; else obj[year]+=1;
  localStorage.setItem(key, JSON.stringify(obj));
  return `INV-${year}-${String(obj[year]).padStart(5,"0")}`;
}

function downloadFile(name, text, mime="text/plain"){
  const blob = new Blob([text], {type:mime});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

export default function POS(){
  // === اختصارات وعمليات POS (كيبورد فقط) ===
  const payKey = "yaq-payments-current";
  function setPayments(p){ try{ localStorage.setItem(payKey, JSON.stringify(p||[])); }catch{} }
  function getPayments(){ try{ const a = JSON.parse(localStorage.getItem(payKey)||"[]"); return Array.isArray(a)? a:[]; }catch{return []} }

  function doSplitPayment(gross){
    const total = Number(gross||0);
    const pm = (getSettings().pos?.paymentMethods)||["cash","card","bank","wallet"];
    // مثال سريع: نأخذ مبلغ البطاقة والباقي نقد
    const card = Number(prompt("تقسيم الدفع — أدخل مبلغ البطاقة (والباقي نقد):", total))||0;
    const cash = Math.max(0, total - card);
    const arr = [];
    if (cash>0) arr.push({method:"cash", amount: cash});
    if (card>0) arr.push({method:"card", amount: card});
    setPayments(arr);
    alert("تم حفظ التقسيم: " + arr.map(x=> x.method+":"+x.amount.toFixed(2)).join(" + "));
  }

  function doInvoiceDiscount(){
    const s = prompt("خصم الفاتورة — أدخل % أو مبلغ (مثال 10% أو 25):","");
    if(!s) return;
    let isPercent = /%$/.test(s.trim());
    let v = Number(s.replace('%',''))||0;
    if (isPercent){
      const maxP = Number(getSettings().pos?.maxDiscountPct||10);
      if (v>maxP && currentRole()==="cashier" && !requireManagerPin()) { alert("رفض: خصم يتجاوز الحد"); return; }
      // نضيف بند خصم بقيمة سالبة تقريبية على الإجمالي الصافي الحالي
      const base = Number(grossTotal||0); // تقريب: على الإجمالي الشامل
      v = Math.min(base, base*(v/100));
    }
    // أضف بند خصم سالب (VAT=0) — عملي مؤقتًا
    try{
      const line = { sku:"DISC", name:"خصم فاتورة", price: -Math.abs(v), qty:1, vat:0 };
      if (typeof setCart==="function") setCart([...(Array.isArray(cart)?cart:[]), line]);
      logEvent("invoice_discount", { amount: v });
    }catch(e){}
  }

  function toggleReturnMode(){
    const cur = localStorage.getItem("yaq-return")==="1";
    const nxt = cur? "0":"1";
    localStorage.setItem("yaq-return", nxt);
    alert(nxt==="1" ? "وضع المرتجعات: مفعل" : "وضع المرتجعات: متوقف");
  }

  function quickCustomer(){
    const phone = prompt("رقم جوال العميل (اختياري):","");
    const name  = phone? (prompt("اسم العميل (اختياري):","")||"") : "";
    if (phone){
      upsertCustomer({ phone, name, points: 0 });
      alert("تم ربط العميل بالفاتورة الحالية");
      try{ localStorage.setItem("yaq-current-customer", JSON.stringify({phone,name})); }catch{}
    }
  }

  // قائمة اختصارات سريعة
  function showShortcuts(){
  alert(`اختصارات لوحة المفاتيح:

F6: تعليق الفاتورة (Park)
F7: استئناف آخر فاتورة مُعلّقة (Unpark)
F8: خصم الفاتورة
Alt+S: تقسيم الدفع
F9: وضع المرتجعات
Ctrl+P: طباعة
Ctrl+B: التركيز على حقل الباركود
Esc: تفريغ السلة`);
}

  // التفاعل مع لوحة المفاتيح
  React.useEffect(()=> {
    function onKey(e){
      if (e.key==="F1"){ e.preventDefault(); showShortcuts(); }
      if (e.key==="F8"){ e.preventDefault(); doInvoiceDiscount(); }
      if ((e.altKey||e.metaKey) && (e.key.toLowerCase()==="s")){ e.preventDefault(); doSplitPayment(grossTotal); }
      if (e.key==="F9"){ e.preventDefault(); toggleReturnMode(); }
      if ((e.altKey||e.metaKey) && (e.key.toLowerCase()==="l")){ e.preventDefault(); quickCustomer(); }
    }
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, []);
  /* === Park / Unpark (F6/F7) =============================== */
  function doPark(){
    try{
      const rec = {
        id: 'HOLD-' + Date.now(),
        at: new Date().toISOString(),
        cart: Array.isArray(cart)? [...cart] : [],
        totals: { net: Number(netTotal)||0, vat: Number(vatTotal)||0, gross: Number(grossTotal)||0 }
      };
      const arr = JSON.parse(localStorage.getItem("yaq-park")||"[]");
      arr.unshift(rec);
      localStorage.setItem("yaq-park", JSON.stringify(arr.slice(0,50))); // نحفظ آخر 50 فقط
      if (typeof setCart === "function") setCart([]); // تفريغ السلة بعد التعليق
    }catch(e){ console.warn("park error", e); }
  }
  function doUnpark(){
    try{
      const arr = JSON.parse(localStorage.getItem("yaq-park")||"[]");
      if(!arr.length){ alert("لا توجد فواتير مُعلّقة"); return; }
      const rec = arr.shift(); // استرجاع آخر واحدة
      localStorage.setItem("yaq-park", JSON.stringify(arr));
      if(Array.isArray(rec?.cart) && typeof setCart === "function") setCart(rec.cart);
    }catch(e){ console.warn("unpark error", e); }
  }
  React.useEffect(()=>{
    const onKey = (e)=>{
      if(e.key === "F6"){ e.preventDefault(); doPark(); }
      if(e.key === "F7"){ e.preventDefault(); doUnpark(); }
    };
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, []);
  /* ========================================================= */
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [newLine, setNewLine] = useState({ sku:"", name:"", qty:1, price:0, vat:0.15 });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [printType, setPrintType] = useState(getSettings().printType || "receipt80");

  const S = getSettings();
  const SUP = {
    nameAr: S.storeName || FALLBACK_STORE.nameAr,
    vat:    S.storeVAT  || FALLBACK_STORE.vat,
    cr:     S.storeCR   || FALLBACK_STORE.cr,
    contact:S.storeContact || FALLBACK_STORE.contact,
    footer: S.footerNote || "شكراً لزيارتكم"
  };
  const TPL = S.printTemplate || {};

  useEffect(()=>{
    const onChange = (e)=> {
      const s = (e.detail || getSettings());
      setPrintType(s.printType || "receipt80");
    };
    window.addEventListener("yaqeen:settings-changed", onChange);
    return ()=> window.removeEventListener("yaqeen:settings-changed", onChange);
  }, []);

  const inputRef = useRef(null);
  const discountRef = useRef(null);
  const timerRef = useRef(null);

  const AUTO_ADD_ON_SCAN = true;
  const SCAN_DELAY_MS = 140;
  const MIN_CODE_LEN = 4;

  useEffect(()=>()=>{ if(timerRef.current) clearTimeout(timerRef.current); }, []);

  async function findProduct(code){
    // 1) المخزون المحلي
    const fromLocal = findLocalProduct(code);
    if(fromLocal) return fromLocal;

    // 2) API (اختياري)
    try{
      const base = (process.env.REACT_APP_API_URL || "");
      if(base){
        const res = await fetch(`${base}/products?sku=${encodeURIComponent(code)}`);
        if(res.ok){
          const data = await res.json();
          const p = Array.isArray(data) ? data.find(x=> String(x.sku)===String(code)) : null;
          if(p) return p;
        }
      }
    }catch(_e){}

    // 3) فولباك
    return FALLBACK_CATALOG.find(p => String(p.sku)===String(code)) || null;
  }

  async function hydrateFromSku(code){
    const p = await findProduct(code);
    if(p){
      setNewLine(n => ({ ...n, name:p.name, price:toNumberOr(p.price,0), vat:(p.vat ?? 0.15) }));
      if(AUTO_ADD_ON_SCAN){ addNewLine(code, 1, toNumberOr(p.price,0), p.name, (p.vat ?? 0.15)); }
    }else{
      setNewLine(n => ({ ...n, name:"", price:0 }));
    }
  }

  function handleSkuChange(v){
    setNewLine(n => ({ ...n, sku:v }));
    if(timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(()=>{
      const code = v.trim();
      if(code.length >= MIN_CODE_LEN){ hydrateFromSku(code); }
    }, SCAN_DELAY_MS);
  }

  function changeQtyInline(sku, qty){
    setCart(prev => prev.map((x) => String(x.sku)===String(sku) ? { ...x, qty: Math.max(1, toNumberOr(qty,1)) } : x));
  }
  function changePriceInline(sku, price){
    setCart(prev => prev.map(x => String(x.sku)===String(sku) ? { ...x, price: Math.max(0, toNumberOr(price,0)) } : x));
  }
  function removeLine(sku){ setCart(prev => prev.filter(x => String(x.sku)!==String(sku))); setSelectedIndex(-1); }

  async function addNewLine(forceSku=null, forceQty=null, forcePrice=null, forceName=null, forceVat=null){
    const sku = (forceSku ?? newLine.sku).trim();
    if(!sku) return;

    let name  = (forceName ?? newLine.name);
    let price = toNumberOr((forcePrice ?? newLine.price), 0);
    let vat   = (forceVat ?? newLine.vat); if(vat == null) vat = 0.15;

    const qtyRaw = (forceQty ?? newLine.qty);
    const qty = Math.max(1, toNumberOr(qtyRaw, 1));

    if((!name || price===0) && !forceName){
      const p = await findProduct(sku);
      if(p){ name = p.name; price = toNumberOr(p.price,0); vat = (p.vat ?? 0.15); }
    }
    if(price===0){ alert("رجاءً أدخل سعر الوحدة."); return; }

    setCart(prev=>{
      const ix = prev.findIndex(x=> String(x.sku)===String(sku));
      if(ix>=0){
        const copy = [...prev];
        copy[ix] = { ...copy[ix], qty: copy[ix].qty + qty, price };
        setSelectedIndex(ix);
        return copy;
      }
      const next = [...prev, { sku, name: (name||"غير مسمّى"), qty, price, vat }];
      setSelectedIndex(next.length-1);
      return next;
    });

    setNewLine({ sku:"", name:"", qty:1, price:0, vat:0.15 });
    setTimeout(()=> inputRef.current?.focus(), 0);
  }

  // الإجماليات
  const netTotal  = cart.reduce((s,i)=> s + (i.price * i.qty), 0);
  const vatTotal  = cart.reduce((s,i)=> s + (i.price * i.qty * (i.vat ?? 0.15)), 0);
  const grossBeforeDiscount = netTotal + vatTotal;
  const grossTotal = Math.max(0, grossBeforeDiscount - toNumberOr(discount,0));

  async function finish(){
    const invoiceNo = nextInvoiceNo();
    const order = {
      id: invoiceNo,
      at: new Date().toISOString(),
      net: netTotal,
      vat: vatTotal,
      gross: grossTotal,
      items: cart
    };
    try{
      await fetch((process.env.REACT_APP_API_URL||"") + "/orders", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...order, discount: toNumberOr(discount,0) })
      });
    }catch(_e){}
    const ORD_KEY="yaqeen-orders";
    const arr = JSON.parse(localStorage.getItem(ORD_KEY) || "[]");
    arr.push(order);
    localStorage.setItem(ORD_KEY, JSON.stringify(arr));
    const SHIFT_KEY="yaqeen-shift";
    const sh = JSON.parse(localStorage.getItem(SHIFT_KEY) || "{}");
    if(sh.open){
      sh.sales = Array.isArray(sh.sales)? sh.sales : [];
      sh.sales.push(order);
      localStorage.setItem(SHIFT_KEY, JSON.stringify(sh));
    }
    alert(`تم إصدار الفاتورة ✅ رقم: ${invoiceNo}`);
    setCart([]); setDiscount(0); setNewLine({ sku:"", name:"", qty:1, price:0, vat:0.15 });
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }

  // الطباعة (كما لديك سابقًا) — إبقائها كما هي لتقليل الحجم
  function openPrintWindow(html, css){
    const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
    if(!w) return;
    w.document.open();
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><title>طباعة</title><style>\${css}</style></head><body>\${html}</body></html>`);
    w.document.close();
    setTimeout(()=>{ w.focus(); w.print(); w.close(); }, 350);
  }

  async function printReceipt(widthMm){
  const now = new Date().toLocaleString("ar-SA");
  const rowsHtml = cart.map(i => `
  <tr>
    <td>${esc(i.name)}</td>
    <td>${i.qty}</td>
    <td>${SarFmt(i.price)}</td>
    <td class="amount-RiyalSymbolToken">${SarFmt((i.price * i.qty) * (1 + (i.vat ?? 0.15)))}</td>
  </tr>
`).join("");const html = `      <div class="rcpt">
        <div class="head">
          <img src="${TPL.logoLight || "/brand/logo-full-ar.png"}" alt="Yaqeen" />
          <div class="name">${esc(SUP.nameAr)}</div>
          <div class="sub">VAT: ${esc(SUP.vat)}</div>
          <div class="sub">CR: ${esc(SUP.cr)}</div>
          <div class="sub">${esc(SUP.contact)}</div>
          <div class="sub">${esc(now)}</div>
          <hr/>
        </div>
        <table class="lines">
          <thead><tr><th>الصنف</th><th>كمية</th><th>سعر</th><th>الإجمالي</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="tot">
          <div>إجمالي قبل الضريبة: <b>${SarFmt(netTotal)}</b></div>
          <div>الضريبة (15%): <b>${SarFmt(vatTotal)}</b></div>
          <div class="grand">الإجمالي شامل الضريبة: <b>${SarFmt(grossTotal)} ﷼</b></div>
        </div>
      </div>`;

  const isThermal = (getSettings().pos?.defaultPrint==="thermal"); const css = isThermal ? "@page { size: 80mm auto; margin:0 } body { width:80mm; margin:0; font-family:\"Tajawal\", Arial, sans-serif; color:#111 } .rcpt { padding:6mm 4mm } .head { text-align:center } .head img { height:36px; margin-bottom:2mm } table { width:100%; border-collapse:collapse; font-size:12px } th,td { padding:2mm 1mm; border-bottom:1px dashed #ddd; text-align:right } .tot .grand { margin-top:2mm; padding:2mm; border:1px solid #000; text-align:center; font-size:13px }" : "@page{size:A4;margin:12mm} body{font-family:\"Tajawal\", Arial, sans-serif; color:#111} table { width:100%; border-collapse:collapse; font-size:13px } th,td { padding:4px 6px; border-bottom:1px solid #ddd; text-align:right } .tot .grand { margin-top:6px; padding:6px; border:1px solid #000; text-align:center; font-size:14px }";
  try {
  const pm = (getSettings().pos?.defaultMethod) || "cash";
  const invId = 'INV-' + Date.now();
  const order = {
    id: invId,
    at: new Date().toISOString(),
    net: netTotal,
    vat: vatTotal,
    gross: grossTotal,
    payMethod: pm,
    lines: Array.isArray(cart)? cart.map(x=>({ sku:x.sku, name:x.name, qty:Number(x.qty)||1, price:Number(x.price)||0, vat:Number(x.vat??0.15)||0 })) : []
  };
  recordSale(order);
  addInvoice(order);
} catch (e) { /* no-op */ }
try {
  const pmDefault = (getSettings().pos?.defaultMethod) || "cash";
  const payArr = (function(){ try{ const a = JSON.parse(localStorage.getItem("yaq-payments-current")||"[]"); return Array.isArray(a)? a:[]; }catch{return []} })();
  const payments = (payArr.length? payArr : [{method: pmDefault, amount: grossTotal}]);

  const invId = "INV-" + Date.now();
  const cust = (function(){ try{ return JSON.parse(localStorage.getItem("yaq-current-customer")||"{}"); }catch{return {}} })();
  const order = {
    id: invId,
    at: new Date().toISOString(),
    net: netTotal,
    vat: vatTotal,
    gross: grossTotal,
    payMethod: payments.map(p=>p.method).join("+"),
    payments: payments,
    customer: cust && cust.phone? cust : null,
    lines: Array.isArray(cart)? cart.map(x=>({ sku:x.sku, name:x.name, qty:Number(x.qty)||1, price:Number(x.price)||0, vat:Number(x.vat??0.15)||0 })) : []
  };

  // سجل وردية + فواتير + نقاط ولاء
  recordSale(order);
  addInvoice(order);
  if (cust && cust.phone){ try{ accruePoints(cust.phone, grossTotal); }catch{} }

  // تدوين تدقيق
  logEvent("invoice_print", { id: invId, pay: payments, gross: grossTotal });
} catch(e) { /* no-op */ }

openPrintWindow(html, css);
}function printDefault(){ if(printType==="A4") return window.print(); if(printType==="receipt58") return printReceipt(58); return printReceipt(80); }

  // اختصارات (كما لديك)
  useEffect(()=>{
    function handler(e){
      const key = e.key;
      if(e.ctrlKey && key.toLowerCase()==="b"){ e.preventDefault(); inputRef.current?.focus(); return; }
      if(key==="F2"){ e.preventDefault(); setCart([]); setDiscount(0); setSelectedIndex(-1); inputRef.current?.focus(); return; }
      if(key==="F5"){ e.preventDefault(); return; }
      if(key==="F9"){ e.preventDefault(); printDefault(); return; }
      if((e.ctrlKey && key==="Enter") || key==="F10"){ e.preventDefault(); if(cart.length) finish(); return; }
      if(key==="ArrowUp"){ e.preventDefault(); if(cart.length){ setSelectedIndex(i=> Math.max(0, (i<0? cart.length-1 : i-1))); } return; }
      if(key==="ArrowDown"){ e.preventDefault(); if(cart.length){ setSelectedIndex(i=> Math.min(cart.length-1, Math.max(0, i+1))); } return; }
      if(key==="+" || (key==="=" && e.shiftKey)){ e.preventDefault(); if(cart.length){ const idx = selectedIndex>=0? selectedIndex : (cart.length-1); changeQtyInline(cart[idx].sku, (cart[idx].qty+1)); setSelectedIndex(idx);} return; }
      if(key==="-" ){ e.preventDefault(); if(cart.length){ const idx = selectedIndex>=0? selectedIndex : (cart.length-1); changeQtyInline(cart[idx].sku, Math.max(1, cart[idx].qty-1)); setSelectedIndex(idx);} return; }
      if(key==="Delete"){ e.preventDefault(); if(cart.length){ const idx = selectedIndex>=0? selectedIndex : (cart.length-1); removeLine(cart[idx].sku);} return; }
      if(key==="Escape"){ setSelectedIndex(-1); }
    }
    window.addEventListener("keydown", handler);
    return ()=> window.removeEventListener("keydown", handler);
  }, [cart, selectedIndex, printType]);

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <table className="table">
          <thead><tr>
            <th>رقم الصنف (الباركود)</th><th>الصنف</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي (شامل الضريبة)</th><th></th>
          </tr></thead>
          <tbody>
            <tr>
              <td><input ref={inputRef} autoFocus placeholder="امسح الباركود أو أدخله يدويًا (Ctrl+B)" value={newLine.sku} data-yaq="barcode" onChange={e => handleSkuChange(e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
              <td><input placeholder="اسم الصنف" value={newLine.name} onChange={e=> setNewLine(n=>({...n, name:e.target.value}))}
                style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
              <td><input type="number" min="1" value={newLine.qty} onChange={e=> setNewLine(n=>({...n, qty: Math.max(1, (Number(e.target.value)||1))}))}
                style={{width:90, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
              <td><input type="number" min="0" step="0.01" value={newLine.price} onChange={e=> setNewLine(n=>({...n, price: Math.max(0, (Number(e.target.value)||0))}))}
                style={{width:130, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
              <td className="badge">—</td>
              <td><button className="btn" onClick={()=> addNewLine()}>أضف</button></td>
            </tr>

            {cart.length===0 ? (
              <tr><td colSpan={6}><div className="badge">لا توجد عناصر — امسح الباركود.</div></td></tr>
            ) : cart.map((it, idx)=>{
              const lineNet = it.price*it.qty; const lineVat = lineNet*(it.vat??0.15); const lineGross = lineNet+lineVat;
              const isSel = idx===selectedIndex;
              return (
                <tr key={it.sku} style={isSel? {background:"rgba(56,189,248,.08)"}:undefined} onClick={()=> setSelectedIndex(idx)}>
                  <td>{it.sku}</td>
                  <td>{it.name}</td>
                  <td><input type="number" min="1" value={it.qty} onChange={e=> changeQtyInline(it.sku, e.target.value)}
                    style={{width:90, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}/></td>
                  <td><input type="number" min="0" step="0.01" value={it.price} onChange={e=> changePriceInline(it.sku, e.target.value)}
                    style={{width:130, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}/></td>
                  <td>{SarFmt(lineGross)} ﷼</td>
                  <td><button className="btn" onClick={()=>{ if(!ensureAllowed("delete_line")) return; removeLine(it.sku); }}>حذف</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="card" style={{marginTop:12}}>
          <div className="actions" style={{gap:8, flexWrap:"wrap"}}>
            <div className="badge">إجمالي قبل الضريبة: {SarFmt(netTotal)} ﷼</div>
            <div className="badge amount-RiyalSymbolToken">الضريبة (15%): {SarFmt(vatTotal)} ﷼</div>
            <div className="badge">الإجمالي شامل الضريبة: {SarFmt(grossTotal)} ﷼</div>
            <button className="btn primary" disabled={cart.length===0} onClick={finish}>إصدار الفاتورة (Ctrl+Enter)</button>
            <button className="btn" onClick={printDefault}>طباعة</button>
          </div>
        </div>
      </div>
    </div>
  );
}



























