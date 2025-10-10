import React from "react";
import { t } from "../lib/labels";
import BrandLogo from "./BrandLogo";
import { toggleTheme, getTheme, setTheme } from "../lib/theme";

export default function Topbar(){
  React.useEffect(()=>{ setTheme(getTheme()); },[]);
  const [theme, setLocalTheme] = React.useState(getTheme());
  const flip = () => { toggleTheme(); const th = getTheme(); setLocalTheme(th); };

  return (
    <div className="topbar">
      <div className="actions" style={{gap:12, alignItems:"center"}}>
        {/* ×1.5 */}
        <BrandLogo variant="mark" scale={1.5} />
        <div className="badge">{t("brand.short")} — الفرع: الرئيسي</div>
        <div className="badge">المستخدم الحالي: المدير</div>
      </div>
      <div className="actions" style={{gap:12, alignItems:"center"}}>
        <div className="search">
          <span>🔎</span>
          <input placeholder="ابحث باسم المنتج أو الفاتورة أو العميل..." />
        </div>
        <button className="btn" onClick={flip} title="تبديل الوضع">
          {theme==="dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}


