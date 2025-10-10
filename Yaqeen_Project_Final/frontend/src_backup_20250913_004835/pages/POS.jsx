import React, { useMemo, useState } from "react";

// بيانات منتجات مبدئية في الواجهة (يمكن استبدالها بواجهة API)
const CATALOG = [
  { sku:"1001", name:"قهوة عربية 250g", price:28, vat:0.15 },
  { sku:"1002", name:"شاي أسود 100 فتلة", price:16, vat:0.15 },
  { sku:"2001", name:"ماء 330ml", price:2.5, vat:0.15 },
  { sku:"3001", name:"حليب طازج 1L", price:7.5, vat:0.15 },
  { sku:"4001", name:"خبز بر", price:4, vat:0.15 },
  { sku:"5001", name:"تمر سكري 1kg", price:32, vat:0.15 },
];

function formatCurrency(v){ return (v).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function POS(){
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]); // [{sku, name, price, qty, vat}]
  const [discount, setDiscount] = useState(0); // خصم بالريال
  const [customerPaid, setCustomerPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const filtered = useMemo(()=>{
    const q = query.trim();
    if(!q) return CATALOG;
    return CATALOG.filter(p => p.name.includes(q) || p.sku.includes(q));
  }, [query]);

  function addToCart(item){
    setCart(prev=>{
      const ix = prev.findIndex(x=>x.sku===item.sku);
      if(ix>=0){
        const copy=[...prev]; copy[ix]={...copy[ix], qty: copy[ix].qty+1}; return copy;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }
  function changeQty(sku,qty){
    setCart(prev=> prev.map(x=> x.sku===sku? {...x, qty: Math.max(1, qty||1)} : x));
  }
  function removeItem(sku){
    setCart(prev=> prev.filter(x=> x.sku!==sku));
  }
  function clearCart(){
    setCart([]); setDiscount(0); setCustomerPaid("");
  }

  // المجاميع
  const subTotal = cart.reduce((s,i)=> s + (i.price*i.qty), 0);
  const vatTotal = cart.reduce((s,i)=> s + (i.price*i.qty*i.vat), 0);
  const totalBefore = subTotal + vatTotal;
  const total = Math.max(0, totalBefore - (Number(discount)||0));
  const paid = Number(customerPaid)||0;
  const change = Math.max(0, paid - total);

  async function submitOrder(){
    // إرسال الطلب لواجهة API (اختياري: mock-api المحلي على 4545)
    try{
      const res = await fetch((process.env.REACT_APP_API_URL||"") + "/orders", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ cart, discount:Number(discount)||0, totals:{ subTotal, vatTotal, total }, paymentMethod })
      });
      // في حالة عدم وجود API سيُفشل، نكمل محليًا
    }catch(e){ /* تجاهل في الوضع المبدئي */ }
    alert("تم حفظ الفاتورة مبدئياً ✅");
    clearCart();
  }

  return (
    <div className="grid">
      <div className="card" style={{gridColumn:"span 7"}}>
        <div style={{display:"flex", gap:12, alignItems:"center", marginBottom:12}}>
          <input
            className="search"
            style={{minWidth:"unset", width:"100%"}}
            placeholder="ابحث باسم المنتج أو SKU — يدعم ماسح الباركود"
            value={query}
            onChange={e=>setQuery(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter" && filtered[0]) addToCart(filtered[0]);
            }}
          />
          <button className="btn" onClick={()=> setQuery("")}>مسح</button>
        </div>

        <table className="table">
          <thead>
            <tr><th>SKU</th><th>المنتج</th><th>السعر</th><th>ضريبة</th><th>إضافة</th></tr>
          </thead>
          <tbody>
            {filtered.map(p=> (
              <tr key={p.sku}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{formatCurrency(p.price)} ر.س</td>
                <td>{Math.round(p.vat*100)}%</td>
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
            <button className="btn" onClick={clearCart}>إفراغ</button>
          </div>
        </div>

        {cart.length===0? <div className="badge" style={{marginTop:8}}>لا توجد عناصر بعد</div> : (
          <table className="table" style={{marginTop:8}}>
            <thead>
              <tr><th>الصنف</th><th>سعر</th><th>كمية</th><th>الإجمالي</th><th></th></tr>
            </thead>
            <tbody>
              {cart.map(item=>{
                const line = item.price*item.qty*(1+item.vat);
                return (
                  <tr key={item.sku}>
                    <td>{item.name}</td>
                    <td>{formatCurrency(item.price)} ر.س</td>
                    <td>
                      <input type="number" min="1" style={{width:70, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"4px 6px"}}
                        value={item.qty}
                        onChange={e=> changeQty(item.sku, parseInt(e.target.value,10))}
                      />
                    </td>
                    <td>{formatCurrency(line)} ر.س</td>
                    <td><button className="btn" onClick={()=> removeItem(item.sku)}>حذف</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="card" style={{marginTop:12}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <div className="badge">الإجمالي قبل الخصم: {formatCurrency(totalBefore)} ر.س</div>
            <div className="badge">الضريبة: {formatCurrency(vatTotal)} ر.س</div>
            <div>
              <label className="label">خصم (ر.س)</label>
              <input type="number" value={discount} min="0" onChange={e=> setDiscount(e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}} />
            </div>
            <div className="badge">الإجمالي المستحق: {formatCurrency(total)} ر.س</div>
            <div>
              <label className="label">طريقة الدفع</label>
              <select value={paymentMethod} onChange={(e)=> setPaymentMethod(e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}}>
                <option value="cash">نقدًا</option>
                <option value="card">بطاقة</option>
                <option value="wallet">محفظة رقمية</option>
              </select>
            </div>
            <div>
              <label className="label">المبلغ المدفوع (للعملة النقدية)</label>
              <input type="number" value={customerPaid} min="0" onChange={e=> setCustomerPaid(e.target.value)} style={{width:"100%", background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"}} />
              {paymentMethod==="cash" && <div className="badge" style={{marginTop:6}}>الباقي: {formatCurrency(change)} ر.س</div>}
            </div>
          </div>

          <div className="actions" style={{marginTop:12}}>
            <button className="btn primary" disabled={cart.length===0} onClick={submitOrder}>إنهاء واصدار فاتورة</button>
            <button className="btn" onClick={()=> window.print()}>طباعة</button>
          </div>
        </div>
      </div>
    </div>
  );
}