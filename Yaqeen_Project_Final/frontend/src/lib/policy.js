import { getSettings, patchSettings } from "./settings";

/* سياسة افتراضية للأدوار */
export const DEFAULT_POLICY = {
  cashier:    { addManualItem:false, changePrice:false, discountPercentMax:10,  cashIn:false, cashOut:false, closeShift:false, reprint:true },
  supervisor: { addManualItem:true,  changePrice:true,  discountPercentMax:20,  cashIn:true,  cashOut:true,  closeShift:false, reprint:true },
  manager:    { addManualItem:true,  changePrice:true,  discountPercentMax:100, cashIn:true,  cashOut:true,  closeShift:true,  reprint:true }
};

export function getPolicy(){
  try { return JSON.parse(localStorage.getItem("yaq-policy")||"{}"); }
  catch { return {}; }
}
export function savePolicy(p){
  localStorage.setItem("yaq-policy", JSON.stringify(p||{}));
}

export function getCurrentUser(){
  try { return JSON.parse(localStorage.getItem("yaq-user")||'{"name":"المدير","role":"manager"}'); }
  catch { return { name:"المدير", role:"manager" }; }
}

/** فحص سماحية إجراء ما */
export function can(action, {role} = getCurrentUser()){
  const p = getPolicy();
  const merged = { ...(DEFAULT_POLICY[role||"cashier"]||{}), ...(p[role||"cashier"]||{}) };
  if(action === "discountPercentMax") return merged.discountPercentMax ?? 0;
  return !!merged[action];
}

/** إدارة PIN */
export function verifyPin(pin){
  const s = getSettings();
  const pins = s.pins || { manager:"0000", supervisor:"1111" };
  pin = String(pin||"");
  return pin && (pin === pins.manager || pin === pins.supervisor);
}
export function setPin(role, pin){
  const s = getSettings();
  const pins = { manager:"0000", supervisor:"1111", ...(s.pins||{}) };
  pins[role] = String(pin||"");
  patchSettings({ pins });
  return pins;
}

/** طلب موافقة سريعة */
export function requireApproval(reason=""){
  const msg = `مطلوب موافقة ${reason? "("+reason+")" : ""}\nأدخل PIN المدير/المشرف:`;
  const pin = window.prompt(msg);
  const ok  = verifyPin(pin);
  if(!ok) alert("تم إلغاء العملية (PIN غير صحيح).");
  return ok;
}
