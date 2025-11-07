import React from "react";
/** يعرض رمز ال﷼ باستخدام خط خاص يبدّل حرف "ر" بالرمز داخل هذا العنصر فقط */
export default function RiyalSymbolTokenGlyph({ size = 16, className = "", style }) {
  const s = { fontSize: typeof size === "number" ? `${size}px` : size, ...style };
  return <span className={`RiyalSymbolToken-font RiyalSymbolToken-glyph ${className}`} style={s} aria-label="<RiyalSymbol showText={true} />">ر</span>;
}



