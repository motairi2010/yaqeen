import { getSettings } from "./settings";
/** يدعم EAN-13 بنمط وزن: prefix + item + weight */
export function parseWeightedBarcode(code){
  try{
    const s = (code||"").toString();
    const cfg = getSettings().pos?.weightBarcode||{};
    if(!cfg.enabled) return null;
    if(!s.startsWith(cfg.prefix||"23")) return null;
    const itemPart = s.slice((cfg.prefix||"23").length, 12 - (cfg.weightDigits||5));
    const wPart = s.slice(12 - (cfg.weightDigits||5), 12);
    const weight = Number(wPart)/Number(cfg.divisor||1000);
    return { sku: itemPart, weight: weight };
  }catch{ return null; }
}
