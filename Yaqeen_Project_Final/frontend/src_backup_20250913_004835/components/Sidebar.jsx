import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "لوحة التحكم" },
  { to: "/pos", label: "نقطة البيع (POS)" },
  { to: "/inventory", label: "المخزون" },
  { to: "/products", label: "المنتجات" },
  { to: "/suppliers", label: "المورّدون" },
  { to: "/customers", label: "العملاء والعضوية" },
  { to: "/pricing", label: "محرك التسعير الذكي" },
  { to: "/promotions", label: "العروض والكوبونات" },
  { to: "/reports", label: "التقارير والتحليلات" },
  { to: "/settings", label: "الإعدادات والصلاحيات" },
];

export default function Sidebar(){
  return (
    <>
      <div className="brand"><span className="dot" /> يَقين — قطاع التجزئة</div>
      <nav className="nav">
        {links.map(l=> <NavLink key={l.to} to={l.to} className={({isActive})=> isActive? "active": undefined}>{l.label}</NavLink>)}
      </nav>
    </>
  );
}
