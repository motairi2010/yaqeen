import React from "react";
import RiyalSymbol";

export default function MoneyRiyalSymbolToken({ amount = 0, digits = 2, size = 16, className = "" }) {
  const txt = Number(amount ?? 0).toLocaleString("ar-SA", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return <span className={`money ${className}`}><RiyalSymbolSymbol size={size} /> {txt}</span>;
}



