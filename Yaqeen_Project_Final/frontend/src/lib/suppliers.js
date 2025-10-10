const SUP_KEY = "yaqeen-suppliers";
function uid(p){ return p + "-" + Date.now().toString(36).toUpperCase(); }

export function getSuppliers(){
  try { const arr = JSON.parse(localStorage.getItem(SUP_KEY) || "[]"); return Array.isArray(arr)? arr : []; }
  catch { return []; }
}
export function setSuppliers(arr){
  localStorage.setItem(SUP_KEY, JSON.stringify(arr||[]));
  return getSuppliers();
}
export function addSupplier({ name, vat="", phone="", terms="" }){
  const all = getSuppliers();
  const s = { id: uid("SUP"), name: name||"مورّد", vat, phone, terms };
  all.push(s);
  setSuppliers(all);
  return s;
}
export function updateSupplier(id, patch){
  const all = getSuppliers().map(s => s.id===id ? { ...s, ...patch } : s);
  setSuppliers(all);
  return all.find(s=> s.id===id);
}
export function deleteSupplier(id){
  const all = getSuppliers().filter(s => s.id!==id);
  setSuppliers(all);
  return all;
}





