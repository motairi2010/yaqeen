(function(){
  // تنسيق/قراءة أعداد
  const parseNum = (v)=>{ if(v==null) return 0; const s=String(v).replace(/[^\d\.\-]/g,""); const n=parseFloat(s); return isNaN(n)?0:n };
  const fmtMoney = (n,cur)=>{ try{ return new Intl.NumberFormat("ar-SA",{style:"currency",currency:cur||"﷼",minimumFractionDigits:2,maximumFractionDigits:2}).format(n||0) }catch(_){ return (n||0).toFixed(2) } };

  function recalc(root){
    const currencySel = root.querySelector("#currency");
    const currency = currencySel?.value || "﷼";
    const vatRateField = root.querySelector("#vatRate");
    const globalVat = vatRateField ? parseNum(vatRateField.value) : null;

    const table = root.querySelector(".invoice-grid table");
    if(!table) return;
    const body = table.tBodies[0];
    const rows = body ? Array.from(body.rows) : [];

    let subtotal=0, totalVat=0;

    rows.forEach(row=>{
      const qtyEl   = row.querySelector('[data-qty], input[name*="qty"], input[data-type="qty"], td:nth-child(3) input, td:nth-child(3)');
      const priceEl = row.querySelector('[data-price], input[name*="price"], input[data-type="price"], td:nth-child(4) input, td:nth-child(4)');
      const taxEl   = row.querySelector('[data-tax], input[name*="tax"], input[data-type="tax"], td:nth-child(5) input, td:nth-child(5)');
      const totalEl = row.querySelector('[data-total], input[name*="total"], input[data-type="total"], td:nth-child(6) input, td:nth-child(6)');

      const qty   = qtyEl  ? parseNum(qtyEl.value ?? qtyEl.textContent) : 0;
      const price = priceEl? parseNum(priceEl.value ?? priceEl.textContent) : 0;

      let line = qty * price;
      let vat = 0;
      if(taxEl){
        const explicit = parseNum(taxEl.value ?? taxEl.textContent);
        if(explicit>0 && explicit<1) vat = line*explicit;         // كسري (0.15)
        else if(explicit>=1)          vat = line*(explicit/100);  // نسبة (15)
        else if(globalVat!=null)      vat = line*(globalVat/100); // معدل عام
      } else if(globalVat!=null){
        vat = line*(globalVat/100);
      }

      subtotal += line; totalVat += vat;
      const total = line + vat;

      if(totalEl){
        if(totalEl.tagName==="INPUT"){ totalEl.value = total.toFixed(2); }
        else { totalEl.textContent = fmtMoney(total, currency); }
      }
    });

    const discountField = root.querySelector("#discount");
    const discount = discountField ? parseNum(discountField.value) : 0;
    let grand = subtotal + totalVat - discount;
    if(grand < 0) grand = 0;

    const totalEl = root.querySelector("#total, .total-amount");
    if(totalEl){
      if(totalEl.tagName==="INPUT"){ totalEl.value = grand.toFixed(2); }
      else { totalEl.textContent = fmtMoney(grand, currency); }
    }
  }

  function setup(root){
    const grid = root.querySelector(".invoice-grid");
    if(!grid) return;

    // خصائص إدخال للأرقام
    grid.querySelectorAll('input[type="number"], input[data-type="amount"], input.amount').forEach(el=>{
      el.style.direction="ltr"; el.style.textAlign="end";
      el.addEventListener("input", ()=>recalc(root));
      el.addEventListener("blur", ()=>{
        const n = parseNum(el.value);
        if(el.type==="number") { el.value = isNaN(n)? "" : n.toFixed(2); }
        else { el.value = isNaN(n)? "" : n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}); }
      });
    });

    // تغييرات عامة تُعيد الحساب
    grid.querySelectorAll("select, input[type='checkbox']").forEach(el=>{
      el.addEventListener("change", ()=>recalc(root));
    });

    // تنقل الكيبورد داخل الجدول
    const table = grid.querySelector("table");
    if(table){
      table.addEventListener("keydown",(e)=>{
        const t = e.target;
        if(!(t instanceof HTMLElement)) return;
        const cell = t.closest("td"); const row = t.closest("tr");
        if(!cell || !row) return;
        const cells = [...row.cells];
        const ci = cells.indexOf(cell);
        const rows = [...(table.tBodies[0]?.rows || [])];
        const ri = rows.indexOf(row);
        const focusCell=(r,c)=>{
          const R = rows[r]; if(!R) return false;
          const C = R.cells[c]; if(!C) return false;
          const inp = C.querySelector("input,select,textarea");
          if(inp){ inp.focus(); inp.select && inp.select(); return true }
          return false;
        };
        if(e.key==="Enter"){ e.preventDefault(); if(!focusCell(ri,ci+1)) focusCell(ri+1,0); }
        if(e.key==="ArrowRight"){ focusCell(ri,ci+1) }
        if(e.key==="ArrowLeft"){  focusCell(ri,ci-1) }
        if(e.key==="ArrowDown"){  focusCell(ri+1,ci) }
        if(e.key==="ArrowUp"){    focusCell(ri-1,ci) }
      });
    }

    // حساب أولي
    recalc(root);
  }

  // انتظر ظهور .invoice-grid ثم فعّل
  const boot = ()=>{ const g=document.querySelector(".invoice-grid"); if(g){ setup(document); return true } return false };
  if(!boot()){
    const obs=new MutationObserver(()=>{ if(boot()){ obs.disconnect(); } });
    obs.observe(document.documentElement,{subtree:true,childList:true});
  }
})();
