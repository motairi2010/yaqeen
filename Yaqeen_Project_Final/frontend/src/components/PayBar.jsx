import React from "react";
import { addSale } from "../lib/shift";
import { getPrintMode, printInvoice } from "../lib/print";

const METHODS=[
  {key:"cash",     label:"نقد"},
  {key:"card",     label:"بطاقة"},
  {key:"transfer", label:"تحويل"},
  {key:"wallet",   label:"محفظة"},
];

export default function PayBar({ getCart, totals, onAfterPrint }){
  const [method,setMethod]=React.useState("cash");

  React.useEffect(()=>{
    const onHot=()=>handlePrint();
    window.addEventListener("yaq-print", onHot);
    return ()=> window.removeEventListener("yaq-print", onHot);
  });

  function handlePrint(){
    const cart = typeof getCart==="function" ? (getCart()||[]) : [];
    const gross = totals?.gross || 0;
    addSale(method, gross);
    const mode = getPrintMode();
    const label = (METHODS.find(m=>m.key===method)?.label)||method;
    printInvoice({ mode, cart, totals, paymentMethod: label });
    if(typeof onAfterPrint==="function") onAfterPrint();
  }

  return (
    <div className="paybar">
      <div className="methods">
        {METHODS.map(m=>(
          <button key={m.key}
            className={"btn method " + (method===m.key? "active":"")}
            onClick={()=> setMethod(m.key)}>{m.label}</button>
        ))}
      </div>
      <button className="btn primary" onClick={handlePrint}>طباعة</button>
    </div>
  );
}
