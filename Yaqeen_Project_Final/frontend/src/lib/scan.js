export function parseScan(str){
  const s = String(str||"").trim();
  const m = s.match(/^(\d+)\*(.+)$/);
  return m? { qty: Math.max(1, Number(m[1])||1), sku: m[2].trim() } : { qty: 1, sku: s };
}
export function mergeIntoCart(cart, item){
  const list = Array.isArray(cart)? cart.slice() : [];
  const idx = list.findIndex(x=> String(x.sku)===String(item.sku));
  if(idx>=0){
    const o = list[idx];
    list[idx] = { ...o, qty: Number(o.qty||0) + Number(item.qty||1) };
  }else{
    list.push({ ...item, qty: Number(item.qty||1) });
  }
  return list;
}
export function beep(ok=true){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type="sine"; o.frequency.value = ok? 880 : 220;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime+0.01);
    o.start();
    setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.12); o.stop(ctx.currentTime+0.14); }, 120);
  }catch(e){}
}


