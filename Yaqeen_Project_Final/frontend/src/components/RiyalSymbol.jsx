import React from 'react';

export default function RiyalSymbol({ amount, digits = 2, size = 16, className = "", showText = false }) {
  if (showText) {
    return <span className={className}>﷼</span>;
  }

  const value = amount !== undefined
    ? Number(amount ?? 0).toLocaleString("ar-SA", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      })
    : null;

  return (
    <span className={`riyal-symbol ${className}`} style={{ fontSize: size }}>
      {value && <span className="riyal-amount">{value} </span>}
      <span className="riyal-currency">﷼</span>
    </span>
  );
}
