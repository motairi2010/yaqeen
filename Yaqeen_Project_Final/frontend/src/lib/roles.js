import { getSettings } from "./settings";

const KEY = "yaq-user";
export function getUser(){
  try{ return JSON.parse(localStorage.getItem(KEY)||"{}"); } catch { return {}; }
}
export function setUser(u){
  localStorage.setItem(KEY, JSON.stringify(u||{}));
  window.dispatchEvent(new CustomEvent("yaqeen:user-changed"));
  return u||{};
}
/** يسمح: cashier | supervisor | manager */
export function currentRole(){
  const u = getUser();
  return u?.role || "cashier";
}
export function requireManagerPin(){
  const pin = (getSettings().pos?.managerPin) || "1234";
  const x = prompt("أدخل رمز موافقة المدير");
  return x === pin;
}
