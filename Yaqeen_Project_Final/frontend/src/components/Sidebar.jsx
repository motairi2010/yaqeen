import React from "react";
import { NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { t } from "../lib/labels";

const links = [ { to: "/invoices",  key: "nav.invoices" },
  { to: "/dashboard", key: "nav.dashboard" },
  { to: "/pos",       key: "nav.pos" },
  { to: "/sales",     key: "nav.sales" },
  { to: "/inventory", key: "nav.inventory" },
  { to: "/products",  key: "nav.products" },
  { to: "/suppliers", key: "nav.suppliers" },
  { to: "/customers", key: "nav.customers" },
  { to: "/pricing",   key: "nav.pricing" },
  { to: "/promotions",key: "nav.promotions" },
  { to: "/reports",   key: "nav.reports" },
  { to: "/settings",  key: "nav.settings" },
  { to: "/cash-management", key: "nav.cash" },
  { to: "/accounting", key: "nav.accounting" },
  { to: "/purchasing", key: "nav.purchasing" },
  { to: "/returns",    key: "nav.returns" }
];

export default function Sidebar(){
  return (
    <>
      <div className="brand">
        <BrandLogo/>
      </div>
      <nav className="nav">
        {links.map((l)=>(
          <NavLink key={l.to} to={l.to} className={({isActive})=> isActive? "active": undefined}>
            {t(l.key)}
          </NavLink>
        ))}
      </nav>
    </>
  );
}




