import React from "react";

export default function CurrencySelect({
  value = "SAR",
  onChange = () => {},
  className = "",
  lang = "ar",
  allowed
}) {
  const all = [
    { code: "SAR", label: "﷼" },
    { code: "USD", label: "$ دولار" },
    { code: "EUR", label: "€ يورو" },
    { code: "GBP", label: "£ جنيه" },
    { code: "AED", label: "د.إ درهم" }
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
        <option key={o.code} value={o.code}>
          {o.label}
        </option>
      ))}
    </select>
  );
}



