import rialFontUrl from "./assets/fonts/RialSymbol.ttf";
/* inject RialSymbol font (scoped to U+0631 only) */
(() => {
  const css = `
  @font-face{
    font-family:"RialSymbol";
    src:url(${rialFontUrl}) format("truetype");
    font-display:swap;
    unicode-range: U+0631; /* ر فقط */
  }`;
  const el = document.createElement("style");
  el.setAttribute("data-rial", "1");
  el.appendChild(document.createTextNode(css));
  document.head.appendChild(el);
})();
/* ==== DOM helpers alias to DOMSAFE v3 ==== */
(function(){
  if (window.__DOMSAFE__ && typeof window.__DOMSAFE__.getById === "function") {
    window.safeGetById  = window.__DOMSAFE__.getById;
    window.safeQueryAll = window.__DOMSAFE__.queryAll;
    window.escapeCssId  = window.__DOMSAFE__.escapeCssId;
  }
})();
 /* ==== end helpers ==== */
/* ==== DOMSAFE v2 (native-bound, no recursion, unique namespace) ==== */
(function(){
  if (window.__DOMSAFE__ && window.__DOMSAFE__.getById) return;

  const NATIVE = {
    getById: Document.prototype.getElementById,
    qsaNode: Node.prototype.querySelectorAll,
    qsNode:  Node.prototype.querySelector,
  };

  function escapeCssId(id) {
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(id);
    return String(id).replace(/([ #.;?+*~':"!^\$\[\]\(\)=>|\/@])/g, "\\$1");
  }

  // حارس محلي ضد إعادة الدخول
  let _guard = false;

  function getById(rootLike, id) {
    if (!id) return null;
    if (_guard) {
      try { return NATIVE.getById.call(document, id) || null; } catch { return null; }
    }
    _guard = true;
    try {
      if (rootLike && typeof rootLike === "object" && "nodeType" in rootLike) {
        // Document
        if (rootLike.nodeType === 9) {
          try { return NATIVE.getById.call(rootLike, id) || null; } catch {}
        }
        // ShadowRoot / Element
        if (typeof rootLike.querySelector === "function") {
          try { return NATIVE.qsNode.call(rootLike, "#" + escapeCssId(id)); } catch {}
        }
      }
      // fallback نهائي للوثيقة الأصلية
      try { return NATIVE.getById.call(document, id) || null; } catch { return null; }
    } finally {
      _guard = false;
    }
  }

  function queryAll(rootLike, selector) {
    if (!selector) return [];
    try {
      if (rootLike && typeof rootLike.querySelectorAll === "function") {
        return NATIVE.qsaNode.call(rootLike, selector);
      }
      return NATIVE.qsaNode.call(document, selector);
    } catch { return []; }
  }

  window.__DOMSAFE__ = Object.freeze({ getById, queryAll, escapeCssId });
})();
 /* ==== end DOMSAFE v2 ==== */
/* ==== DOM helpers alias to DOMSAFE v3 ==== */
(function(){
  if (window.__DOMSAFE__ && typeof window.__DOMSAFE__.getById === "function") {
    window.safeGetById  = window.__DOMSAFE__.getById;
    window.safeQueryAll = window.__DOMSAFE__.queryAll;
    window.escapeCssId  = window.__DOMSAFE__.escapeCssId;
  }
})();
 /* ==== end helpers ==== */
/* ==== DOM helpers alias to DOMSAFE v3 ==== */
(function(){
  if (window.__DOMSAFE__ && typeof window.__DOMSAFE__.getById === "function") {
    window.safeGetById  = window.__DOMSAFE__.getById;
    window.safeQueryAll = window.__DOMSAFE__.queryAll;
    window.escapeCssId  = window.__DOMSAFE__.escapeCssId;
  }
})();
 /* ==== end helpers ==== */
import "./styles/RiyalSymbolToken-symbol.css";

document.body.classList.add('RiyalSymbolToken-after');

/* no-sar v2: suppress sar when % is a sibling or داخل سطر الضريبة */
(() => {
  if (window.__noPercent_v2) return;
  const hasPct = t => /[٪%]/.test((t||"").trim());
  const isTaxRow = el => {
    let a = el;
    for (let i=0; i<5 && a; i++, a=a.parentElement) {
      if (/الضريبة|tax/i.test(a.textContent||"")) return true;
    }
    return false;
  };
  const mark = el => {
    if (!el) return;
    const txt = (el.textContent||"").trim();
    if (!txt || hasPct(txt) || hasPct(el.nextElementSibling?.textContent) || hasPct(el.previousElementSibling?.textContent) || isTaxRow(el)) {
      el.classList.add("no-RiyalSymbolToken");
    } else {
      el.classList.remove("no-RiyalSymbolToken");
    }
  };
  const scan = (root=document) => root.querySelectorAll(".money,[data-money]").forEach(mark);
  scan();
  const mo = new MutationObserver(() => scan());
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true});
  window.__noPercent_v2 = true;
})();
/* __RiyalSymbolTokenZeroFix: enforce RiyalSymbolToken after zeros + hide on tax rows */
(() => {
  function normalize(el){
    if(!(el instanceof HTMLElement)) return;
    // وحّد المصدر
    if (!el.classList.contains("money")) el.classList.add("money");

    // حدّد سطر الضريبة كي لا يظهر الرمز
    const row = el.closest('li, tr, [role="row"], .row, .line, .totals, .summary');
    const rowText = (row?.textContent || "").replace(/\s+/g,"");
    if (/الضريبة|%|٪|tax/i.test(rowText)) { el.classList.add("no-RiyalSymbolToken"); el.classList.remove("zero"); return; }
    el.classList.remove("no-RiyalSymbolToken");

    // لو نص القيمة فاضي أو مسافات: فعّل zero placeholder
    const txt = (el.textContent || "").trim();
    if (txt === "") el.classList.add("zero"); else el.classList.remove("zero");
  }

  function scan(root=document){
    root.querySelectorAll(".price, .total, .money, [data-money]").forEach(normalize);
  }

  // فعّل body.RiyalSymbolToken-after لو مو موجود
  document.body.classList.add("RiyalSymbolToken-after");
  scan();

  const mo = new MutationObserver(muts=>{
    for(const m of muts){
      if(m.type==="childList"){
        m.addedNodes.forEach(n=>{
          if(n.nodeType===1){
            if(n.matches?.(".price,.total,.money,[data-money]")) normalize(n);
            if(n.querySelector) scan(n);
          }
        });
      } else if(m.type==="characterData"){
        const host = m.target.parentElement?.closest?.(".price,.total,.money,[data-money]");
        if(host) normalize(host);
      }
    }
  });
  mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.__ZeroFix = true;
})();
/* __RiyalSymbolTokenTaxFix2: stronger detection for tax rows (hide RiyalSymbolToken symbol) */
(() => {
  function isTaxLike(el){
    const parts = [];
    parts.push(el.textContent || "");
    if (el.parentElement) parts.push(el.parentElement.textContent || "");
    const row = el.closest('li, tr, [role="row"], .row, .line, .totals, .summary, .total-row, .invoice-summary-item');
    if (row) parts.push(row.textContent || "");
    const txt = parts.join(" ").replace(/\s+/g,"");
    return /الضريبة|ضريبة|[%٪]\d+|\d+[%٪]|tax/i.test(txt);
  }
  function normalize(el){
    if(!(el instanceof HTMLElement)) return;
    // وحّد المصدر
    if (!el.classList.contains("money")) el.classList.add("money");
    // ممنوع الرمز في صف الضريبة
    if (isTaxLike(el)) { el.classList.add("no-RiyalSymbolToken"); return; }
    el.classList.remove("no-RiyalSymbolToken");
  }
  function scan(root=document){
    root.querySelectorAll(".price, .total, .money, [data-money]").forEach(normalize);
  }
  scan();
  const mo2 = new MutationObserver(muts=>{
    for(const m of muts){
      if(m.type==="childList"){
        m.addedNodes.forEach(n=>{
          if(n.nodeType===1){
            if(n.matches?.(".price,.total,.money,[data-money]")) normalize(n);
            if(n.querySelector) scan(n);
          }
        });
      } else if(m.type==="characterData"){
        const host = m.target.parentElement?.closest?.(".price,.total,.money,[data-money]");
        if(host) normalize(host);
      }
    }
  });
  mo2.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.__TaxFix2 = true;
})();
/* __RiyalSymbolTokenCurrencyLabel: show RiyalSymbolToken symbol instead of the word RiyalSymbolToken in currency fields */
(() => {
  function replaceCurrencyText(root=document){
    // inputs / contenteditable
    root.querySelectorAll('input, [contenteditable="true"]').forEach(el=>{
      const val = (('value' in el) ? el.value : el.textContent || '').trim();
      if (/^﷼$/i.test(val)) {
        if ('value' in el) { el.value = "﷼"; el.dispatchEvent(new Event('input',{bubbles:true})); }
        else { el.textContent = "﷼"; }
      }
      const ph = el.getAttribute?.('placeholder');
      if (ph && /^﷼$/i.test(ph)) el.setAttribute('placeholder','﷼');
    });
    // selects / options
    root.querySelectorAll('select').forEach(sel=>{
      sel.querySelectorAll('option').forEach(opt=>{
        if (/^\s*﷼\s*$/i.test(opt.textContent || "")) {
          opt.textContent = "﷼"; // نغيّر النص فقط، القيمة (value) تبقى كما هي (مثلاً RiyalSymbolToken)
        }
      });
      // لو الخيار المختار كان RiyalSymbolToken سيظهر الآن "﷼"
    });
  }
  replaceCurrencyText();
  const mo = new MutationObserver(muts=>{
    for (const m of muts){
      if (m.type === "childList"){
        m.addedNodes.forEach(n => { if (n.nodeType===1) replaceCurrencyText(n); });
      } else if (m.type === "characterData"){
        const host = m.target.parentElement;
        if (host) replaceCurrencyText(host);
      }
    }
  });
  mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.__CurrencyLabel = true;
})();
/* __RiyalSymbolTokenCurrencyLabel2: force show ﷼ instead of the word RiyalSymbolToken anywhere in the UI */
(() => {
  if (window.__CurrencyLabel2) return;

  const isRialOnly = s => /^\s*﷼\s*$/i.test(s || "");

  function tweak(el){
    // بدّل نصوص العقد النصية المباشرة
    for (const n of Array.from(el.childNodes)) {
      if (n.nodeType === 3 && isRialOnly(n.nodeValue)) n.nodeValue = "﷼";
    }

    // قيم وخصائص شائعة
    const attrs = ["placeholder","aria-label","aria-valuetext","title"];
    for (const a of attrs) {
      const v = el.getAttribute?.(a);
      if (v && isRialOnly(v)) el.setAttribute(a, "﷼");
    }

    // inputs/textarea
    if ("value" in el && isRialOnly(el.value)) {
      el.value = "﷼";
      try { el.dispatchEvent(new Event("input",{bubbles:true})); } catch {}
    }

    // select/option
    if (el.tagName === "OPTION" && isRialOnly(el.textContent)) {
      el.textContent = "﷼";
    }
  }

  function scan(root=document){
    // نفحص العناصر نفسها وعناصرها الداخلية
    tweak(root);
    root.querySelectorAll("*").forEach(tweak);
  }

  scan();

  const mo = new MutationObserver(muts=>{
    for (const m of muts){
      if (m.type === "childList"){
        m.addedNodes.forEach(n=>{
          if (n.nodeType === 1){ scan(n); }
          else if (n.nodeType === 3 && isRialOnly(n.nodeValue)) n.nodeValue = "﷼";
        });
      } else if (m.type === "characterData"){
        if (isRialOnly(m.target.nodeValue)) m.target.nodeValue = "﷼";
      }
    }
  });
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true});

  window.__CurrencyLabel2 = true;
})();

/* __swapRiyalSymbol: بدّل RiyalSymbolToken المنفردة إلى "﷼" (لا يلمس "بال﷼" إلخ) */
(() => {
  const isRial = s => /^\s*﷼\s*$/.test(s || "");
  function swap(root=document){
    // options داخل select
    root.querySelectorAll('select option').forEach(o=>{
      if(isRial(o.textContent)) o.textContent = "﷼";
    });
    // نصوص مستقلة في spans/labels/… (مش جُزء من جملة)
    root.querySelectorAll('span,div,label,button,small,strong').forEach(el=>{
      const t=(el.textContent||"").trim();
      if(isRial(t)) el.textContent="﷼";
    });
    // الحقول وخصائص العرض
    root.querySelectorAll('input, [placeholder], [title], [aria-label]').forEach(el=>{
      if(el.placeholder && isRial(el.placeholder)) el.placeholder="﷼";
      const al=el.getAttribute("aria-label"); if(isRial(al)) el.setAttribute("aria-label","﷼");
      if(el.title && isRial(el.title)) el.title="﷼";
      if(el.tagName==="INPUT" && isRial(el.value)) el.value="﷼";
    });
  }
  swap();
  const mo=new MutationObserver(ms=>{
    for(const m of ms){
      if(m.type==="childList"){
        m.addedNodes.forEach(n=>{ if(n.nodeType===1) swap(n); });
      } else if(m.type==="characterData"){
        const el=m.target.parentElement; if(el) swap(el);
      }
    }
  });
  mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  window.__swapRiyalSymbol=true;
})();

/* === __RiyalSymbolTokenCurrencyNameFixV2: brutally ensure currency field shows the RiyalSymbolToken symbol === */
(() => {
  if (window.__CurrencyNameFixV2) return;

  const AR_DIAC = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
  function norm(s){
    if (!s) return "";
    s = s.replace(AR_DIAC,"");
    s = s.replace(/\s+/g," ").trim();
    return s.toLowerCase();
  }
  function looksLikeRiyal(txt){
    const s = norm(txt);
    return s.includes(RiyalSymbolToken) || s.includes("riy") || s.includes("RiyalSymbolToken") || s.includes("saudi riyal");
  }
  function toSymbolIfRiyal(txt){ return looksLikeRiyal(txt) ? "﷼" : null; }

  function markCurrencyNodes(root=document){
    const out = new Set();

    // إشارات دلالية بالخانة
    root.querySelectorAll('input[name*="currency" i],select[name*="currency" i],#currency,[id*="currency" i],[aria-label*="currency" i],[placeholder*="currency" i],[data-testid*="currency" i]')
        .forEach(n => out.add(n));

    // label مكتوب فيه "العملة/عملة/Currency"
    root.querySelectorAll("label").forEach(lbl => {
      const t = norm(lbl.textContent);
      if (t.includes("عملة") || t === "العملة" || t.includes("currency")){
        const ctrl = lbl.control || (function(){
          const forId = lbl.getAttribute("for");
          if (forId) return window.__DOMSAFE__.getById(root, forId);
          return lbl.parentElement && lbl.parentElement.querySelector && lbl.parentElement.querySelector("input,select,[role='combobox']");
        })();
        if (ctrl) out.add(ctrl);
      }
    });

    // React-Select / Combobox
    root.querySelectorAll('[role="combobox"],[class*="singleValue"],[class*="SingleValue"],[class*="value"]')
        .forEach(n => out.add(n));

    return Array.from(out);
  }

  function fixNode(el){
    if (!el) return;

    // SELECT
    if (el.tagName === "SELECT"){
      let changed=false;
      el.querySelectorAll("option").forEach(opt=>{
        const rep = toSymbolIfRiyal(opt.textContent);
        if (rep && opt.textContent !== rep){ opt.textContent = rep; changed=true; }
      });
      const sel = el.options[el.selectedIndex];
      if (sel){
        const rep = toSymbolIfRiyal(sel.textContent);
        if (rep && sel.textContent !== rep){ sel.textContent = rep; changed=true; }
      }
      if (changed) el.classList.add("RiyalSymbolToken-currency-name");
      return;
    }

    // INPUT
    if (el.tagName === "INPUT"){
      const rep = toSymbolIfRiyal(el.value);
      if (rep && el.value !== rep){ el.value = rep; }
      el.classList.add("RiyalSymbolToken-currency-name");
      return;
    }

    // React-Select / عناصر عرض عامة
    const rep = toSymbolIfRiyal(el.textContent);
    if (rep && el.textContent !== rep){
      el.textContent = rep;
      el.classList.add("RiyalSymbolToken-currency-name");
      return;
    }

    // محاولة داخلية لعناصر value
    const sv = el.querySelector && el.querySelector('[class*="singleValue"],[class*="value"]');
    if (sv){
      const rep2 = toSymbolIfRiyal(sv.textContent);
      if (rep2 && sv.textContent !== rep2){
        sv.textContent = rep2;
        sv.classList.add("RiyalSymbolToken-currency-name");
      }
    }
  }

  function apply(root=document){
    try { markCurrencyNodes(root).forEach(fixNode); } catch(e){}
    // إن كانت داخل iframe (نفس الأصل) نعالجها أيضاً
    root.querySelectorAll && root.querySelectorAll("iframe").forEach(fr=>{
      try {
        const d = fr.contentDocument || (fr.contentWindow && fr.contentWindow.document);
        if (d) apply(d);
      } catch(_e){}
    });
  }

  apply();

  const mo = new MutationObserver(muts=>{
    for(const m of muts){
      if (m.type==="childList"){
        m.addedNodes.forEach(n=>{ if (n.nodeType===1) apply(n); });
      }
      if (m.type==="characterData"){
        const el = m.target.parentElement;
        if (el) apply(el);
      }
    }
  });
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true});

  window.__CurrencyNameFixV2 = true;
})();
/* === __currencyRialToSymbol: استثناء خانة العملة فقط === */
(() => {
  if (window.__currencyRialToSymbol) return;

  const AR_DIAC = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
  function norm(s){
    if (!s) return "";
    return s.replace(AR_DIAC,"").replace(/\s+/g," ").trim().toLowerCase();
  }
  // نبدّل RiyalSymbolToken أو "<RiyalSymbol showText={true} />" فقط. لو ودك تشمل RiyalSymbolToken/Riyal فعّل الأسطر في التعليق.
  function isRiyalWord(txt){
    const n = norm(txt);
    return /^﷼(?: سعودي)?$/.test(n);
    // || n === "riyal" || n === "saudi riyal" || n === "RiyalSymbolToken"
  }

  function findCurrencyRoots(doc=document){
    const out = new Set();

    // label = "العملة" أو تحتوي "عملة"/"Currency"
    doc.querySelectorAll("label").forEach(lbl=>{
      const t = (lbl.textContent || "").trim();
      if (/^العملة$/i.test(t) || /عملة|currency/i.test(t)){
        const forId = lbl.getAttribute("for");
        const ctrl = forId ? window.__DOMSAFE__.getById(doc, forId)
                           : (lbl.parentElement && lbl.parentElement.querySelector && lbl.parentElement.querySelector("input,select,[role='combobox']"));
        const root = (ctrl && (ctrl.closest(".form-group, .field, .input-group, .row, .css-1, .css-2") || ctrl.parentElement)) || lbl.parentElement || lbl;
        if (root) out.add(root);
      }
    });

    // احتياط: عناصر باسم/معرّف currency
    doc.querySelectorAll('[name*="currency" i],[id*="currency" i]').forEach(n=>{
      out.add(n.closest(".form-group, .field, .input-group, .row") || n.parentElement || n);
    });

    return Array.from(out).filter(Boolean);
  }

  function rewriteRoot(root){
    if (!root) return;
    root.classList.add("RiyalSymbolToken-currency-name");

    // 1) SELECT
    root.querySelectorAll("select").forEach(sel=>{
      sel.querySelectorAll("option").forEach(opt=>{
        if (isRiyalWord(opt.textContent)) opt.textContent = "﷼";
      });
      const s = sel.options[sel.selectedIndex];
      if (s && isRiyalWord(s.textContent)) s.textContent = "﷼";
      sel.addEventListener("change", ()=>{
        const s2 = sel.options[sel.selectedIndex];
        if (s2 && isRiyalWord(s2.textContent)) s2.textContent = "﷼";
      });
    });

    // 2) INPUT
    root.querySelectorAll("input").forEach(inp=>{
      if (isRiyalWord(inp.value)) inp.value = "﷼";
      inp.addEventListener("input", ()=>{
        if (isRiyalWord(inp.value)) inp.value = "﷼";
      });
    });

    // 3) React-Select / Combobox display
    root.querySelectorAll('[role="combobox"],[class*="singleValue"],[class*="SingleValue"]').forEach(n=>{
      if (isRiyalWord(n.textContent)) n.textContent = "﷼";
      // محاولة داخلية لعقد العرض
      const val = n.querySelector && n.querySelector('[class*="singleValue"],[class*="value"]');
      if (val && isRiyalWord(val.textContent)) val.textContent = "﷼";
    });

    // 4) عقد نصية مباشرة
    root.querySelectorAll("*").forEach(n=>{
      const onlyText = n.childNodes && n.childNodes.length===1 && n.childNodes[0].nodeType===3;
      if (onlyText && isRiyalWord(n.textContent)) n.textContent = "﷼";
    });
  }

  function apply(doc=document){
    findCurrencyRoots(doc).forEach(rewriteRoot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ()=>apply());
  } else {
    setTimeout(apply, 0);
  }

  const mo = new MutationObserver(muts=>{
    for (const m of muts){
      if (m.type === "childList"){
        m.addedNodes.forEach(n=>{
          if (n.nodeType===1){
            // عالج ما أُضيف، ثم ابحث عن الخانة داخله
            rewriteRoot(n.closest && n.closest(".RiyalSymbolToken-currency-name"));
            apply(n.ownerDocument || document);
            try { findCurrencyRoots(n).forEach(rewriteRoot); } catch(_) {}
          }
        });
      }
      if (m.type === "characterData"){
        const el = m.target.parentElement;
        if (el) rewriteRoot(el.closest(".RiyalSymbolToken-currency-name") || el);
      }
    }
  });
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true});

  window.__currencyRialToSymbol = true;
})();
/* ==== __currencyIconInjection: استثناء خانة "العملة" لإظهار أيقونة SVG ==== */
(() => {
  if (window.__currencyIconInjection) return;

  const AR_DIAC = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
  const WORDS   = /^(?:﷼(?:\s*سعودي)?|RiyalSymbolToken|riy?al|saudi\s*riy?al)$/i;

  function norm(s){ return (s||"").replace(AR_DIAC,"").replace(/\s+/g," ").trim().toLowerCase(); }
  function isRiyalWord(s){ return WORDS.test(norm(s)); }

  // العثور على جذر خانة "العملة"
  function findCurrencyRoots(doc=document){
    const out = new Set();

    // بالمُلصق العربي "العملة"
    doc.querySelectorAll("label").forEach(lbl=>{
      const t = (lbl.textContent||"").trim();
      if (/^العملة$/i.test(t)) {
        const forId = lbl.getAttribute("for");
        const ctrl = forId ? window.__DOMSAFE__.getById(doc, forId)
                           : (lbl.parentElement?.querySelector?.("input,select,[role='combobox']"));
        const root = (ctrl?.closest(".form-group,.field,.input-group,.row,.css-1,.css-2") || ctrl?.parentElement || lbl.parentElement || lbl);
        if (root) out.add(root);
      }
    });

    // احتياط: بالاسم/المعرّف
    doc.querySelectorAll('[name*="currency" i],[id*="currency" i]').forEach(n=>{
      out.add(n.closest(".form-group,.field,.input-group,.row") || n.parentElement || n);
    });

    return Array.from(out);
  }

  // حقن الأيقونة في عنصر عرض (React-Select singleValue / span نصي...etc)
  function injectIconInto(el){
    if (!el) return;
    // لا نعيد الحقن مرتين
    if (el.querySelector?.(".RiyalSymbolToken-csym")) return;

    // لو العنصر يحتوي نص "﷼..." نحوله لأيقونة
    if (isRiyalWord(el.textContent)) {
      el.textContent = "";
      const s = el.ownerDocument.createElement("span");
      s.className = "RiyalSymbolToken-csym";
      s.setAttribute("title","<RiyalSymbol showText={true} />");
      el.appendChild(s);
      el.classList.add("RiyalSymbolToken-currency-name");
    }
  }

  function rewriteRoot(root){
    if (!root) return;
    root.classList.add("RiyalSymbolToken-currency-name");

    // React-Select / combobox: قيمة العرض
    root.querySelectorAll('[class*="singleValue"],[class*="SingleValue"],[role="combobox"]').forEach(injectIconInto);

    // أي سطر نصي مباشر
    root.querySelectorAll("*").forEach(n=>{
      const onlyText = n.childNodes && n.childNodes.length===1 && n.childNodes[0].nodeType===3;
      if (onlyText) injectIconInto(n);
    });

    // كأفضل الممكن: <input>/<select> نترك القيمة نصية لأن المتصفّح لا يدعم HTML داخلها
    root.querySelectorAll("input,select").forEach(el=>{
      if (isRiyalWord(el.value || el.selectedOptions?.[0]?.textContent)) {
        // نُظهر الرمز بجانب الحقل (قبل/بعد) باستخدام عنصر مساعد
        const holder = el.parentElement || root;
        if (!holder.querySelector(".RiyalSymbolToken-csym")) {
          const s = el.ownerDocument.createElement("span");
          s.className = "RiyalSymbolToken-csym";
          s.style.marginInlineStart = ".35em";
          s.style.pointerEvents = "none";
          holder.appendChild(s);
        }
        holder.classList.add("RiyalSymbolToken-currency-name");
      }
    });
  }

  function apply(doc=document){ findCurrencyRoots(doc).forEach(rewriteRoot); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ()=>apply());
  } else {
    setTimeout(apply, 0);
  }

  const mo = new MutationObserver(muts=>{
    for (const m of muts){
      if (m.type === "childList"){
        m.addedNodes.forEach(n=>{ if (n.nodeType===1) { apply(n); } });
      }
      if (m.type === "characterData"){
        const el = m.target.parentElement;
        if (el) injectIconInto(el);
      }
    }
  });
  mo.observe(document.documentElement, {subtree:true, childList:true, characterData:true});

  window.__currencyIconInjection = true;
})();


















