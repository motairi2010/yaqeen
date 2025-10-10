import React from "react";
import RiyalSymbolTokenUrl from "../assets/RiyalSymbolToken.svg"; // <-- هنا مكان الرمز

/** يلوّن الرمز بـ currentColor ويعمل كـ mask */
export default function RiyalSymbolTokenIcon({ size = 16, className = "", style }) {
  const s = {
    "--RiyalSymbolToken-size": typeof size === "number" ? `${size}px` : size,
    backgroundColor: "currentColor",
    WebkitMaskImage: `url(${RiyalSymbolTokenUrl})`,
    maskImage: `url(${RiyalSymbolTokenUrl})`,
    ...style,
  };
  return <span className={`RiyalSymbolToken-icon ${className}`} style={s} aria-hidden="true" />;
}


