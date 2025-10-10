const KEY = "yaq-settings";
const DEF = { printMode: "thermal", theme: "dark" };

export function getSettings(){
  let cur = {};
  try { cur = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  return { ...DEF, ...cur };
}

export function saveSettings(s){
  const next = { ...DEF, ...(s || {}) };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function patchSettings(patch){
  const next = { ...getSettings(), ...(patch || {}) };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
