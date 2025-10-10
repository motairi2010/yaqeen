// @ts-nocheck
(function(){
  if (typeof document === "undefined") return;

  const Q  =(s,r=document)=>r.querySelector(s);
  const QA =(s,r=document)=>Array.from(r.querySelectorAll(s));

  function ensureToolbar(){
    let tb = document.getElementById("print-toolbar");
    if(!tb){
      tb = document.createElement("div"); tb.id="print-toolbar";
      tb.style.position="fixed"; tb.style.inset="auto 16px 16px auto"; tb.style.zIndex="9999";
      tb.style.background="#fff"; tb.style.border="1px solid #e5e7eb"; tb.style.borderRadius="10px"; tb.style.padding="8px";
      tb.style.display="flex"; tb.style.gap="8px";
      document.body.appendChild(tb);
    }
    const addBtn=(html)=>{ const t=document.createElement("div"); t.innerHTML=html.trim(); const b=t.firstElementChild; tb.appendChild(b); return b };
    const addSep=()=>{ const s=document.createElement("div"); s.className="sep"; s.style.width="1px"; s.style.background="#e5e7eb"; s.style.margin="0 4px"; tb.appendChild(s) };

    if(!tb.querySelector('button[data-action="row-add"]'))     addBtn('<button class="btn-icon" type="button" data-action="row-add" title="إضافة صف">➕ إضافة صف</button>');
    if(!tb.querySelector('button[data-action="row-dup"]'))     addBtn('<button class="btn-icon" type="button" data-action="row-dup" title="تكرار الصف">📝 تكرار</button>');
    if(!tb.querySelector('button[data-action="row-del"]'))     addBtn('<button class="btn-icon" type="button" data-action="row-del" title="حذف الصف">🗑️ حذف</button>');
    if(!tb.querySelector('.sep.rows')){ const s=addSep(); s.classList.add('rows'); }
    if(!tb.querySelector('button[data-action="toggle-dark"]')) addBtn('<button class="btn-icon" type="button" data-action="toggle-dark" title="وضع داكن">🌙 داكن</button>');
  }

  function cloneRow(row){
    const clone = row.cloneNode(true);
    // تفريغ الحقول
    Array.from(clone.querySelectorAll("input,textarea,select")).forEach(el=>{ if(el.type==="checkbox") el.checked=false; else el.value=""; });
    // تفريغ خلايا بدون inputs
    Array.from(clone.querySelectorAll("td")).forEach(td=>{
      if(!td.querySelector("input,textarea,select")) td.textContent = "";
    });
    return clone;
  }

  function addRowAfter(targetRow){
    const row = targetRow || document.querySelector(".invoice-grid table tbody tr:last-child");
    if(!row){ return false }
    const clone = cloneRow(row);
    row.parentNode.insertBefore(clone, row.nextSibling);
    const inp = clone.querySelector("input,textarea,select"); if(inp){ inp.focus(); inp.select && inp.select(); }
    document.dispatchEvent(new Event("input",{bubbles:true}));
    document.dispatchEvent(new Event("change",{bubbles:true}));
    return true;
  }

  function dupRow(targetRow){
    if(!targetRow) return false;
    const clone = targetRow.cloneNode(true);
    targetRow.parentNode.insertBefore(clone, targetRow.nextSibling);
    const inp = clone.querySelector("input,textarea,select"); if(inp){ inp.focus(); inp.select && inp.select(); }
    document.dispatchEvent(new Event("input",{bubbles:true}));
    document.dispatchEvent(new Event("change",{bubbles:true}));
    return true;
  }

  function delRow(targetRow){
    const tbody = document.querySelector(".invoice-grid table tbody");
    if(!tbody) return false;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    if(rows.length<=1) return false; // اترك صف واحد
    const r = targetRow || rows[rows.length-1];
    r.remove();
    document.dispatchEvent(new Event("input",{bubbles:true}));
    document.dispatchEvent(new Event("change",{bubbles:true}));
    return true;
  }

  function currentRow(){
    const el = document.activeElement;
    return el ? el.closest("tr") : null;
  }

  function wireRowControls(){
    ensureToolbar();
    const tb = document.getElementById("print-toolbar");
    tb.addEventListener("click",(e)=>{
      const btn = e.target.closest("button[data-action]");
      if(!btn) return;
      const act = btn.dataset.action;
      if(act==="row-add") addRowAfter(currentRow() || document.querySelector(".invoice-grid table tbody tr:last-child"));
      if(act==="row-dup") dupRow(currentRow() || document.querySelector(".invoice-grid table tbody tr:last-child"));
      if(act==="row-del") delRow(currentRow());
      if(act==="toggle-dark"){ document.documentElement.classList.toggle("dark"); }
    });

    // اختصارات
    document.addEventListener("keydown",(e)=>{
      if(e.ctrlKey && e.key==="Enter"){ e.preventDefault(); addRowAfter(currentRow()); }
      if(e.ctrlKey && (e.key==="d" || e.key==="D")){ e.preventDefault(); dupRow(currentRow()); }
      if(e.ctrlKey && (e.key==="Backspace" || e.key==="Delete")){ e.preventDefault(); delRow(currentRow()); }
    });
  }

  function applyStatusBadge(){
    const root = document.querySelector(".invoice-page") || document.body;
    let badge = root.querySelector(".status-badge");
    if(!badge){ badge = document.createElement("div"); badge.className="status-badge"; root.appendChild(badge); }
    const statusEl = document.getElementById("status");
    const text = statusEl?.value || "";
    const st = text.toLowerCase();
    badge.textContent = text || "—";
    badge.classList.remove("paid","draft","issued","cancelled");
    if(st.includes("paid") || st.includes("مدفو")) badge.classList.add("paid");
    else if(st.includes("draft") || st.includes("مسود")) badge.classList.add("draft");
    else if(st.includes("issue") || st.includes("مصد")) badge.classList.add("issued");
    else if(st.includes("cancel") || st.includes("ملغ")) badge.classList.add("cancelled");
  }

  function applyPaidStampOnPrint(){
    let stamp = document.getElementById("paid-stamp");
    if(!stamp){ stamp = document.createElement("div"); stamp.id="paid-stamp"; stamp.className="paid-stamp"; stamp.textContent="مدفوعة / PAID"; document.body.appendChild(stamp); }
    const text = document.getElementById("status")?.value || "";
    const isPaid = text.toLowerCase().includes("paid") || text.includes("مدفو");
    stamp.style.display = isPaid ? "block" : "none";
    window.addEventListener("beforeprint", ()=>{ stamp.style.display = isPaid ? "block" : "none"; });
    window.addEventListener("afterprint",  ()=>{ stamp.style.display = "none"; });
  }

  function boot(){
    wireRowControls();
    applyStatusBadge();
    applyPaidStampOnPrint();
    const status = document.getElementById("status");
    if(status){
      status.addEventListener("change", ()=>{
        applyStatusBadge();
        applyPaidStampOnPrint();
      });
    }
  }

  if(document.readyState==="loading"){ document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();