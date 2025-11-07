import React from "react";

/* يعرض رمز ال﷼ كأيقونة من public/RiyalSymbolToken-symbol.svg
   اللون يتبع لون النص عبر mask (يفضّل SVG أحادي اللون). */
export default function RiyalSymbolTokenSymbol({ size = 16, className = "", color = "currentColor", style }) {
  const url = (process.env.PUBLIC_URL || "") + "/RiyalSymbolToken-symbol.svg";
  const s = {
    width: size,
    height: size,
    display: "inline-block",
    verticalAlign: "-0.15em",
    backgroundColor: color,
    WebkitMaskImage: `url(${url})`,
    maskImage: `url(${url})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    ...style,
  };
  return <span className={`RiyalSymbolToken-symbol ${className}`} style={s} aria-hidden="true" />;
}


