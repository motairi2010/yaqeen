import { formatSar } from "../lib/formatSar";
import React from "react";
import { listPromos, upsertPromo, removePromo, togglePromo, evaluatePromotions } from "../lib/promos";

const TYPES = [
  {value:"skuPercent", label:"خصم نسبة على أصناف (SKUs)"},
  {value:"basketPercentThreshold", label:"خصم نسبة عند حد سلة معيّن"},
  {value:"buyXgetY", label:"اشترِ X واحصل Y مجانًا"},
  {value:"couponPercent", label:"كوبون نسبة على السلّة"},
];

export default function Promotions(){
  const [rows, setRows] = React.useState(()=> listPromos());
  const [form, setForm] = React.useState({ id:"", name:"", type:"skuPercent", active:true, percent:"", skus:"", threshold:"", sku:"", xQty:"", yQty:"", code:"", minBasket:"", startAt:"", endAt:"" });

  // محاكي بسيط
  const [simItems, setSimItems] = React.useState([{sku:"1001", name:"صنف تجريبي", price:10, qty:3}]);
  const [simCoupon, setSimCoupon] = React.useState("");
  const sim = React.useMemo(()=> evaluatePromotions(simItems, {coupon:simCoupon}), [simItems, simCoupon]);

  function refresh(){ setRows(listPromos()); }
  function reset(){ setForm({ id:"", name:"", type:"skuPercent", active:true, percent:"", skus:"", threshold:"", sku:"", xQty:"", yQty:"", code:"", minBasket:"", startAt:"", endAt:"" }); }

  function save(){
    if(!form.name){ alert("ضع اسماً للعرض"); return; }
    // تحويل أرقام
    const payload = {...form};
    ["percent","threshold","xQty","yQty","minBasket"].forEach(k=>{
      if(payload[k]!=="" && payload[k]!==null && payload[k]!==undefined){
        payload[k] = Number(payload[k]);
      }
    });
    upsertPromo(payload);
    reset(); refresh();
  }
  function edit(p){ setForm({...p}); }
  function del(id){ if(confirm("حذف العرض؟")){ removePromo(id); refresh(); } }
  function toggle(p){ togglePromo(p.id, !p.active); refresh(); }

  function addSimRow(){ setSimItems(a=> [...a, {sku:"", name:"", price:0, qty:1}]); }
  function onSimChange(ix, key, val){
    setSimItems(a=>{
      const b = a.slice();
      b[ix] = {...b[ix], [key]: key==="qty"||key==="price"? Number(val||0) : val};
      return b;
    });
  }
  function removeSimRow(ix){
    setSimItems(a=> a.filter((_,i)=> i!==ix));
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>إنشاء/تعديل عرض ترويجي</h3>

        <div className="actions" style={{gap:12, alignItems:"center", flexWrap:"wrap"}}>
          <input placeholder="اسم العرض" value={form.name} onChange={e=> setForm(s=>({...s, name:e.target.value}))}
            style={{width:220, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>

          <select value={form.type} onChange={e=> setForm(s=>({...s, type:e.target.value}))}
            style={{width:240, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}>
            {TYPES.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <label className="badge">نشط؟</label>
          <input type="checkbox" checked={!!form.active} onChange={e=> setForm(s=>({...s, active:e.target.checked}))}/>
        </div>

        {/* حقول ديناميكية حسب النوع */}
        {form.type==="skuPercent" && (
          <div className="actions" style={{gap:12, marginTop:12, flexWrap:"wrap"}}>
            <input placeholder="SKUs مفصولة بفواصل، مثال: 1001,1002" value={form.skus} onChange={e=> setForm(s=>({...s, skus:e.target.value}))}
              style={{width:360, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <input type="number" placeholder="نسبة الخصم %" value={form.percent} onChange={e=> setForm(s=>({...s, percent:e.target.value}))}
              style={{width:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          </div>
        )}

        {form.type==="basketPercentThreshold" && (
          <div className="actions" style={{gap:12, marginTop:12, flexWrap:"wrap"}}>
            <input type="number" placeholder="حد السلة (﷼)" value={form.threshold} onChange={e=> setForm(s=>({...s, threshold:e.target.value}))}
              style={{width:180, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <input type="number" placeholder="نسبة الخصم %" value={form.percent} onChange={e=> setForm(s=>({...s, percent:e.target.value}))}
              style={{width:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          </div>
        )}

        {form.type==="buyXgetY" && (
          <div className="actions" style={{gap:12, marginTop:12, flexWrap:"wrap"}}>
            <input placeholder="SKU المستهدف" value={form.sku} onChange={e=> setForm(s=>({...s, sku:e.target.value}))}
              style={{width:200, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <input type="number" placeholder="X" value={form.xQty} onChange={e=> setForm(s=>({...s, xQty:e.target.value}))}
              style={{width:100, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <input type="number" placeholder="Y" value={form.yQty} onChange={e=> setForm(s=>({...s, yQty:e.target.value}))}
              style={{width:100, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          </div>
        )}

        {form.type==="couponPercent" && (
          <div className="actions" style={{gap:12, marginTop:12, flexWrap:"wrap"}}>
            <input placeholder="رمز الكوبون" value={form.code} onChange={e=> setForm(s=>({...s, code:e.target.value}))}
              style={{width:180, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <input type="number" placeholder="نسبة الخصم %" value={form.percent} onChange={e=> setForm(s=>({...s, percent:e.target.value}))}
              style={{width:160, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
            <input type="number" placeholder="حد أدنى للسلة (اختياري)" value={form.minBasket} onChange={e=> setForm(s=>({...s, minBasket:e.target.value}))}
              style={{width:200, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          </div>
        )}

        <div className="actions" style={{gap:12, marginTop:12, flexWrap:"wrap"}}>
          <label className="badge">تاريخ البداية</label>
          <input type="date" value={form.startAt||""} onChange={e=> setForm(s=>({...s, startAt:e.target.value}))}/>
          <label className="badge">تاريخ النهاية</label>
          <input type="date" value={form.endAt||""} onChange={e=> setForm(s=>({...s, endAt:e.target.value}))}/>
        </div>

        <div className="actions" style={{gap:12, marginTop:12}}>
          <button className="btn primary" onClick={save}>{form.id? "حفظ التعديل":"إضافة العرض"}</button>
          {form.id && <button className="btn" onClick={reset}>إلغاء</button>}
        </div>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>العروض الحالية</h3>
        <table className="table">
          <thead><tr><th>الاسم</th><th>النوع</th><th>المدى</th><th>الحالة</th><th>إجراءات</th></tr></thead>
          <tbody>
            {rows.map(p=>(
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{TYPES.find(t=> t.value===p.type)?.label || p.type}</td>
                <td>{(p.startAt||"—")+" → "+(p.endAt||"—")}</td>
                <td>{p.active!==false? "نشط":"موقوف"}</td>
                <td className="actions" style={{gap:8}}>
                  <button className="btn" onClick={()=> edit(p)}>تعديل</button>
                  <button className="btn" onClick={()=> toggle(p)}>{p.active!==false? "إيقاف":"تفعيل"}</button>
                  <button className="btn" onClick={()=> removePromo(p.id) || window.setTimeout(refresh,50)}>حذف</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={5}>لا توجد عروض بعد.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{gridColumn:"span 12"}}>
        <h3 style={{marginTop:0}}>محاكاة سريعة</h3>
        <div className="actions" style={{gap:12, alignItems:"center", flexWrap:"wrap"}}>
          <label className="badge">كوبون (اختياري)</label>
          <input placeholder="COUPON2025" value={simCoupon} onChange={e=> setSimCoupon(e.target.value)}
            style={{width:180, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/>
          <button className="btn" onClick={addSimRow}>+ بند تجريبي</button>
        </div>
        <table className="table">
          <thead><tr><th>SKU</th><th>الاسم</th><th>السعر</th><th>الكمية</th><th></th></tr></thead>
          <tbody>
            {simItems.map((r,ix)=>(
              <tr key={ix}>
                <td><input value={r.sku} onChange={e=> onSimChange(ix,"sku",e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                <td><input value={r.name} onChange={e=> onSimChange(ix,"name",e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                <td><input type="number" value={r.price} onChange={e=> onSimChange(ix,"price",e.target.value)} style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                <td><input type="number" value={r.qty} onChange={e=> onSimChange(ix,"qty",e.target.value)} style={{width:120, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}/></td>
                <td><button className="btn" onClick={()=> removeSimRow(ix)}>حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid" style={{gridTemplateColumns:"repeat(12,1fr)", gap:12}}>
          <div className="card" style={{gridColumn:"span 4"}}><div className="label">إجمالي أصلي</div><div className="value"><span className="money">{fmt(sim.subtotal)}</span></div></div>
          <div className="card" style={{gridColumn:"span 4"}}><div className="label">إجمالي الخصم</div><div className="value" style={{color:"var(--ok)"}}>-<span className="money">{fmt(sim.discount)}</span></div></div>
          <div className="card" style={{gridColumn:"span 4"}}><div className="label">الصافي بعد الخصم</div><div className="value"><span className="money">{fmt(sim.netAfterDiscount)}</span></div></div>
        </div>
        <p className="muted">تفاصيل البنود المخفّضة تظهر فقط بعد إضافة عروض فعّالة مطابقة.</p>
      </div>
    </div>
  );
}

function fmt(v){ return formatSar(Number(v||0)); }








