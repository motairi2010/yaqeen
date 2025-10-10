import React from "react";
import { getShift, openShift, xReport, closeShift } from "../lib/shift";

export default function GlobalHotkeys(){
  React.useEffect(()=>{
    const onKey=(e)=>{
      if(e.key==="F9"){ e.preventDefault(); window.dispatchEvent(new CustomEvent("yaq-print")); }
      if(e.key==="F10"){ e.preventDefault(); handleShift(); }
    };
    window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

function handleShift(){
  let s = getShift();
  if(!s || !s.isOpen){
    const f = prompt("فتح وردية — أدخل العهدة الافتتاحية (نقد):","0");
    if(f==null) return;
    openShift(Number(f)||0);
    alert("تم فتح الوردية.");
    return;
  }
  const action = prompt("وردية مفتوحة. اكتب X لطباعة تقرير X، أو Z لإغلاق وطباعة تقرير Z:","X");
  if(!action) return;
  if(action.toUpperCase()==="X"){
    const rep = xReport(); simplePrint("تقرير X (لحظي)", rep);
  }else if(action.toUpperCase()==="Z"){
    const counted = prompt("إغلاق وردية — أدخل النقد المعدود:","0");
    if(counted==null) return;
    const rep = closeShift(Number(counted)||0);
    simplePrint("تقرير Z (إغلاق الوردية)", rep);
  }
}

function simplePrint(title, rep){
  if(!rep) return;
  const css=`@page{size:A4;margin:16mm} body{direction:rtl;font-family:system-ui,"Tajawal",Arial}
  table{width:100%;border-collapse:collapse} th,td{padding:6px 8px;border-bottom:1px solid #ddd;text-align:right}`;
  const fmt=n=> new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(n)||0)+" ﷼";
  const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head>
  <body><h2>${title}</h2>
  <div>افتُتحت: ${rep.openAt||"-"}</div>
  <table><thead><tr><th>طريقة الدفع</th><th>المبلغ</th></tr></thead><tbody>
  <tr><td>نقد</td><td className="amount-RiyalSymbolToken">$<span className="money">{fmt(rep.payments?.cash||0)}</span></td></tr>
  <tr><td>بطاقة</td><td className="amount-RiyalSymbolToken">$<span className="money">{fmt(rep.payments?.card||0)}</span></td></tr>
  <tr><td>تحويل</td><td className="amount-RiyalSymbolToken">$<span className="money">{fmt(rep.payments?.transfer||0)}</span></td></tr>
  <tr><td>محفظة</td><td className="amount-RiyalSymbolToken">$<span className="money">{fmt(rep.payments?.wallet||0)}</span></td></tr>
  </tbody></table>
  <h3>النقد المتوقع: $<span className="money">{fmt(rep.expectedCash||0)}</span></h3>
  ${rep.countedCash!=null? `<h3>النقد المعدود: $<span className="money">{fmt(rep.countedCash||0)}</span></h3><h3>الفرق: $<span className="money">{fmt((rep.countedCash||0)-(rep.expectedCash||0))}</span></h3>`: "" }
  </body></html>`;
  const w=window.open("","_blank","width=800,height=900"); if(!w) return;
  w.document.open(); w.document.write(html); w.document.close();
  setTimeout(()=>{w.print(); w.close();},300);
}





