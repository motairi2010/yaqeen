import React from "react";

export default function Dashboard(){
  return (
    <div className="grid">
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">مبيعات اليوم</div>
        <div className="value">9,240 ﷼</div>
        <div className="delta" style={{color:"var(--ok)"}}>↑ +14% عن أمس</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">مبيعات هذا الشهر</div>
        <div className="value">182,450 ﷼</div>
        <div className="delta" style={{color:"var(--ok)"}}>↑ +6% عن الشهر الماضي</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">الربح الإجمالي</div>
        <div className="value">53,820 ﷼</div>
        <div className="delta" style={{color:"var(--ok)"}}>هامش 29.5%</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">الأصناف منخفضة المخزون</div>
        <div className="value">23 صنف</div>
        <div className="delta" style={{color:"var(--warning)"}}>بحاجة لإعادة طلب</div>
      </div>
      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="label">مرحبًا بك في يَقين — نظام محاسبي متكامل</div>
        <p>تم إعداد قاعدة البيانات ونظام المصادقة والصفحات الأساسية. استخدم القائمة للتنقل.</p>
      </div>
    </div>
  );
}







