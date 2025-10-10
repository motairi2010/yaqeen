// src/components/MoneyRiyalSymbolTokenParts.jsx
import React from "react";
import { formatSarParts } from "../lib/formatSarParts";

export default function MoneyRiyalSymbolTokenParts({ value, digits = 2, className = "", ...rest }) {
  return (
    <span className={`amount-RiyalSymbolToken ${className}`} {...rest}>
      {formatSarParts(value, { digits })}
    </span>
  );
}



