import React from "react";

/**
 * CurrencySelect
 * يعرض رمز الريال الصحيح بطباعة "ر" واعتماده على خط RialSymbol المربوط على U+0631
 */
export default function CurrencySelect({
  value = "RiyalSymbolToken",
  onChange = () => {},
  className = "",
  lang = "ar",
  allowed
}) {
  const all = [
    { code: "RiyalSymbolToken", label: (lang === "ar" ? "ر <RiyalSymbol showText={true} />" : "ر RiyalSymbolToken"), optionClass: "RiyalSymbolToken-font" },
    { code: "USD", label: "$ USD" },
    { code: "EUR", label: "€ EUR" },
    { code: "GBP", label: "£ GBP" },
    { code: "AED", label: "د.إ AED" }
  ];
  const opts = allowed ? all.filter(o => allowed.includes(o.code)) : all;

  return (
    <select
      dir="rtl"
      className={`currency-ui ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={lang === "ar" ? "العملة" : "Currency"}
    >
      {opts.map(o => (
        <option key={o.code} value={o.code} className={o.optionClass || ""}>
          {o.label}
        </option>
      ))}
    </select>
  );
}



