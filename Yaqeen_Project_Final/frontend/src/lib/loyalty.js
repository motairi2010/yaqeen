const KEY_CFG = "yaq-loyalty";
const KEY_CUS = "yaq-customers";

export const defaultConfig = {
  earnRate: 1,        // 1 نقطة لكل 1 ﷼ (على صافي الفاتورة)
  valuePerPoint: 0.01,// كل نقطة = 0.01 ﷼ (1%)
  minRedeem: 100      // أقل نقاط للاستبدال
};

export function getLoyaltyConfig(){
  try{
    const x = JSON.parse(localStorage.getItem(KEY_CFG) || "{}");
    return {...defaultConfig, ...x};
  }catch{ return defaultConfig; }
}
export function setLoyaltyConfig(partial){
  const cur = getLoyaltyConfig();
  localStorage.setItem(KEY_CFG, JSON.stringify({...cur, ...partial}));
}

function loadCustomers(){
  try{ return JSON.parse(localStorage.getItem(KEY_CUS) || "[]"); }catch{ return []; }
}
function saveCustomers(arr){
  localStorage.setItem(KEY_CUS, JSON.stringify(arr||[]));
}

function genId(){ return "C"+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

export function listCustomers(){ return loadCustomers(); }

export function findCustomerByMobile(mobile){
  if(!mobile) return null;
  const arr = loadCustomers();
  return arr.find(c => (c.mobile||"").trim() === String(mobile).trim()) || null;
}

export function upsertCustomer({id, name, mobile}){
  const arr = loadCustomers();
  if(id){
    const ix = arr.findIndex(c=> c.id===id);
    if(ix>=0){ arr[ix] = {...arr[ix], name, mobile}; }
    else { arr.push({id, name, mobile, points: Number(0)}); }
  }else{
    id = genId();
    arr.push({id, name, mobile, points: Number(0)});
  }
  saveCustomers(arr);
  return arr.find(c=> c.id===id);
}

export function getCustomerById(id){
  return loadCustomers().find(c=> c.id===id) || null;
}

export function getPoints(id){
  const c = getCustomerById(id);
  return Number(c?.points||0);
}

export function addPoints(id, pts){
  const arr = loadCustomers();
  const i = arr.findIndex(c=> c.id===id);
  if(i<0) return;
  arr[i].points = Math.max(0, Number(arr[i].points||0) + Math.floor(Number(pts)||0));
  saveCustomers(arr);
}

export function consumePoints(id, pts){
  const arr = loadCustomers();
  const i = arr.findIndex(c=> c.id===id);
  if(i<0) return 0;
  const take = Math.min(Math.floor(Number(pts)||0), Number(arr[i].points||0));
  arr[i].points = Math.max(0, Number(arr[i].points||0) - take);
  saveCustomers(arr);
  return take;
}

export function estimateEarn(net){
  const {earnRate} = getLoyaltyConfig();
  return Math.max(0, Math.floor((Number(net)||0) * Number(earnRate||0)));
}

export function pointsToValue(points){
  const {valuePerPoint} = getLoyaltyConfig();
  return (Number(points)||0) * Number(valuePerPoint||0);
}

export function valueToPoints(value){
  const {valuePerPoint} = getLoyaltyConfig();
  if(!valuePerPoint) return 0;
  return Math.max(0, Math.floor(Number(value||0) / Number(valuePerPoint)));
}

