import React from "react";
import { listInventory } from "../lib/inventory";
const SarFmt = v => (v).toLocaleString("ar-SA",{ minimumFractionDigits:2, maximumFractionDigits:2 });

export default function Inventory(){
  const [rows, setRows] = React.useState(listInventory());
  const [q, setQ] = React.useState("");

  React.useEffect(()=>{
    const h = ()=> setRows(listInventory());
    window.addEventListener("yaqeen:inv-changed", h);
    return ()=> window.removeEventListener("yaqeen:inv-changed", h);
  }, []);

  const filtered = rows.filter(x=>{
    const t = q.trim();
    if(!t) return true;
    return String(x.sku).includes(t) || String(x.name).includes(t);
  });

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <div className="actions" style={{justifyContent:"space-between", marginBottom:10}}>
          <div className="badge">المخزون — {filtered.length} صنف</div>
          <input placeholder="بحث بالباركود/الاسم" value={q} onChange={e=> setQ(e.target.value)}
            style={{minWidth:260, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
        </div>
        <table className="table">
          <thead><tr><th>الباركود</th><th>الصنف</th><th>الكمية المتاحة</th><th>التكلفة المتوسطة</th><th>سعر البيع</th></tr></thead>
          <tbody>
            {filtered.length===0? (
              <tr><td colSpan={5}><div className="badge">لا توجد أصناف.</div></td></tr>
            ) : filtered.map(i=>(
              <tr key={i.sku}>
                <td>{i.sku}</td>
                <td>{i.name}</td>
                <td>{i.qty}</td>
                <td>{SarFmt(i.avgCost)} ﷼</td>
                <td>{SarFmt(i.price)} ﷼</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}









