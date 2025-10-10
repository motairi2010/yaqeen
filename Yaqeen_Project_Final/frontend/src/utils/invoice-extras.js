// @ts-nocheck
(function(){
  if (typeof document === "undefined") return;
  const Q=(s,r=document)=>r.querySelector(s); const QA=(s,r=document)=>Array.from(r.querySelectorAll(s));

  // ========== Amount in Words ==========
  function parseNum(v){ if(v==null) return 0; const s=String(v).replace(/[^\d\.\-]/g,""); const n=parseFloat(s); return isNaN(n)?0:n }

  // إنجليزي بسيط (حتى مئات الملايين)
  const ones=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  function en_hund(n){
    let s=""; if(n>=100){ s+=ones[Math.floor(n/100)]+" hundred"; n%=100; if(n) s+=" and " }
    if(n<20) s+=ones[n]; else { s+=tens[Math.floor(n/10)]; if(n%10) s+="-"+ones[n%10] }
    return s;
  }
  function toWordsEn(n){
    if(n===0) return "zero";
    let s=""; const b=Math.floor(n/1e9); const m=Math.floor((n%1e9)/1e6); const th=Math.floor((n%1e6)/1e3); const h=n%1e3;
    if(b) s+=en_hund(b)+" billion "; if(m) s+=en_hund(m)+" million ";
    if(th) s+=en_hund(th)+" thousand "; if(h) s+=en_hund(h);
    return s.trim().replace(/\s+/g," ");
  }

  // عربي مبسّط (صياغة عامة جيدة لغاية الملايين)
  const ar_ones=["","واحد","اثنان","ثلاثة","أربعة","خمسة","ستة","سبعة","ثمانية","تسعة","عشرة","أحد عشر","اثنا عشر","ثلاثة عشر","أربعة عشر","خمسة عشر","ستة عشر","سبعة عشر","ثمانية عشر","تسعة عشر"];
  const ar_tens=["","","عشرون","ثلاثون","أربعون","خمسون","ستون","سبعون","ثمانون","تسعون"];
  function ar_hund(n){
    let s=""; if(n>=100){ const h=Math.floor(n/100); s += (h==1? "مائة" : h==2? "مائتان" : ar_ones[h]+" مائة"); n%=100; if(n) s+=" و " }
    if(n===0) return s;
    if(n<20){ s+=ar_ones[n] }
    else {
      const t=Math.floor(n/10), o=n%10;
      if(o===0) s+=ar_tens[t];
      else s+=(ar_ones[o]+" و "+ar_tens[t]);
    }
    return s;
  }
  function toWordRiyalSymbolToken(n){
    if(n===0) return "صفر";
    const parts=[];
    const b=Math.floor(n/1e9); const m=Math.floor((n%1e9)/1e6); const th=Math.floor((n%1e6)/1e3); const h=n%1e3;
    if(b){ parts.push(ar_hund(b)+" مليار"); }
    if(m){ parts.push(ar_hund(m)+" مليون"); }
    if(th){ parts.push(ar_hund(th)+" ألف"); }
    if(h){ parts.push(ar_hund(h)); }
    return parts.join(" و ").replace(/\s+/g," ").trim();
  }

  function currencyInfo(){
    const cur = Q("#currency")?.value || "﷼";
    // اللغة الافتراضية: عربي لـ ﷼، وإلا إنجليزي
    const lang = (cur==="﷼"||cur==="﷼"||cur==="﷼")? "ar" : "en";
    const label = (lang==="ar")? "المبلغ بالحروف" : "Amount in words";
    return {cur, lang, label};
  }

  function updateAmountInWords(){
    const totalEl = Q("#total, .total-amount");
    if(!totalEl) return;
    const raw = ("value" in totalEl)? totalEl.value : totalEl.textContent;
    const num = Math.abs(parseNum(raw));
    const whole = Math.floor(num);
    const frac = Math.round((num - whole) * 100); // هللات/سنتات
    const {lang, label, cur} = currencyInfo();

    let words = (lang==="ar"? toWordRiyalSymbolToken(whole) : toWordsEn(whole));
    if(frac>0){
      const fracWords = (lang==="ar"? toWordRiyalSymbolToken(frac)+" هللة" : toWordsEn(frac)+" cents");
      words += (lang==="ar"? " و " : " and ") + fracWords;
    }
    words += (lang==="ar"? " "+(cur==="﷼"?"﷼ سعودي":"") : " "+cur);
    let box = Q("#total-words");
    if(!box){
      box = document.createElement("div"); box.id="total-words"; box.className="amount-in-words";
      // قرب الإجمالي إن أمكن
      const host = totalEl.closest("#total, .total, .totals, .summary, div")?.parentElement || Q(".invoice-page") || document.body;
      host.appendChild(box);
    }
    box.textContent = label + ": " + words;
  }

  // ========== Signatures ==========
  const LS_SELLER="invoice.signature.seller", LS_CUSTOMER="invoice.signature.customer";
  function ensureSignaturesBlock(){
    let wrap = Q(".signatures", Q(".invoice-page")||document.body);
    if(!wrap){
      wrap = document.createElement("div"); wrap.className="signatures";
      const a=document.createElement("div"); a.className="signature-box"; a.innerHTML='<div class="signature-title">توقيع البائع</div><img id="sig-seller" alt="Seller signature" />';
      const b=document.createElement("div"); b.className="signature-box"; b.innerHTML='<div class="signature-title">توقيع العميل</div><img id="sig-customer" alt="Customer signature" />';
      wrap.appendChild(a); wrap.appendChild(b);
      (Q(".invoice-page")||document.body).appendChild(wrap);
    }
    // حمّل من التخزين المحلي
    try{
      const s=localStorage.getItem(LS_SELLER); if(s) Q("#sig-seller").src = s;
      const c=localStorage.getItem(LS_CUSTOMER); if(c) Q("#sig-customer").src = c;
    }catch(_){}
  }

  function openSignModal(target){
    let modal = Q("#sign-modal");
    if(!modal){
      modal = document.createElement("div"); modal.id="sign-modal"; modal.innerHTML = `
        <div class="panel">
          <div style="font-weight:700;margin-bottom:6px">التوقيع</div>
          <canvas id="sign-pad"></canvas>
          <div class="actions">
            <button type="button" data-act="clear">مسح</button>
            <button type="button" data-act="cancel">إلغاء</button>
            <button type="button" data-act="save">حفظ</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      // تهيئة الرسم
      const cvs = modal.querySelector("#sign-pad");
      const ctx = cvs.getContext("2d");
      function resize(){ const r=cvs.getBoundingClientRect(); cvs.width=r.width*2; cvs.height=r.height*2; ctx.scale(2,2); ctx.lineWidth=2; ctx.lineCap="round"; ctx.strokeStyle="#111827"; ctx.fillStyle="#fff"; ctx.fillRect(0,0,r.width,r.height); }
      const ro = new ResizeObserver(resize); ro.observe(cvs);
      let drawing=false, last=null;
      function pos(e){ if(e.touches){ const t=e.touches[0]; return {x:t.clientX - cvs.getBoundingClientRect().left, y:t.clientY - cvs.getBoundingClientRect().top} } return {x:e.offsetX,y:e.offsetY} }
      function start(e){ drawing=true; last=pos(e); }
      function move(e){ if(!drawing) return; const p=pos(e); ctx.beginPath(); ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last=p; }
      function end(){ drawing=false; last=null; }
      cvs.addEventListener("mousedown", start); cvs.addEventListener("mousemove", move); window.addEventListener("mouseup", end);
      cvs.addEventListener("touchstart", (e)=>{e.preventDefault(); start(e)} ,{passive:false});
      cvs.addEventListener("touchmove",  (e)=>{e.preventDefault(); move(e)}  ,{passive:false});
      cvs.addEventListener("touchend",   (e)=>{e.preventDefault(); end(e)}   ,{passive:false});
      modal._ctx = ctx; modal._canvas = cvs; modal._resize = resize;
    }
    modal.style.display="flex";
    modal._resize();

    modal.onclick = (e)=>{
      const btn = e.target.closest("button"); if(!btn) return;
      const act = btn.dataset.act;
      if(act==="cancel"){ modal.style.display="none"; return }
      if(act==="clear"){ const r=modal._canvas.getBoundingClientRect(); modal._ctx.fillStyle="#fff"; modal._ctx.fillRect(0,0,r.width,r.height); return }
      if(act==="save"){
        const r=modal._canvas.getBoundingClientRect();
        const data = modal._canvas.toDataURL("image/png", 0.9);
        try{
          if(target==="seller"){ localStorage.setItem(LS_SELLER, data); const img=Q("#sig-seller"); if(img) img.src=data; }
          if(target==="customer"){ localStorage.setItem(LS_CUSTOMER, data); const img=Q("#sig-customer"); if(img) img.src=data; }
        }catch(_){}
        modal.style.display="none";
      }
    };
  }

  function clearSignatures(){
    try{ localStorage.removeItem(LS_SELLER); localStorage.removeItem(LS_CUSTOMER); }catch(_){}
    const s=Q("#sig-seller"); if(s) s.removeAttribute("src");
    const c=Q("#sig-customer"); if(c) c.removeAttribute("src");
  }

  function ensureToolbar(){
    let tb = Q("#print-toolbar");
    if(!tb){
      tb = document.createElement("div"); tb.id="print-toolbar"; tb.style.position="fixed"; tb.style.inset="auto 16px 16px auto";
      tb.style.zIndex="9999"; tb.style.background="#fff"; tb.style.border="1px solid #e5e7eb"; tb.style.borderRadius="10px"; tb.style.padding="8px"; tb.style.display="flex"; tb.style.gap="8px";
      document.body.appendChild(tb);
    }
    const addBtn=(html)=>{ const d=document.createElement("div"); d.innerHTML=html.trim(); const b=d.firstElementChild; tb.appendChild(b); return b };
    if(!tb.querySelector('button[data-action="sign-seller"]'))   addBtn('<button type="button" data-action="sign-seller" title="توقيع البائع">✍️ توقيع البائع</button>');
    if(!tb.querySelector('button[data-action="sign-customer"]')) addBtn('<button type="button" data-action="sign-customer" title="توقيع العميل">✍️ توقيع العميل</button>');
    if(!tb.querySelector('button[data-action="sign-clear"]'))    addBtn('<button type="button" data-action="sign-clear" title="مسح التوقيعات">🧹 مسح التوقيعات</button>');
    tb.addEventListener("click",(e)=>{
      const btn=e.target.closest("button"); if(!btn) return;
      if(btn.dataset.action==="sign-seller"){ ensureSignaturesBlock(); openSignModal("seller"); }
      if(btn.dataset.action==="sign-customer"){ ensureSignaturesBlock(); openSignModal("customer"); }
      if(btn.dataset.action==="sign-clear"){ clearSignatures(); }
    });
  }

  // ========== Draft Watermark ==========
  function applyDraftWatermark(){
    const status = Q("#status")?.value?.toLowerCase() || "";
    let wm = Q(".watermark"); if(!wm){ wm=document.createElement("div"); wm.className="watermark"; wm.innerHTML="<span>مسودة / DRAFT</span>"; (Q(".invoice-page")||document.body).appendChild(wm); }
    wm.style.display = (status.includes("draft") || status.includes("مسود")) ? "flex" : "none";
  }

  // ========== Boot ==========
  function boot(){
    ensureToolbar();
    ensureSignaturesBlock();
    updateAmountInWords();
    applyDraftWatermark();

    // إعادة حساب سطر الحروف عند تغير الإجمالي/العملة
    const total = Q("#total, .total-amount"); if(total){ ["input","change"].forEach(ev=> total.addEventListener(ev, updateAmountInWords)); }
    const cur = Q("#currency"); if(cur){ cur.addEventListener("change", updateAmountInWords); }

    const status = Q("#status"); if(status){ status.addEventListener("change", applyDraftWatermark); }
  }
  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();


