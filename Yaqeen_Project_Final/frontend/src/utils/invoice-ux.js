// @ts-nocheck
(function(){
  if (typeof document === "undefined") return;

  const LS_PREFIX = "invoice.draft";
  const Q = (sel,root=document)=>root.querySelector(sel);
  const QA= (sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const parseNum=(v)=>{ if(v==null) return 0; const s=String(v).replace(/[^\d\.\-]/g,""); const n=parseFloat(s); return isNaN(n)?0:n };

  function getKey(root){
    const inv = Q("#invoiceNumber",root)?.value?.trim();
    const key = inv && inv.length ? inv : (location.pathname || "default");
    return `${LS_PREFIX}:${key}`;
  }

  function toast(msg,type="success"){
    let el = Q("#toast"); if(!el){ el=document.createElement("div"); el.id="toast"; document.body.appendChild(el); }
    el.className = `show ${type}`; el.textContent = msg;
    setTimeout(()=>{ el.className = el.className.replace("show","").trim() }, 1600);
  }

  function genInvoiceNumber(){
    const d = new Date();
    const pad = (n)=>String(n).padStart(2,"0");
    return `INV-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function serialize(root){
    const header = {};
    ["invoiceNumber","invoiceDate","dueDate","status","customerId","customerVatId","currency","paymentTerms","vatRate","discount","notes","terms"]
      .forEach(id=>{ const el=Q("#"+id,root); if(el){ header[id]=("value" in el)? el.value : el.textContent } });

    const table = Q(".invoice-grid table",root);
    const rows = table?.tBodies?.[0] ? Array.from(table.tBodies[0].rows) : [];
    const items = rows.map(r=>{
      const qtyEl   = r.querySelector('[data-qty], input[name*="qty"], input[data-type="qty"], td:nth-child(3) input, td:nth-child(3)');
      const priceEl = r.querySelector('[data-price], input[name*="price"], input[data-type="price"], td:nth-child(4) input, td:nth-child(4)');
      const taxEl   = r.querySelector('[data-tax], input[name*="tax"], input[data-type="tax"], td:nth-child(5) input, td:nth-child(5)');
      const nameEl  = r.querySelector('[data-name], input[name*="name"], input[name*="product"], td:nth-child(1) input, td:nth-child(1)');
      const descEl  = r.querySelector('[data-desc], textarea[name*="desc"], td:nth-child(2) textarea, td:nth-child(2)');
      return {
        name:  nameEl  ? (nameEl.value ?? nameEl.textContent) : "",
        desc:  descEl  ? (descEl.value ?? descEl.textContent) : "",
        qty:   qtyEl   ? (qtyEl.value ?? qtyEl.textContent)   : "",
        price: priceEl ? (priceEl.value ?? priceEl.textContent): "",
        tax:   taxEl   ? (taxEl.value ?? taxEl.textContent)   : ""
      };
    });

    return { header, items, ts: Date.now() };
  }

  function applyData(root,data){
    if(!data) return;
    const {header,items}=data;
    if(header){
      Object.entries(header).forEach(([id,val])=>{
        const el=Q("#"+id,root); if(!el) return;
        if("value" in el) el.value = val ?? ""; else el.textContent = val ?? "";
      });
    }
    const table = Q(".invoice-grid table",root);
    if(table?.tBodies?.[0]){
      const rows = Array.from(table.tBodies[0].rows);
      for(let i=0;i<Math.min(rows.length, items.length);i++){
        const r=rows[i], it=items[i];
        const set = (sel,v)=>{ const el=r.querySelector(sel); if(el){ if("value" in el) el.value=v??""; else el.textContent=v??""; } };
        set('[data-name], input[name*="name"], input[name*="product"], td:nth-child(1) input, td:nth-child(1)', it.name);
        set('[data-desc], textarea[name*="desc"], td:nth-child(2) textarea, td:nth-child(2)', it.desc);
        set('[data-qty], input[name*="qty"], input[data-type="qty"], td:nth-child(3) input, td:nth-child(3)', it.qty);
        set('[data-price], input[name*="price"], input[data-type="price"], td:nth-child(4) input, td:nth-child(4)', it.price);
        set('[data-tax], input[name*="tax"], input[data-type="tax"], td:nth-child(5) input, td:nth-child(5)', it.tax);
      }
    }
  }

  function validate(root){
    const errs=[];
    const req = (id,label)=>{ const el=Q("#"+id,root); if(!el) return; el.classList.remove("is-invalid"); const v=("value" in el)? el.value.trim() : el.textContent.trim(); if(!v){ el.classList.add("is-invalid"); errs.push(`حقل "${label}" مطلوب`) } };
    req("invoiceNumber","رقم الفاتورة");
    req("invoiceDate","تاريخ الفاتورة");
    req("customerId","العميل");

    const vat = parseNum(Q("#vatRate",root)?.value);
    if(vat<0 || vat>100){ const el=Q("#vatRate",root); if(el){ el.classList.add("is-invalid") } errs.push("الضريبة يجب أن تكون بين 0 و 100") }

    const discount = parseNum(Q("#discount",root)?.value);
    if(discount<0){ const el=Q("#discount",root); if(el){ el.classList.add("is-invalid") } errs.push("الخصم لا يمكن أن يكون سالباً") }

    // على الأقل عنصر واحد بكمية وسعر > 0
    const table = Q(".invoice-grid table",root);
    const rows = table?.tBodies?.[0] ? Array.from(table.tBodies[0].rows) : [];
    let hasItem=false;
    rows.forEach(r=>{
      const qty=parseNum(r.querySelector('[data-qty], input[name*="qty"], td:nth-child(3) input, td:nth-child(3)')?.value ?? r.querySelector('td:nth-child(3)')?.textContent);
      const price=parseNum(r.querySelector('[data-price], input[name*="price"], td:nth-child(4) input, td:nth-child(4)')?.value ?? r.querySelector('td:nth-child(4)')?.textContent);
      if(qty>0 && price>0) hasItem=true;
    });
    if(!hasItem){ errs.push("أضف عنصرًا واحدًا على الأقل بكمية وسعر أكبر من صفر") }

    return errs;
  }

  function ensureToolbarButtons(){
    let tb = document.getElementById("print-toolbar");
    if(!tb){
      tb = document.createElement("div"); tb.id="print-toolbar"; tb.style.position="fixed"; tb.style.inset="auto 16px 16px auto";
      tb.style.zIndex="9999"; tb.style.background="#fff"; tb.style.border="1px solid #e5e7eb"; tb.style.borderRadius="10px"; tb.style.padding="8px"; tb.style.display="flex"; tb.style.gap="8px";
      document.body.appendChild(tb);
    }
    const addBtn=(html)=>{ const temp=document.createElement("div"); temp.innerHTML=html.trim(); const b=temp.firstElementChild; tb.appendChild(b); return b };
    const addSep=()=>{ const s=document.createElement("div"); s.className="sep"; s.style.width="1px"; s.style.background="#e5e7eb"; s.style.margin="0 4px"; tb.appendChild(s) };

    if(!tb.querySelector('button[data-action="validate"]')) addBtn('<button type="button" data-action="validate" title="تحقّق">تحقّق</button>');
    if(!tb.querySelector('button[data-action="save"]'))     addBtn('<button type="button" data-action="save" title="حفظ المسودة">حفظ</button>');
    if(!tb.querySelector('button[data-action="restore"]'))  addBtn('<button type="button" data-action="restore" title="استعادة">استعادة</button>');
    if(!tb.querySelector('.sep')) addSep();
    if(!tb.querySelector('button[data-action="export"]'))   addBtn('<button type="button" data-action="export" title="تصدير JSON">تصدير</button>');
    if(!tb.querySelector('button[data-action="import"]'))   addBtn('<button type="button" data-action="import" title="استيراد JSON">استيراد</button>');

    // ملف مخفي للاستيراد
    if(!document.getElementById("invoice-import")){
      const fi=document.createElement("input"); fi.type="file"; fi.id="invoice-import"; fi.accept="application/json"; fi.style.display="none";
      document.body.appendChild(fi);
    }
  }

  function wire(root){
    ensureToolbarButtons();

    // رقم فاتورة تلقائي إن كان فارغ
    const inv = Q("#invoiceNumber",root);
    if(inv && (!inv.value || !inv.value.trim())){ inv.value = genInvoiceNumber() }

    let dirty=false, lastSaved="";
    const markDirty=()=>{ dirty=true };
    root.addEventListener("input", markDirty, true);
    root.addEventListener("change", markDirty, true);

    window.addEventListener("beforeunload",(e)=>{ if(dirty){ e.preventDefault(); e.returnValue=""; } });

    document.getElementById("print-toolbar").addEventListener("click",(e)=>{
      const btn = e.target.closest("button");
      if(!btn) return;
      const action = btn.dataset.action;
      if(action==="validate"){
        QA(".is-invalid",root).forEach(el=>el.classList.remove("is-invalid"));
        const errs = validate(root);
        if(errs.length){ toast(errs[0],"error"); } else { toast("تم التحقق بنجاح","success"); }
      }
      if(action==="save"){
        try{
          const data = serialize(root);
          const key = getKey(root);
          localStorage.setItem(key, JSON.stringify(data));
          lastSaved = JSON.stringify(data);
          dirty=false;
          toast("تم حفظ المسودة","success");
        }catch(e){ toast("تعذر الحفظ","error") }
      }
      if(action==="restore"){
        try{
          const key = getKey(root);
          const raw = localStorage.getItem(key);
          if(!raw){ toast("لا توجد مسودة","error"); return }
          const data = JSON.parse(raw);
          applyData(root,data);
          dirty=false;
          toast("تم الاستعادة","success");
          // إطلاق تغيير لإعادة الحساب (Stage 4)
          root.dispatchEvent(new Event("input",{bubbles:true}));
          root.dispatchEvent(new Event("change",{bubbles:true}));
        }catch(e){ toast("تعذر الاستعادة","error") }
      }
      if(action==="export"){
        try{
          const data = serialize(root);
          const name = (Q("#invoiceNumber",root)?.value || "invoice") + "-draft.json";
          const blob = new Blob([JSON.stringify(data,null,2)], {type:"application/json"});
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
          toast("تم تنزيل JSON","success");
        }catch(e){ toast("تعذر التصدير","error") }
      }
      if(action==="import"){
        const fi = document.getElementById("invoice-import");
        fi.value="";
        fi.onchange = ()=>{
          const f = fi.files?.[0]; if(!f) return;
          const rd = new FileReader();
          rd.onload = ()=>{
            try{
              const data = JSON.parse(String(rd.result||"{}"));
              applyData(root,data);
              dirty=true;
              toast("تم الاستيراد","success");
              root.dispatchEvent(new Event("input",{bubbles:true}));
              root.dispatchEvent(new Event("change",{bubbles:true}));
            }catch(_){ toast("ملف غير صالح","error") }
          };
          rd.readAsText(f);
        };
        fi.click();
      }
    });
  }

  function boot(){
    const grid = document.querySelector(".invoice-grid");
    if(!grid){ const mo=new MutationObserver(()=>{ if(document.querySelector(".invoice-grid")){ mo.disconnect(); wire(document); } }); mo.observe(document.documentElement,{childList:true,subtree:true}); }
    else { wire(document); }
  }

  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();