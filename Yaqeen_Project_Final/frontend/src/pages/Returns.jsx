import React, { useState } from "react";
const toNum=(v,d=0)=>{ const n=Number(v); return Number.isFinite(n)?n:d; };
const SarFmt = v => (v).toLocaleString("ar-SA",{minimumFractionDigits:2, maximumFractionDigits:2});

export default function Returns(){
  const [rows, setRows] = useState([]);
  const [src, setSrc] = useState("");

  const addManual = ()=> setRows(r=>[...r,{ sku:"", name:"", qty:1, price:0, vat:0.15 }]);
  const setVal = (i,k,v)=> setRows(r=> r.map((x,ix)=> ix===i? {...x, [k]: (k==="qty"||k==="price")? toNum(v,0): v}: x));
  const remove = i => setRows(r=> r.filter((_,ix)=> ix!==i));

  const net = rows.reduce((s,i)=> s + (i.price*i.qty), 0);
  const vat = rows.reduce((s,i)=> s + (i.price*i.qty*(i.vat??0.15)), 0);
  const total = net + vat;

  return (
    <div className="card" style={{gridColumn:"span 12"}}>
      <h3 style={{marginTop:0}}>مرتجعات</h3>
      <div className="actions" style={{marginBottom:10}}>
        <input placeholder="ابحث برقم الفاتورة (اختياري)" value={src} onChange={e=>setSrc(e.target.value)}
          style={{minWidth:260,background:"transparent",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,padding:"6px 8px"}}/>
        <button className="btn" onClick={()=>alert("سيتم ربط البحث بالـAPI لاحقًا")}>بحث</button>
        <button className="btn" onClick={addManual}>إضافة بند يدوي</button>
      </div>

      <table className="table">
        <thead><tr><th>الباركود</th><th>الوصف</th><th>الكمية (سالبة)</th><th>سعر الوحدة</th><th>الإجمالي</th><th></th></tr></thead>
        <tbody>
          {rows.length===0 ? <tr><td colSpan={6}><div className="badge">لا توجد بنود مرتجعة.</div></td></tr> :
            rows.map((r,i)=>{
              const line = r.qty * r.price;
              return (
                <tr key={i}>
                  <td><input value={r.sku} onChange={e=>setVal(i,"sku",e.target.value)}
                    style={{width:"100%",background:"transparent",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 6px"}}/></td>
                  <td><input value={r.name} onChange={e=>setVal(i,"name",e.target.value)}
                    style={{width:"100%",background:"transparent",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 6px"}}/></td>
                  <td><input type="number" step="1" value={r.qty} onChange={e=>setVal(i,"qty",toNum(e.target.value,0))}
                    style={{width:90,background:"transparent",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 6px"}}/></td>
                  <td><input type="number" step="0.01" value={r.price} onChange={e=>setVal(i,"price",toNum(e.target.value,0))}
                    style={{width:130,background:"transparent",color:"var(--text)",border:"1px solid var(--border)",borderRadius:8,padding:"4px 6px"}}/></td>
                  <td>{SarFmt(line)} ﷼</td>
                  <td><button className="btn" onClick={()=>remove(i)}>حذف</button></td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="card" style={{marginTop:12}}>
        <div className="badge">إجمالي قبل الضريبة: {SarFmt(net)} ﷼</div>
        <div className="badge amount-RiyalSymbolToken">الضريبة (15%): {SarFmt(vat)} ﷼</div>
        <div className="badge">الإجمالي: {SarFmt(total)} ﷼</div>
        <div className="actions" style={{marginTop:10}}>
          <button className="btn primary" onClick={()=>alert("سيتم حفظ مرتجعات الفاتورة لاحقًا عبر الـAPI")}>حفظ المرتجع</button>
        </div>
      </div>
    </div>
  );
}











