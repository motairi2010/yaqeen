export type DigitStyle = "arab" | "latn";
export type Position = "before" | "after";
const SAR_SIGN = "﷼";
export  = opts || {};
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n as number)) return String(value);
  const locale = digits === "latn" ? "en-US" : "ar-SA";
  const num = new Intl.NumberFormat(locale, { minimumFractionDigits:minFractionDigits, maximumFractionDigits:maxFractionDigits }).format(n as number);
  const space = hardSpace ? "\u00A0" : " ";
  return position === "before" ? `${SAR_SIGN}${space}${num}` : `${num}${space}${SAR_SIGN}`;
}

