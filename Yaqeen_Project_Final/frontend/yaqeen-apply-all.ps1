
Param(
  [string]$ProjectRoot = "C:\Projects\Yaqeen_Project_Final",
  [string]$Frontend = "",
  [string]$Port = "4545",
  [string]$ApiUrl = "http://localhost:4545",
  [switch]$InstallDeps = $true,
  [switch]$RunDevServer = $true,
  [switch]$SetupMockApi = $false
)

function Fail($msg){ Write-Error $msg; exit 1 }
function Ensure-Dir($p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null } }
function Write-UTF8($path, [string]$content){
  Ensure-Dir (Split-Path $path -Parent)
  $content | Set-Content -Path $path -Encoding UTF8 -Force
  Write-Host "✓ Wrote: $path" -ForegroundColor Green
}

# 0) Resolve frontend path
if([string]::IsNullOrWhiteSpace($Frontend)){
  $Frontend = Join-Path $ProjectRoot "frontend"
}
$pkg = Join-Path $Frontend "package.json"
if(-not (Test-Path $pkg)){
  $candidate = Get-ChildItem -Path $ProjectRoot -Filter package.json -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Directory.Name -eq "frontend" } | Select-Object -First 1
  if($candidate){ $Frontend = $candidate.Directory.FullName; $pkg = $candidate.FullName }
}
if(-not (Test-Path $pkg)){ Fail "لم يتم العثور على package.json داخل مجلد frontend ضمن $ProjectRoot" }

$src = Join-Path $Frontend "src"
$public = Join-Path $Frontend "public"
Ensure-Dir $src; Ensure-Dir $public

# 1) Backup src
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backup = Join-Path $Frontend ("src_backup_"+$stamp)
Copy-Item $src $backup -Recurse -Force
Write-Host "🗂️  Backup created at: $backup" -ForegroundColor Yellow

# 2) .env
$envPath = Join-Path $Frontend ".env"
@"
REACT_APP_API_URL=$ApiUrl
PORT=$Port
"@ | Set-Content -Path $envPath -Encoding UTF8 -Force
Write-Host "✓ Ensured: $envPath" -ForegroundColor Green

# 3) main entry + layout + styling (RTL dark)
Write-UTF8 (Join-Path $src "index.js") @'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./main.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
'@

Write-UTF8 (Join-Path $src "App.js") @'
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import PricingEngine from "./pages/PricingEngine";
import Promotions from "./pages/Promotions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CashManagement from "./pages/CashManagement";
import Accounting from "./pages/Accounting";
import Purchasing from "./pages/Purchasing";
import Returns from "./pages/Returns";

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/pricing" element={<PricingEngine />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/cash-management" element={<CashManagement />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/purchasing" element={<Purchasing />} />
        <Route path="/returns" element={<Returns />} />
      </Routes>
    </DashboardLayout>
  );
}
'@

Ensure-Dir (Join-Path $src "layouts")
Write-UTF8 (Join-Path $src "layouts\DashboardLayout.jsx") @'
import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
export default function DashboardLayout({ children }){
  return (
    <div className="container">
      <aside className="sidebar"><Sidebar/></aside>
      <main className="main">
        <Topbar/>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
'@

Write-UTF8 (Join-Path $src "main.css") @'
@import url("https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap");
:root{--bg:#0f172a;--panel:#0b1220;--muted:#94a3b8;--text:#e2e8f0;--brand:#22c55e;--accent:#38bdf8;--danger:#ef4444;--warning:#f59e0b;--ok:#10b981;--card:#111827;--border:#1f2937}
*{box-sizing:border-box} html{direction:rtl}
body{margin:0;background:var(--bg);color:var(--text);font-family:"Tajawal",system-ui,-apple-system,Segoe UI,Roboto,Arial}
a{color:inherit;text-decoration:none}
.container{display:flex;min-height:100vh;width:100%}
.sidebar{width:260px;background:var(--card);border-left:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh}
.brand{padding:20px;font-weight:700;font-size:20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
.brand .dot{width:10px;height:10px;border-radius:999px;background:var(--brand);display:inline-block}
.nav{padding:12px;display:flex;flex-direction:column;gap:6px;overflow:auto}
.nav a{padding:12px 14px;border-radius:12px;color:var(--muted);border:1px solid transparent}
.nav a.active,.nav a:hover{color:var(--text);background:linear-gradient(90deg,rgba(34,197,94,.15),rgba(56,189,248,.12));border-color:rgba(148,163,184,.15)}
.main{flex:1;display:flex;flex-direction:column;min-width:0}
.topbar{height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:var(--panel);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:10}
.search{display:flex;gap:8px;align-items:center;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:8px 12px;min-width:320px}
.search input{background:transparent;border:none;outline:none;color:var(--text);width:100%}
.content{padding:20px;display:flex;flex-direction:column;gap:20px}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:16px}
.kpi{display:flex;flex-direction:column;gap:6px}.kpi .label{color:var(--muted);font-size:14px}.kpi .value{font-size:28px;font-weight:700}.kpi .delta{font-size:13px}
.badge{font-size:12px;padding:4px 8px;border-radius:999px;border:1px solid var(--border);color:var(--muted)}
.table{width:100%;border-collapse:collapse;font-size:14px}
.table th,.table td{padding:10px 8px;border-bottom:1px solid var(--border);text-align:right}
.table th{color:var(--muted);font-weight:500}
.actions{display:flex;gap:8px}
.btn{padding:10px 14px;border-radius:12px;border:1px solid var(--border);background:var(--panel);color:var(--text);cursor:pointer}
.btn.primary{background:linear-gradient(90deg,var(--brand),var(--accent));border-color:transparent}
@media (max-width:1100px){.sidebar{display:none}.grid{grid-template-columns:repeat(6,1fr)}}
@media (max-width:700px){.grid{grid-template-columns:repeat(2,1fr)}}
'@

# 4) i18n lexicon + helper
Ensure-Dir (Join-Path $src "i18n")
Write-UTF8 (Join-Path $src "i18n\labels.ar.json") @'
{
  "brand": { "suite": "يَقين — جناح التجزئة", "short": "يَقين" },
  "nav": {
    "dashboard": "لوحة التحكم",
    "pos": "الكاشير — يَقين",
    "inventory": "المخزون",
    "products": "المنتجات",
    "suppliers": "المورّدون",
    "customers": "العملاء والولاء",
    "pricing": "التسعير الذكي",
    "promotions": "العروض والكوبونات",
    "reports": "التقارير والتحليلات",
    "settings": "الإعدادات والصلاحيات",
    "cash": "إدارة النقدية",
    "accounting": "المحاسبة (VAT/ZATCA)",
    "purchasing": "المشتريات",
    "returns": "المرتجعات"
  },
  "pos": {
    "quickMode": "وضع بيع سريع — يَقين فاست",
    "finish": "إصدار الفاتورة",
    "discount": "خصم",
    "split": "تقسيم الدفع",
    "xReport": "تقرير X اللحظي",
    "zReport": "تقرير Z لختام الوردية",
    "overridePin": "رمز موافقة المدير"
  },
  "inventory": {
    "lowStock": "أصناف منخفضة المخزون",
    "rop": "نقطة إعادة الطلب (ROP)"
  },
  "accounting": {
    "vat": "ضريبة القيمة المضافة 15%",
    "qr": "رمز QR — ZATCA TLV",
    "ubl": "ملف UBL/XML للفاتورة"
  }
}
'@

Write-UTF8 (Join-Path $src "i18n\labels.en.json") @'
{
  "brand": { "suite": "Yaqeen — Retail Suite", "short": "Yaqeen" },
  "nav": {
    "dashboard": "Dashboard",
    "pos": "Cashier — Yaqeen",
    "inventory": "Inventory",
    "products": "Products",
    "suppliers": "Suppliers",
    "customers": "Customers & Loyalty",
    "pricing": "Smart Pricing",
    "promotions": "Promotions & Coupons",
    "reports": "Reports & Analytics",
    "settings": "Settings & Roles",
    "cash": "Cash Management",
    "accounting": "Accounting (VAT/ZATCA)",
    "purchasing": "Purchasing",
    "returns": "Returns"
  },
  "pos": {
    "quickMode": "Quick Sale — Yaqeen Fast",
    "finish": "Issue Invoice",
    "discount": "Discount",
    "split": "Split Payment",
    "xReport": "X Report",
    "zReport": "Z Report",
    "overridePin": "Manager Approval PIN"
  },
  "inventory": {
    "lowStock": "Low Stock Items",
    "rop": "Reorder Point (ROP)"
  },
  "accounting": {
    "vat": "VAT 15%",
    "qr": "QR — ZATCA TLV",
    "ubl": "UBL/XML Invoice File"
  }
}
'@

Ensure-Dir (Join-Path $src "lib")
Write-UTF8 (Join-Path $src "lib\labels.js") @'
import ar from "../i18n/labels.ar.json";
import en from "../i18n/labels.en.json";
const locales = { ar, en };
let current = "ar";
export function setLocale(l){ if(locales[l]) current = l; }
export function t(key){
  const dict = locales[current] || locales.ar;
  const parts = key.split(".");
  let v = dict;
  for(const p of parts){ v = (v && v[p] !== undefined)? v[p] : null; }
  return (v ?? key);
}
'@

# 5) roles provider (for future role-based navigation)
Write-UTF8 (Join-Path $src "role.js") @'
import React, {createContext, useContext, useState} from "react";
const RoleCtx = createContext();
export function RoleProvider({children}) {
  const [role, setRole] = useState("manager"); // "manager"|"staff"|"warehouse"|"tech"
  return <RoleCtx.Provider value={{role, setRole}}>{children}</RoleCtx.Provider>;
}
export const useRole = ()=> useContext(RoleCtx);
'@

# 6) Sidebar + Topbar using labels
Ensure-Dir (Join-Path $src "components")
Write-UTF8 (Join-Path $src "components\Sidebar.jsx") @'
import React from "react";
import { NavLink } from "react-router-dom";
import { t } from "../lib/labels";

const links = [
  { to: "/dashboard", key: "nav.dashboard" },
  { to: "/pos",       key: "nav.pos" },
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
  { to: "/returns", key: "nav.returns" }
];

export default function Sidebar(){
  return (
    <>
      <div className="brand"><span className="dot" /> {t("brand.suite")}</div>
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
'@

Write-UTF8 (Join-Path $src "components\Topbar.jsx") @'
import React from "react";
import { t } from "../lib/labels";
export default function Topbar(){
  return (
    <div className="topbar">
      <div className="actions" style={{gap:12, alignItems:"center"}}>
        <div className="badge">{t("brand.short")} - فرع: الرئيسي</div>
        <div className="badge">مستخدم: المدير</div>
      </div>
      <div className="search">
        <span>🔎</span>
        <input placeholder="ابحث عن منتج / فاتورة / عميل..." />
      </div>
    </div>
  );
}
'@

# 7) Pages
Ensure-Dir (Join-Path $src "pages")
Write-UTF8 (Join-Path $src "pages\Dashboard.jsx") @'
import React from "react";
export default function Dashboard(){
  return (
    <div className="grid">
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">مبيعات اليوم</div>
        <div className="value">9,240 ر.س</div>
        <div className="delta" style={{color:"var(--ok)"}}>↑ +14% عن أمس</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">مبيعات هذا الشهر</div>
        <div className="value">182,450 ر.س</div>
        <div className="delta" style={{color:"var(--ok)"}}>↑ +6% عن الشهر الماضي</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">الربح الإجمالي</div>
        <div className="value">53,820 ر.س</div>
        <div className="delta" style={{color:"var(--ok)"}}>هامش 29.5%</div>
      </div>
      <div className="card kpi" style={{gridColumn:"span 3"}}>
        <div className="label">الأصناف منخفضة المخزون</div>
        <div className="value">23 صنف</div>
        <div className="delta" style={{color:"var(--warning)"}}>بحاجة لإعادة طلب</div>
      </div>
      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="label">مرحبًا بك في يَقين — واجهة تجزئة غنية</div>
        <p>تم تطبيق الهيكل والـ POS والlexicon والإعدادات الافتراضية. استخدم القائمة للتنقل.</p>
      </div>
    </div>
  );
}
'@

# Functional POS with manager override + split payment
Write-UTF8 (Join-Path $src "pages\POS.jsx") @'
import React, { useMemo, useState } from "react";
import { t } from "../lib/labels";
const CATALOG = [
  { sku:"1001", name:"قهوة عربية 250g", price:28, vat:0.15 },
  { sku:"1002", name:"شاي أسود 100 فتلة", price:16, vat:0.15 },
  { sku:"2001", name:"ماء 330ml", price:2.5, vat:0.15 },
  { sku:"3001", name:"حليب طازج 1L", price:7.5, vat:0.15 },
  { sku:"4001", name:"خبز بر", price:4, vat:0.15 },
  { sku:"5001", name:"تمر سكري 1kg", price:32, vat:0.15 },
];
function SAR(v){ return (v).toLocaleString("ar-SA", { minimumFractionDigits:2, maximumFractionDigits:2 }); }
export default function POS(){
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0); // SAR
  const [method, setMethod] = useState("cash"); // cash | card | wallet | split
  const [split, setSplit] = useState({ cash:0, card:0, wallet:0 });
  const [overridePin, setOverridePin] = useState("");

  const staffMaxDiscount = 0.10; // 10% of total allowed to staff without approval
  const managerPIN = "2468"; // demo only

  const filtered = useMemo(()=>{
    const q = query.trim();
    if(!q) return CATALOG;
    return CATALOG.filter(p => p.name.includes(q) || p.sku.includes(q));
  }, [query]);

  function addToCart(item){
    setCart(prev=>{
      const ix = prev.findIndex(x=>x.sku===item.sku);
      if(ix>=0){ const copy=[...prev]; copy[ix]={...copy[ix], qty: copy[ix].qty+1}; return copy; }
      return [...prev, { ...item, qty: 1 }];
    });
  }
  function changeQty(sku,qty){ setCart(prev=> prev.map(x=> x.sku===sku? {...x, qty: Math.max(1, qty||1)} : x)); }
  function removeItem(sku){ setCart(prev=> prev.filter(x=> x.sku!==sku)); }
  function clearAll(){ setCart([]); setDiscount(0); setSplit({cash:0,card:0,wallet:0}); setMethod("cash"); setOverridePin(""); }

  const subTotal = cart.reduce((s,i)=> s + (i.price*i.qty), 0);
  const vatTotal = cart.reduce((s,i)=> s + (i.price*i.qty*i.vat), 0);
  const totalBefore = subTotal + vatTotal;
  const total = Math.max(0, totalBefore - (Number(discount)||0));

  const maxDiscountAllowed = totalBefore * staffMaxDiscount;
  const discountNeedsApproval = (Number(discount)||0) > maxDiscountAllowed;
  const canFinish = cart.length>0 && (!discountNeedsApproval || overridePin===managerPIN);

  const splitSum = (Number(split.cash)||0) + (Number(split.card)||0) + (Number(split.wallet)||0);
  const splitOk = (method!=="split") || Math.abs(splitSum - total) < 0.01;

  async function finish(){
    if(method==="split" && !splitOk){ alert("مبالغ التقسيم لا تساوي الإجمالي."); return; }
    if(discountNeedsApproval && overridePin!==managerPIN){ alert("الخصم يحتاج موافقة المدير (PIN)."); return; }
    try{
      await fetch((process.env.REACT_APP_API_URL||"") + "/orders", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cart, discount:Number(discount)||0, totals:{ subTotal, vatTotal, total }, method, split })
      });
    }catch(e){}
    alert("تم إصدار الفاتورة ✅");
    clearAll();
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 7"}}>
        <div style={{display:"flex", gap:12, alignItems:"center", marginBottom:12}}>
          <input className="search" style={{minWidth:"unset", width:"100%"}}
            placeholder="ابحث باسم المنتج أو SKU — يدعم ماسح الباركود"
            value={query} onChange={e=>setQuery(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==='Enter' && filtered[0]) addToCart(filtered[0]); }}
          />
          <button className="btn" onClick={()=> setQuery("")}>مسح</button>
        </div>
        <table className="table">
          <thead><tr><th>SKU</th><th>المنتج</th><th>السعر</th><th>ضريبة</th><th>إضافة</th></tr></thead>
          <tbody>
            {filtered.map(p=> (
              <tr key={p.sku}>
                <td>{p.sku}</td><td>{p.name}</td>
                <td>{SAR(p.price)} ر.س</td><td>{Math.round(p.vat*100)}%</td>
                <td><button className="btn" onClick={()=> addToCart(p)}>إضافة</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{gridColumn:"span 5"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h3>السلة</h3>
          <div className="actions">
            <button className="btn" onClick={clearAll}>إفراغ</button>
          </div>
        </div>

        {cart.length===0? <div className="badge" style={{marginTop:8}}>لا توجد عناصر بعد</div> : (
          <table className="table" style={{marginTop:8}}>
            <thead><tr><th>الصنف</th><th>سعر</th><th>كمية</th><th>الإجمالي</th><th></th></tr></thead>
            <tbody>
              {cart.map(item=>{
                const line = item.price*item.qty*(1+item.vat);
                return (
                  <tr key={item.sku}>
                    <td>{item.name}</td>
                    <td>{SAR(item.price)} ر.س</td>
                    <td><input type="number" min="1" style={{width:70, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}
                      value={item.qty} onChange={e=> changeQty(item.sku, parseInt(e.target.value,10))} /></td>
                    <td>{SAR(line)} ر.س</td>
                    <td><button className="btn" onClick={()=> removeItem(item.sku)}>حذف</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="card" style={{marginTop:12}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <div className="badge">الإجمالي قبل الخصم: {SAR(totalBefore)} ر.س</div>
            <div className="badge">الضريبة: {SAR(vatTotal)} ر.س</div>
            <div>
              <label className="label">{t("pos.discount")} (ر.س)</label>
              <input type="number" value={discount} min="0" onChange={e=> setDiscount(e.target.value)}
                style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}} />
              {discountNeedsApproval && <div className="badge" style={{marginTop:6}}>يتطلب موافقة مدير (حد {Math.round(staffMaxDiscount*100)}%)</div>}
            </div>
            <div className="badge">الإجمالي المستحق: {SAR(total)} ر.س</div>
            {discountNeedsApproval && (
              <div>
                <label className="label">{t("pos.overridePin")}</label>
                <input value={overridePin} onChange={e=> setOverridePin(e.target.value)} placeholder="****"
                  style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}} />
              </div>
            )}
            <div>
              <label className="label">طريقة الدفع</label>
              <select value={method} onChange={(e)=> setMethod(e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}>
                <option value="cash">نقدًا</option>
                <option value="card">بطاقة</option>
                <option value="wallet">محفظة رقمية</option>
                <option value="split">تقسيم الدفع</option>
              </select>
            </div>
            {method==="split" && (
              <div style={{gridColumn:"span 2"}}>
                <div className="actions" style={{gap:12}}>
                  <div>نقدًا: <input type="number" value={split.cash} onChange={e=> setSplit({...split, cash:Number(e.target.value)||0})} style={{width:120}}/></div>
                  <div>بطاقة: <input type="number" value={split.card} onChange={e=> setSplit({...split, card:Number(e.target.value)||0})} style={{width:120}}/></div>
                  <div>محفظة: <input type="number" value={split.wallet} onChange={e=> setSplit({...split, wallet:Number(e.target.value)||0})} style={{width:120}}/></div>
                </div>
                <div className="badge" style={{marginTop:6}}>المجموع: {SAR(splitSum)}</div>
              </div>
            )}
          </div>

          <div className="actions" style={{marginTop:12}}>
            <button className="btn primary" disabled={!canFinish || (method==="split" && !splitOk)} onClick={finish}>{t("pos.finish")}</button>
            <button className="btn" onClick={()=> window.print()}>طباعة</button>
          </div>
        </div>
      </div>
    </div>
  );
}
'@

# Other pages (stubs but meaningful)
Write-UTF8 (Join-Path $src "pages\Inventory.jsx") 'export default ()=> <div className="card"><h3>المخزون</h3><p>ROP / تحويلات / تسويات / جرد.</p></div>'
Write-UTF8 (Join-Path $src "pages\Products.jsx") 'export default ()=> <div className="card"><h3>المنتجات</h3><p>كتالوج المنتجات والباركودات والمتغيرات.</p></div>'
Write-UTF8 (Join-Path $src "pages\Suppliers.jsx") 'export default ()=> <div className="card"><h3>المورّدون</h3><p>بطاقات الموردين وشروط الدفع.</p></div>'
Write-UTF8 (Join-Path $src "pages\Customers.jsx") 'export default ()=> <div className="card"><h3>العملاء والولاء</h3><p>نقاط ولاء وطبقات وقسائم.</p></div>'
Write-UTF8 (Join-Path $src "pages\PricingEngine.jsx") 'export default ()=> <div className="card"><h3>التسعير الذكي</h3><p>قواعد Cost+، حد هامش، مطابقات منافسين.</p></div>'
Write-UTF8 (Join-Path $src "pages\Promotions.jsx") 'export default ()=> <div className="card"><h3>العروض والكوبونات</h3><p>حملات، Bundles، شروط متعددة.</p></div>'
Write-UTF8 (Join-Path $src "pages\Reports.jsx") 'export default ()=> <div className="card"><h3>التقارير والتحليلات</h3><p>مبيعات/هامش/دوران/VAT.</p></div>'
Write-UTF8 (Join-Path $src "pages\Settings.jsx") 'export default ()=> <div className="card"><h3>الإعدادات والصلاحيات</h3><p>فروع/مستودعات/أجهزة/أدوار/2FA.</p></div>'
Write-UTF8 (Join-Path $src "pages\CashManagement.jsx") 'export default ()=> <div className="card"><h3>إدارة النقدية</h3><p>Opening/Withdraw/Deposit/X/Z.</p></div>'
Write-UTF8 (Join-Path $src "pages\Accounting.jsx") 'export default ()=> <div className="card"><h3>المحاسبة (VAT/ZATCA)</h3><p>QR TLV / UBL XML / تصدير GL.</p></div>'
Write-UTF8 (Join-Path $src "pages\Purchasing.jsx") 'export default ()=> <div className="card"><h3>المشتريات</h3><p>أوامر شراء من ROP + GRN.</p></div>'
Write-UTF8 (Join-Path $src "pages\Returns.jsx") 'export default ()=> <div className="card"><h3>المرتجعات</h3><p>حدود إرجاع وأسباب وموافقات.</p></div>'

# 8) Settings JSON (public)
$settings = @'
{
  "company": { "name": "متجري", "vat_no": "1234567890", "timezone": "Asia/Riyadh" },
  "vat": { "rate": 0.15, "rounding": "line" },
  "zatca": { "enabled": true, "phase": "phase2", "qr": true, "ubl": true, "archive_days": 365 },
  "pos": {
    "discount_max_staff": 0.10,
    "price_override_requires_approval": true,
    "payment_methods": ["cash","card","wallet","split"],
    "receipt": { "logo": "/logo.png", "show_qr": true, "width": "80mm" }
  },
  "cash": { "opening_required": true, "xz_reports": true, "variance_limit": 10 },
  "inventory": { "valuation": "moving_average", "rop_rule": "14d_avg + leadtime + 20% safety" },
  "purchasing": { "approval_required": true },
  "roles": {
    "manager": ["all"],
    "staff": ["pos.sell","pos.return<=300","inventory.view"],
    "warehouse": ["inventory.adjust","inventory.transfer"],
    "tech": ["settings.devices"]
  }
}
'@
Write-UTF8 (Join-Path $public "retail-settings.json") $settings

# 9) Optional mock API (Express)
if($SetupMockApi){
  $api = Join-Path $ProjectRoot "mock-api"
  Ensure-Dir $api
  @'
{
  "name": "yaqeen-mock-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "dependencies": { "cors": "^2.8.5", "express": "^4.19.2" },
  "scripts": { "start": "node server.js" }
}
'@ | Set-Content (Join-Path $api "package.json") -Encoding UTF8 -Force

  @'
import express from "express";
import cors from "cors";
import fs from "fs";
const app = express();
app.use(cors()); app.use(express.json());
let products = [
  { sku:"1001", name:"قهوة عربية 250g", price:28, vat:0.15 },
  { sku:"1002", name:"شاي أسود 100 فتلة", price:16, vat:0.15 },
  { sku:"2001", name:"ماء 330ml", price:2.5, vat:0.15 },
  { sku:"3001", name:"حليب طازج 1L", price:7.5, vat:0.15 },
  { sku:"4001", name:"خبز بر", price:4, vat:0.15 },
  { sku:"5001", name:"تمر سكري 1kg", price:32, vat:0.15 }
];
app.get("/products", (req,res)=>{
  const q = (req.query.q||"").toString();
  if(!q) return res.json(products);
  const f = products.filter(p=> p.name.includes(q) || p.sku.includes(q));
  res.json(f);
});
app.post("/orders", (req,res)=>{
  const order = req.body||{};
  fs.appendFileSync("orders.log", JSON.stringify({ ts: new Date().toISOString(), order }) + "\n");
  res.json({ ok:true, id: Date.now() });
});
const port = 4545; app.listen(port, ()=> console.log("Mock API on http://localhost:"+port));
'@ | Set-Content (Join-Path $api "server.js") -Encoding UTF8 -Force
  Write-Host "✓ Mock API written to $api" -ForegroundColor Green
}

# 10) Install deps & run
if($InstallDeps){
  Push-Location $Frontend
  try{
    if(Test-Path ".\package-lock.json"){ npm ci } else { npm install }
    npm i react-router-dom recharts
  } catch {
    Write-Warning "تعذّر تثبيت الحزم: $($_.Exception.Message)"
  }
  Pop-Location
}

if($RunDevServer){
  Push-Location $Frontend
  $env:PORT = $Port
  Write-Host "🚀 تشغيل التطبيق على http://localhost:$Port" -ForegroundColor Green
  npm start
  Pop-Location
}

Write-Host "✅ تم تطبيق كل شيء: واجهة غنية + POS + i18n + صفحات إضافية + إعدادات." -ForegroundColor Green
