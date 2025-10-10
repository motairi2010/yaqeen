const INV_KEY = "yaqeen-inventory";
function emit(){ window.dispatchEvent(new CustomEvent("yaqeen:inv-changed")); }

export function getInventoryMap(){
  try { const obj = JSON.parse(localStorage.getItem(INV_KEY) || "{}"); return obj && typeof obj === "object" ? obj : {}; }
  catch { return {}; }
}
export function setInventoryMap(map){
  localStorage.setItem(INV_KEY, JSON.stringify(map||{}));
  emit();
  return map;
}
export function listInventory(){
  const map = getInventoryMap();
  return Object.values(map).sort((a,b)=> String(a.sku).localeCompare(String(b.sku), "ar"));
}

/** أدخل/حدّث صنفًا في المخزون */
export function upsertItem({ sku, name, price=0, avgCost=0, qty=0 }){
  if(!sku) return;
  const map = getInventoryMap();
  const cur = map[sku] || { sku, name: name||"غير مسمّى", price: Number(price)||0, avgCost: Number(avgCost)||0, qty: Number(qty)||0 };
  map[sku] = { ...cur, name: name ?? cur.name, price: Number(price ?? cur.price)||0, avgCost: Number(avgCost ?? cur.avgCost)||0, qty: Number(qty ?? cur.qty)||0 };
  setInventoryMap(map);
  return map[sku];
}

/** استلام أصناف (يُحدّث الكمية والتكلفة المتوسطة). التكاليف المُدخلة بدون ضريبة. */
export function receiveItems(lines){
  const map = getInventoryMap();
  for(const ln of (lines||[])){
    const sku = String(ln.sku||"").trim(); if(!sku) continue;
    const name = ln.name || (map[sku]?.name) || "غير مسمّى";
    const unitCost = Number(ln.cost)||0;             // قبل الضريبة
    const qty = Math.max(0, Number(ln.qty)||0);
    const oldQty = Number(map[sku]?.qty||0);
    const oldAvg = Number(map[sku]?.avgCost||0);
    const newQty = oldQty + qty;
    const newAvg = newQty>0 ? ((oldQty*oldAvg + qty*unitCost)/newQty) : unitCost;
    map[sku] = {
      sku, name,
      price: Number(map[sku]?.price||0),             // سعر بيع (إن وُجد)
      avgCost: Number(newAvg.toFixed(4)),
      qty: newQty
    };
  }
  setInventoryMap(map);
  return listInventory();
}


