const KEY = "yaq-audit";
export function logEvent(type, payload){
  try{
    const rec = { type, at: new Date().toISOString(), payload: payload||{} };
    const a = JSON.parse(localStorage.getItem(KEY)||"[]"); a.unshift(rec);
    localStorage.setItem(KEY, JSON.stringify(a.slice(0,2000)));
  }catch{}
}
