import ar from "../i18n/labels.ar.json";
import en from "../i18n/labels.en.json";
const locales = { ar, en };
let current = "ar";
export function setLocale(l){ if(locales[l]) current = l; }
export function t(key){
  const dict = locales[current] || locales.ar;
  const parts = key.split(".");
  let v = dict;
  for(const p of parts){ v = (v && v[p] !== undefined)? v[p] : null; }
  return (v ?? key);
}


