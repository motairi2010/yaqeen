export const CURRENCIES = [
  { code: "RiyalSymbolToken", labelAr: "<RiyalSymbol showText={true} />", labelEn: "Saudi Riyal", symbol: "﷼" },
  { code: "USD", labelAr: "دولار أمريكي", labelEn: "US Dollar", symbol: "$" },
  { code: "EUR", labelAr: "يورو",        labelEn: "Euro",       symbol: "€" },
  { code: "GBP", labelAr: "جنيه إسترليني", labelEn: "Pound Sterling", symbol: "£" },
  { code: "AED", labelAr: "درهم إماراتي",  labelEn: "UAE Dirham", symbol: "د.إ" },
  { code: "KWD", labelAr: "دينار كويتي",   labelEn: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "QAR", labelAr: "﷼ قطري",     labelEn: "Qatari Riyal", symbol: "ر.ق" },
  { code: "BHD", labelAr: "دينار بحريني",  labelEn: "Bahraini Dinar", symbol: "د.ب" },
  { code: "OMR", labelAr: "﷼ عُماني",   labelEn: "Omani Rial", symbol: "ر.ع" },
];

// يبني تسميات القائمة. نُخفي رمز RiyalSymbolToken فقط داخل القائمة.
export function getCurrencyOptions({ lang = "ar", hideRiyalSymbolTokenSymbol = true } = {}) {
  return CURRENCIES.map(c => {
    const base = lang === "ar" ? c.labelAr : c.labelEn;
    const withSymbol = c.symbol ? `${c.symbol} ${c.code}` : c.code;
    const label = (c.code === "RiyalSymbolToken" && hideRiyalSymbolTokenSymbol) ? base : withSymbol;
    return { code: c.code, label };
  });
}



