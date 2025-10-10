import React, { useEffect, useState } from "react";

export default function BrandLogo({ variant="full", height, scale=1, alt="Yaqeen" }){
  const [theme, setTheme] = useState(document.documentElement.getAttribute("data-theme") || "dark");
  const [fallbackMono, setFallbackMono] = useState(false);

  useEffect(()=>{
    const obs = new MutationObserver(()=> setTheme(document.documentElement.getAttribute("data-theme") || "dark"));
    obs.observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
    return ()=> obs.disconnect();
  }, []);

  const isDark = theme === "dark";
  const base = variant === "mark" ? "logo-mark" : "logo-full-ar";
  const preferred = isDark ? `/brand/${base}-white.png` : `/brand/${base}.png`;
  const altSrc   = `/brand/${base}.png`;

  // الأساس السابق (px): full: 28/36 — mark: 22/26
  const baseH = height ?? (variant==="full" ? (isDark ? 28 : 36) : (isDark ? 22 : 26));
  const h = Math.round(baseH * (scale || 1));

  const cls = "brand-img" + (isDark && fallbackMono ? " brand-img--mono" : "");

  return (
    <img
      className={cls}
      src={fallbackMono ? altSrc : preferred}
      onError={()=> setFallbackMono(true)}
      style={{ height:h, display:"inline-block", verticalAlign:"middle" }}
      alt={alt}
      loading="eager"
    />
  );
}


