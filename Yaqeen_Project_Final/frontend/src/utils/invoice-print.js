// @ts-nocheck
(function(){
  if (typeof document === "undefined") return; // SSR-safe

  const ID_TOOLBAR = "print-toolbar";
  const ID_PROFILE = "print-profile-style";
  const LS_KEY     = "invoice.printProfile";

  function ensureStyleEl(){
    let el = document.getElementById(ID_PROFILE);
    if(!el){
      el = document.createElement("style");
      el.id = ID_PROFILE;
      document.head.appendChild(el);
    }
    return el;
  }

  function setPageSize(profile){
    const style = ensureStyleEl();
    const page = profile === "thermal"
      ? "@media print{ @page { size: 80mm auto; margin: 4mm } }"
      : "@media print{ @page { size: A4; margin: 12mm } }";
    style.textContent = page;
  }

  function applyProfile(profile){
    const root = document.querySelector(".invoice-page") || document.body;
    if(profile === "thermal"){ root.classList.add("thermal"); }
    else { root.classList.remove("thermal"); }
    root.setAttribute("data-print", profile);
    setPageSize(profile);
    try{ localStorage.setItem(LS_KEY, profile); }catch(e){}
    const tb = document.getElementById(ID_TOOLBAR);
    if(tb){
      tb.querySelectorAll("button[data-profile]").forEach(b=>{
        b.classList.toggle("active", b.dataset.profile === profile);
      });
    }
  }

  function ensureToolbar(){
    if(document.getElementById(ID_TOOLBAR)) return;
    const tb = document.createElement("div");
    tb.id = ID_TOOLBAR;
    tb.innerHTML = `
      <button type="button" data-profile="a4"      title="وضع A4">A4</button>
      <button type="button" data-profile="thermal" title="وضع 80mm">80mm</button>
      <button type="button" data-action="print"    title="طباعة">🖨️ Print</button>
    `;
    document.body.appendChild(tb);

    tb.addEventListener("click", (e)=>{
      const btn = e.target.closest("button");
      if(!btn) return;
      if(btn.dataset.profile){ applyProfile(btn.dataset.profile); }
      if(btn.dataset.action === "print"){ window.print(); }
    });
  }

  function boot(){
    ensureToolbar();
    let profile = "a4";
    try{ profile = localStorage.getItem(LS_KEY) || "a4"; }catch(e){}
    applyProfile(profile);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  }else{
    boot();
  }
})();