import React from "react";
export default function Topbar(){
  return (
    <div className="topbar">
      <div className="actions" style={{gap:12, alignItems:"center"}}>
        <div className="badge">فرع: الرئيسي</div>
        <div className="badge">مستخدم: المدير</div>
      </div>
      <div className="search">
        <span>🔎</span>
        <input placeholder="ابحث عن منتج / فاتورة / عميل..." />
      </div>
    </div>
  );
}
