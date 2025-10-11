import React from "react";

export default function CurrencySelect({
  value = "SAR",
  onChange = () => {},
  className = "",
  lang = "ar",
  allowed
}) {
  const all = [
    { code: "SAR", label: "﷼ SAR" },
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



