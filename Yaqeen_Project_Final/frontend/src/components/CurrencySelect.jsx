import React from "react";

/**
 * CurrencySelect
 * يعرض رمز الريال الصحيح بطباعة "ر" واعتماده على خط RialSymbol المربوط على U+0631
 */
export default function CurrencySelect({
  value = "SAR",
  onChange = () => {},
  className = "",
  lang = "ar",
  allowed
}) {
  const all = [
    { code: "SAR", label: (lang === "ar" ? "ر.س (SAR)" : "SAR ر.س") },
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
      style={{ width: "100%", padding: "10px", border: "1px solid #e5e7eb", borderRadius: "10px" }}
    >
      {opts.map(o => (
        <option key={o.code} value={o.code} className={o.optionClass || ""}>
          {o.label}
        </option>
      ))}
    </select>
  );
}



