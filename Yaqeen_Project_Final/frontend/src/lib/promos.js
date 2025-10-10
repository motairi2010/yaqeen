const KEY_PROMOS = "yaq-promos";

function loadPromos(){
  try{ return JSON.parse(localStorage.getItem(KEY_PROMOS) || "[]"); }catch{ return []; }
}
function savePromos(arr){
  localStorage.setItem(KEY_PROMOS, JSON.stringify(arr||[]));
}

function genId(){ return "P"+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function isActiveNow(p){
  if(p.active === false) return false;
  const now = Date.now();
  const st = p.startAt? Date.parse(p.startAt) : null;
  const en = p.endAt?   Date.parse(p.endAt)   : null;
  if(st && now < st) return false;
  if(en && now > en) return false;
  return true;
}

export function listPromos(){ return loadPromos(); }
export function upsertPromo(p){
  const arr = loadPromos();
  if(!p.id){ p.id = genId(); }
  const i = arr.findIndex(x=> x.id===p.id);
  if(i>=0) arr[i] = {...arr[i], ...p}; else arr.push(p);
  savePromos(arr);
  return p;
}
export function removePromo(id){
  savePromos(loadPromos().filter(p=> p.id!==id));
}
export function togglePromo(id, active){
  const arr = loadPromos();
  const i = arr.findIndex(p=> p.id===id);
  if(i<0) return;
  arr[i].active = !!active;
  savePromos(arr);
}

/*
  cart: [{sku,name,price,qty,vat?}]
  ctx:  { coupon?: "CODE" }
  return { discount, lines:[{index,sku,discount,reason}], appliedCoupons:[], messages:[] }
*/
export function evaluatePromotions(cart, ctx={}){
  const promos  = loadPromos().filter(isActiveNow);
  const items   = Array.isArray(cart)? cart.map(x=>({...x, price:Number(x.price)||0, qty:Math.max(1,Number(x.qty)||1)})) : [];
  const subtotal = items.reduce((s,i)=> s + i.price*i.qty, 0);

  let running = subtotal;
  let discount = 0;
  const lines = [];
  const messages = [];
  const appliedCoupons = [];

  function addDisc(d, reason, index=-1, sku=null){
    const v = Math.max(0, Number(d)||0);
    discount += v; running = Math.max(0, running - v);
    lines.push({index, sku, discount:v, reason});
  }

  for(const p of promos){
    switch(p.type){
      case "skuPercent": {
        const fs = (p.skus||"").split(",").map(s=> s.trim()).filter(Boolean);
        const pct = Math.max(0, Number(p.percent)||0)/100;
        if(pct<=0 || !fs.length) break;
        items.forEach((it,ix)=>{
          if(fs.includes(String(it.sku))){
            const d = it.price*it.qty*pct;
            if(d>0) addDisc(d, "خصم نسبة على الصنف", ix, it.sku);
          }
        });
        break;
      }
      case "basketPercentThreshold": {
        const th  = Math.max(0, Number(p.threshold)||0);
        const pct = Math.max(0, Number(p.percent)||0)/100;
        if(running >= th && pct>0){
          const d = running*pct; // على المتبقي بعد خصومات البنود
          addDisc(d, "خصم سلة عند حد معيّن");
        }
        break;
      }
      case "buyXgetY": {
        const sku = String(p.sku||"").trim();
        const x   = Math.max(1, Number(p.xQty)||0);
        const y   = Math.max(1, Number(p.yQty)||0);
        if(!sku || x<=0 || y<=0) break;
        const ix  = items.findIndex(i=> String(i.sku)===sku);
        if(ix>=0){
          const it = items[ix];
          const grp = x + y;
          const freeUnits = Math.floor(it.qty / grp) * y; // أبسط قاعدة: كل مجموعة x+y تمنح y مجانا
          const d = freeUnits * it.price;
          if(d>0) addDisc(d, "اشترِ X واحصل على Y مجانًا", ix, sku);
        }
        break;
      }
      case "couponPercent": {
        const code = String(p.code||"").trim().toUpperCase();
        const input = String(ctx.coupon||"").trim().toUpperCase();
        const min   = Math.max(0, Number(p.minBasket)||0);
        const pct   = Math.max(0, Number(p.percent)||0)/100;
        if(code && input && code===input && running>=min && pct>0){
          const d = running*pct;
          addDisc(d, "كوبون نسبة على السلّة");
          appliedCoupons.push(code);
        }
        break;
      }
      default: break;
    }
  }

  return {
    subtotal,
    discount: Math.min(discount, subtotal),
    netAfterDiscount: Math.max(0, subtotal - Math.min(discount, subtotal)),
    lines, messages, appliedCoupons
  };
}


