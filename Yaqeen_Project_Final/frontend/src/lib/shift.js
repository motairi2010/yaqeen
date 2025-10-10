const KEY = "yaq-shift";

function read(){ try{ return JSON.parse(localStorage.getItem(KEY)) || null; }catch{ return null; } }
function write(s){ localStorage.setItem(KEY, JSON.stringify(s)); return s; }

export function getShift(){ return read(); }

export function openShift(openingFloat = 0){
  const now = new Date().toISOString();
  const s = {
    openAt: now,
    openingFloat: Number(openingFloat)||0,
    payments: { cash:0, card:0, transfer:0, wallet:0 },
    sales: [],
    moves: [],         // حركات نقدية يدوية (توريد/مصروف)
    cashIn: 0,
    cashOut: 0,
    isOpen: true
  };
  return write(s);
}

export function ensureShift(){
  let s = read();
  if(!s || !s.isOpen){ s = openShift(0); }
  return s;
}

export function addSale(method, amount){
  const s = ensureShift();
  const m = (method || "cash");
  s.payments[m] = Number(s.payments[m]||0) + (Number(amount)||0);
  s.sales.push({ at:new Date().toISOString(), method:m, amount:Number(amount)||0 });
  write(s);
}

export function addCashIn(amount, note=""){
  const s = ensureShift();
  const a = Number(amount)||0;
  s.cashIn = Number(s.cashIn||0) + a;
  s.moves.push({ type:"in", amount:a, note, at:new Date().toISOString() });
  write(s);
}

export function addCashOut(amount, note=""){
  const s = ensureShift();
  const a = Number(amount)||0;
  s.cashOut = Number(s.cashOut||0) + a;
  s.moves.push({ type:"out", amount:a, note, at:new Date().toISOString() });
  write(s);
}

export function calcSummary(){
  const s = ensureShift();
  const p = s.payments || {};
  const expectedCash =
    (Number(s.openingFloat)||0) +
    (Number(p.cash)||0) +
    (Number(s.cashIn)||0) -
    (Number(s.cashOut)||0);
  return { ...s, expectedCash };
}

export function xReport(){
  return calcSummary();
}

export function closeShift(countedCash = 0){
  const rep = calcSummary();
  const r = {
    ...rep,
    closeAt: new Date().toISOString(),
    countedCash: Number(countedCash)||0,
    isOpen: false
  };
  return write(r);
}
