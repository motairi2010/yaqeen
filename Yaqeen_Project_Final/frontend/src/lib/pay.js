import { getSettings, patchSettings } from "./settings";

const labels = { cash:"نقد", card:"بطاقة", bank:"تحويل", wallet:"محفظة" };
const order = ["cash","card","bank","wallet"];

function ensureOverlay(){
  let el = document.getElementById("yaq-pay-overlay");
  if(el) return el;
  el = document.createElement("div");
  el.id = "yaq-pay-overlay";
  el.style.cssText = "position:fixed;bottom:12px;left:12px;z-index:99999;display:flex;gap:8px;direction:rtl";
  document.body.appendChild(el);
  return el;
}
function render(){
  const s = getSettings();
  const cur = s.pos?.defaultMethod || "cash";
  const enabled = (s.pos?.paymentMethods||order).filter(k=> order.includes(k));
  const el = ensureOverlay();
  el.innerHTML = ""; // reset
  for(const k of enabled){
    const b = document.createElement("button");
    b.textContent = labels[k] || k;
    b.className = "btn";
    b.style.cssText = "padding:8px 12px;border-radius:10px;border:1px solid var(--border);background:var(--panel);color:var(--text);opacity:"+(k===cur?1:0.65);
    b.onclick = ()=> { patchSettings({ pos:{ defaultMethod:k }}); render(); };
    el.appendChild(b);
  }
}
render();
window.addEventListener("yaqeen:settings-changed", render);

// اختصارات Alt+1..4
window.addEventListener("keydown", (e)=>{
  if(!e.altKey) return;
  const map = { "1":"cash", "2":"card", "3":"bank", "4":"wallet" };
  const k = map[e.key];
  if(!k) return;
  const s = getSettings();
  if(!(s.pos?.paymentMethods||order).includes(k)) return;
  patchSettings({ pos:{ defaultMethod:k }});
});


