export function watchRiyal(){
  try{
    if (typeof window !== "undefined") {
      if (window.__riyalObs) {
        if (typeof window.__riyalObs.disconnect === "function") {
          try { window.__riyalObs.disconnect(); } catch(e) {}
        }
      }
    }

    var FONT = "\"Saudi-Riyal\",\"Tajawal\",\"IBM Plex Sans Arabic\",\"Segoe UI\",system-ui,sans-serif";
    var SYMBOL_CHAR = "﷼";
    var SELECTOR_GUESSES = [
      "select[name*=\"currency\" i]",
      "select[id*=\"currency\" i]",
      "select[class*=\"currency\" i]",
      "select[data-field*=\"currency\" i]",
      "select.currency-select",
      "select"
    ];

    function rm(s){
      var v = s ? s : "";
      return v.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\s]/g,"").trim();
    }
    function looksRiyalWord(s){
      return /^(?:ال)?ريال(?:السعودي)?$/u.test(rm(s));
    }
    function looksRiyalSym(s){
      var v = s ? s : "";
      return /^(?:ر\.?\s?س|RiyalSymbolToken)$/iu.test(v.trim());
    }

    function labelSaysCurrency(sel){
      var id = sel.getAttribute("id");
      if (id) {
        var lab = document.querySelector('label[for="'+ CSS.escape(id) +'"]');
        if (lab) {
          var t = lab.textContent ? lab.textContent.trim() : "";
          if (/العملة/u.test(t)) { return true; }
        }
      }
      var p = sel.previousElementSibling;
      var i = 0;
      while (p && i < 3) {
        if (p.tagName === "LABEL") {
          var tt = p.textContent ? p.textContent.trim() : "";
          if (/العملة/u.test(tt)) { return true; }
        }
        p = p.previousElementSibling;
        i = i + 1;
      }
      var ok = false;
      if (sel.name) {
        if (/currency/i.test(sel.name)) { ok = true; }
      }
      if (!ok) {
        if (sel.className) {
          if (/currency/i.test(sel.className)) { ok = true; }
        }
      }
      return ok;
    }

    function applyOnSelect(sel){
      if (!sel) { return; }
      if (!labelSaysCurrency(sel)) { return; }

      var opts = sel.options ? Array.from(sel.options) : [];
      var k = 0;
      while (k < opts.length) {
        var opt = opts[k];
        var val = String(opt.value ? opt.value : "").toUpperCase();
        var txt = opt.textContent ? opt.textContent.trim() : "";
        var match = false;
        if (val === "RiyalSymbolToken") { match = true; }
        if (!match) { if (looksRiyalWord(txt)) { match = true; } }
        if (!match) { if (looksRiyalSym(txt))  { match = true; } }
        if (match) {
          if (opt.textContent !== SYMBOL_CHAR) { opt.textContent = SYMBOL_CHAR; }
          opt.classList.add("RiyalSymbolToken-ry");
        }
        k = k + 1;
      }

      function restyle(){
        var selOpt = null;
        if (sel.options) {
          if (sel.selectedIndex >= 0) { selOpt = sel.options[sel.selectedIndex]; }
        }
        var t = "";
        if (selOpt) {
          if (selOpt.textContent) { t = selOpt.textContent.trim(); }
        }
        if (t === SYMBOL_CHAR) {
          sel.classList.add("RiyalSymbolToken-ry");
          sel.style.fontFamily = FONT;
        } else {
          sel.classList.remove("RiyalSymbolToken-ry");
          sel.style.removeProperty("font-family");
        }
      }

      if (sel.__RiyalSymbolTokenHook) { sel.removeEventListener("change", sel.__RiyalSymbolTokenHook); }
      sel.__RiyalSymbolTokenHook = restyle;
      sel.addEventListener("change", restyle, { passive: true });
      restyle();
    }

    function scan(root){
      var r = root ? root : document;
      var i = 0;
      while (i < SELECTOR_GUESSES.length) {
        var q = SELECTOR_GUESSES[i];
        var found = r.querySelectorAll(q);
        var arr = Array.from(found);
        var j = 0;
        while (j < arr.length) { applyOnSelect(arr[j]); j = j + 1; }
        i = i + 1;
      }
    }

    scan();
    setTimeout(function(){ scan(); }, 120);
    setTimeout(function(){ scan(); }, 500);
    setTimeout(function(){ scan(); }, 1000);

    var obs = new MutationObserver(function(muts){
      var mIdx = 0;
      while (mIdx < muts.length) {
        var m = muts[mIdx];
        if (m.type === "childList") {
          var adds = Array.from(m.addedNodes ? m.addedNodes : []);
          var a = 0;
          while (a < adds.length) {
            var n = adds[a];
            if (n) {
              if (n.nodeType === 1) { scan(n); }
            }
            a = a + 1;
          }
        } else if (m.type === "attributes") {
          var tgt = m.target;
          var isSel = false;
          if (tgt) {
            if (tgt.matches) {
              if (tgt.matches("select")) { isSel = true; }
            }
          }
          if (isSel) { scan(tgt); }
        }
        mIdx = mIdx + 1;
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class","id","name"] });
    window.__riyalObs = obs;
  } catch(e) {}
}

/* [RIYAL-ENSURE-SINGLE-BEGIN] */
(function(){
  const SEL = '.riyal-symbol, .RiyalSymbolToken-currency-name';
  function ensureSingleRiyal(root=document){
    // 1) استبدال أي نص "ر.س" أو "SAR" داخل العناصر إلى "﷼"
    root.querySelectorAll(SEL).forEach(el=>{
      // نظف أية عناصر داخلية (svg/img) حتى لا تتكرر
      el.querySelectorAll('svg,img').forEach(n=>n.remove());
      const txt = (el.textContent || '').trim();
      if(/^(?:ر\.س|SAR|ريال سعودي)$/i.test(txt) || txt.length !== 1) {
        el.textContent = '﷼';
      }
      el.setAttribute('aria-label','ريال سعودي');
    });

    // 2) ضمن كل أب، احتفظ بأول عنصر فقط وأزل البقية
    const parents = new Set(Array.from(root.querySelectorAll(SEL)).map(e=>e.parentElement).filter(Boolean));
    parents.forEach(p=>{
      const list = Array.from(p.querySelectorAll(':scope > .riyal-symbol, :scope > .RiyalSymbolToken-currency-name'));
      if(list.length > 1){
        list.forEach((el,i)=>{
          if(i===0){ el.textContent='﷼'; }
          else { el.remove(); }
        });
      }
      // 3) أزل عقد النص المجاورة التي تحتوي "ر.س" أو "SAR"
      Array.from(p.childNodes).forEach(n=>{
        if(n.nodeType===3 && /ر\.س|SAR|ريال سعودي/i.test(n.nodeValue)){ n.nodeValue = n.nodeValue.replace(/ر\.س|SAR|ريال سعودي/gi,''); }
      });
    });
  }

  if(typeof window!=='undefined'){
    window.ensureSingleRiyal = ensureSingleRiyal;
    if(document.readyState!=='loading') ensureSingleRiyal();
    else document.addEventListener('DOMContentLoaded', ()=>ensureSingleRiyal());
    const mo = new MutationObserver(m=>{ for(const x of m){ if(x.addedNodes && x.addedNodes.length) ensureSingleRiyal(); } });
    mo.observe(document.documentElement, {subtree:true, childList:true});
  }
})();
 /* [RIYAL-ENSURE-SINGLE-END] */

/* [RIYAL-EXTRA-KILL-BEGIN] */
(function(){
  const SEL = ".riyal-symbol, .RiyalSymbolToken-currency-name";
  function killOrphans(root=document){
    const iconsSel = 'img[src*="sar"], img[src*="riyal"], svg[class*="sar"], svg[id*="sar"], svg[class*="riyal"], svg[id*="riyal"], svg use[href*="sar"], svg use[xlink\\:href*="sar"], svg use[href*="riyal"], svg use[xlink\\:href*="riyal"]';
    const nodes = root.querySelectorAll(SEL);
    nodes.forEach(el=>{
      // طبّع النص إلى "﷼"
      if((el.textContent||"").trim() !== "﷼") el.textContent = "﷼";
      el.setAttribute("aria-label","ريال سعودي");

      // احذف أيقونات قريبة داخل الأب والجد
      [el.parentElement, el.parentElement?.parentElement].forEach(host=>{
        if(!host) return;
        host.querySelectorAll(iconsSel).forEach(x=>x.remove());
        // احذف التكرارات المتجاورة لنفس الرمز
        const siblings = host.querySelectorAll(':scope > .riyal-symbol, :scope > .RiyalSymbolToken-currency-name');
        siblings.forEach((n,i)=>{ if(i>0) n.remove(); });
        // نظّف عقد نصية فيها "ر.س" أو "SAR"
        Array.from(host.childNodes).forEach(n=>{
          if(n.nodeType===3 && /ر\.س|SAR|ريال سعودي/i.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/ر\.س|SAR|ريال سعودي/gi,'');
        });
      });
    });
  }

  if(typeof window!=="undefined"){
    window.killOrphanSarIcons = killOrphans;
    if(document.readyState!=="loading") killOrphans();
    else document.addEventListener("DOMContentLoaded", killOrphans);
    new MutationObserver(m=>{ for(const _ of m){ killOrphans(); break; } })
      .observe(document.documentElement,{subtree:true,childList:true});
  }
})();
/* [RIYAL-EXTRA-KILL-END] */

/* [RIYAL-FINAL-SWEEP] */
(function(){
  const SEL = ".riyal-symbol, .RiyalSymbolToken-currency-name";
  function sweep(root=document){
    // خلي النص "﷼" فقط
    root.querySelectorAll(SEL).forEach(el=>{
      if((el.textContent||"").trim()!=="﷼") el.textContent="﷼";
      el.setAttribute("aria-label","ريال سعودي");
    });
    // امسح أي IMG/SVG صغيرة بجوار الرمز حتى لو ما فيها sar بالمسار
    const near = [];
    document.querySelectorAll(SEL).forEach(el=>{
      const host = el.parentElement;
      if(!host) return;
      host.querySelectorAll(':scope > img, :scope > svg, :scope > object, :scope > embed').forEach(n=>{
        // عناصر صغيرة شبيهة بالأيقونة
        const w = (n.width && n.width.baseVal ? n.width.baseVal.value : n.width) || n.clientWidth || 0;
        const h = (n.height && n.height.baseVal ? n.height.baseVal.value : n.height) || n.clientHeight || 0;
        if(w<=32 && h<=32) near.push(n);
      });
    });
    near.forEach(n=>n.remove());
  }
  if(typeof window!=="undefined"){
    if(document.readyState!=="loading") sweep();
    else document.addEventListener("DOMContentLoaded", sweep);
    new MutationObserver(()=>sweep()).observe(document.documentElement,{subtree:true,childList:true});
  }
})();

/* [RIYAL-ONE-ONLY-BEGIN] */
(function(){
  const SEL = ".riyal-symbol, .RiyalSymbolToken-currency-name";
  const isSmall = (n)=>{
    try{
      const r = n.getBoundingClientRect();
      return r.width<=64 && r.height<=64;
    }catch{ return true; }
  };
  function oneOnly(root=document){
    root.querySelectorAll(SEL).forEach(el=>{
      // ثبّت النص على "﷼"
      if((el.textContent||"").trim()!=="﷼") el.textContent="﷼";
      el.setAttribute("aria-label","ريال سعودي");

      // احذف أيقونات صغيرة في نفس الحاوية أو الحاوية الأقرب
      let host = el.closest("span,div,td,th,li,p,button") || el.parentElement;
      [host, host?.parentElement].forEach(h=>{
        if(!h) return;
        h.querySelectorAll(':scope > svg, :scope > img, :scope > object, :scope > embed').forEach(n=>{
          if(n!==el && isSmall(n)) n.remove();
        });
        // لو تكرّر الرمز نفسه عدّة مرات، اترك الأول فقط
        const siblings = h.querySelectorAll(':scope > .riyal-symbol, :scope > .RiyalSymbolToken-currency-name');
        siblings.forEach((n,i)=>{ if(i>0) n.remove(); });
        // نظّف النصوص المجاورة مثل "ر.س" أو "SAR"
        Array.from(h.childNodes).forEach(n=>{
          if(n.nodeType===3 && /ر\.س|SAR|ريال سعودي/i.test(n.nodeValue)){
            n.nodeValue = n.nodeValue.replace(/ر\.س|SAR|ريال سعودي/gi,'');
          }
        });
      });
    });
  }
  if(typeof window!=="undefined"){
    if(document.readyState!=="loading") oneOnly();
    else document.addEventListener("DOMContentLoaded", oneOnly);
    new MutationObserver(()=>oneOnly()).observe(document.documentElement,{childList:true,subtree:true});
  }
})();
/* [RIYAL-ONE-ONLY-END] */

/* [RIYAL-LAST-STRIKE-BEGIN] */
(function(){
  const SEL = ".riyal-symbol, .RiyalSymbolToken-currency-name";
  function lastStrike(root=document){
    root.querySelectorAll(SEL).forEach(el=>{
      if((el.textContent||"").trim()!=="﷼") el.textContent = "﷼";
      el.setAttribute("aria-label","ريال سعودي");

      // امشِ للأعلى لثلاثة مستويات ونظّف أي IMG/SVG صغيرة ليست هي الرمز نفسه
      let h = el.parentElement;
      for(let i=0; i<3 && h; i++, h=h.parentElement){
        h.querySelectorAll("img,svg,object,embed").forEach(n=>{
          if(n.closest(SEL)) return;
          const r = (n.getBoundingClientRect && n.getBoundingClientRect()) || {width:0,height:0};
          if(r.width<=64 && r.height<=64) n.remove();
        });
        // أزل أي خلفية أيقونية صغيرة
        Array.from(h.children||[]).forEach(n=>{
          const cs = getComputedStyle(n);
          if(cs.backgroundImage!=="none"){
            const r = n.getBoundingClientRect();
            if(r.width<=64 && r.height<=64) n.style.backgroundImage = "none";
          }
        });
        // لا تكرار للرمز: اترك الأول فقط
        const sib = h.querySelectorAll(":scope > .riyal-symbol, :scope > .RiyalSymbolToken-currency-name");
        sib.forEach((n,idx)=>{ if(idx>0) n.remove(); });
      }
    });
  }
  if(typeof window!=="undefined"){
    if(document.readyState!=="loading") lastStrike();
    else document.addEventListener("DOMContentLoaded", lastStrike);
    new MutationObserver(()=>lastStrike()).observe(document.documentElement,{childList:true,subtree:true});
  }
})();
/* [RIYAL-LAST-STRIKE-END] */
