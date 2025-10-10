import React, { useEffect } from "react";
import "./invoice-pill.css";
import "../styles/invoices.css";
import "../utils/invoice-tweaks";
import "../utils/invoice-print"; // /* invoice-print-stage5 */

export default function Invoices(){
  useEffect(()=>{ document.body.classList.add("page-invoices"); return (<div className="invoice-card"className="invoice-card invoice-page"className="invoice-card invoice-page">)=>document.body.classList.remove("page-invoices"); }, []);
  // attach a CSS scope to BODY for invoice page only
  React.useEffect(() => {
    try { document.body.classList.add("invoice-body"); } catch(e) {}
    return (<div className="invoice-card"className="invoice-card invoice-page"className="invoice-card invoice-page">) => { try { document.body.classList.remove("invoice-body"); } catch(e) {} };
  }, []);
  const [line, setLine] = React.useState({ sku:"", name:"", qty:1, price:"" });
  const qty   = Number(line.qty || 0);
  const price = Number(line.price || 0);
  const total = qty * price;
  const vatRate = 0.15;
  const net = total / (1 + vatRate);
  const vat = total - net;
  const SAR = v => new Intl.NumberFormat("ar-SA",{style:"currency",currency:"SAR"}).format(v||0);

  return (<div className="invoice-card"className="invoice-card invoice-page"className="invoice-card invoice-page">
  <div className="page-invoices invoice-page"className="page-invoices invoice-page"className="page-invoices invoice-page">
    <div className="page-invoices invoice-card"className="page-invoices invoice-card invoice-page"className="page-invoices invoice-card invoice-page" dir="rtl">
      <table className="invoice-lines">
        <thead>
          <tr>
            <th>ط·آ·ط¢آ±ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آµط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾ (ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¦â€™ط·آ¸ط«â€ ط·آ·ط¢آ¯)</th>
            <th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آµط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾</th>
            <th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ·ط¢آ©</th>
            <th>ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ± ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط«â€ ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ·ط¢آ©</th>
            <th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ (ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¶ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ©)</th>
            <th style={{width:80}}></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                className="pill-input"
                placeholder="ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ·ط¢آ­ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¦â€™ط·آ¸ط«â€ ط·آ·ط¢آ¯ ط·آ·ط¢آ£ط·آ¸ط«â€  ط·آ·ط¢آ£ط·آ·ط¢آ¯ط·آ·ط¢آ®ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬طŒ ط·آ¸ط¸آ¹ط·آ·ط¢آ¯ط·آ¸ط«â€ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¹ط·آ·ط¢آ§ (Ctrl+B)"
                value={line.sku}
                onChange={e=> setLine(x=>({...x, sku:e.target.value}))}
              />
            </td>
            <td>
              <input
                className="pill-input"
                placeholder="ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آµط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾"
                value={line.name}
                onChange={e=> setLine(x=>({...x, name:e.target.value}))}
              />
            </td>
            <td>
              <input
                className="pill-input"
                type="number"
                value={line.qty}
                onChange={e=> setLine(x=>({...x, qty:e.target.value}))}
              />
            </td>
            <td>
              <input
                className="pill-input"
                type="number"
                placeholder="0.00"
                value={line.price}
                onChange={e=> setLine(x=>({...x, price:e.target.value}))}
              />
            </td>
            <td>{SAR(total)}</td>
            <td>
              <button className="btn pill danger" onClick={()=> setLine({ sku:"", name:"", qty:1, price:"" })}>
                ط·آ·ط¢آ­ط·آ·ط¢آ°ط·آ¸ط¸آ¾
              </button>
            </td>
          </tr>

          <tr>
            <td colSpan={6}>
              <div className="page-invoices invoice-note"className="page-invoices invoice-note invoice-page"className="page-invoices invoice-note invoice-page">ط·آ¸أ¢â‚¬آ ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ°ط·آ·ط¢آ¬ ط·آ·ط¹آ¾ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ ط·آ¸ط¸آ¾ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ· ط£آ¢أ¢â€ڑآ¬أ¢â‚¬â€Œ ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ·ط¢آ¨ط·آ·ط¢آ·ط·آ¸أ¢â‚¬طŒ ط·آ·ط¢آ¨ط·آ·ط¢آ¨ط·آ¸ط¸آ¹ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط¦â€™ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ­ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ط·آ·ط¢آ© ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ط·آ·ط¢آ­ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬آ¹ط·آ·ط¢آ§.</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="page-invoices invoice-actions"className="page-invoices invoice-actions invoice-page"className="page-invoices invoice-actions invoice-page">
        <button className="btn pill">ط·آ·ط¢آ£ط·آ·ط¢آ¶ط·آ¸ط¸آ¾</button>
        <button className="btn pill primary">ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ¹ط·آ·ط¢آ©</button>
      </div>

      <div className="page-invoices calc-pills"className="page-invoices calc-pills invoice-page"className="page-invoices calc-pills invoice-page">
        <span className="chip">ط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ¨ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¶ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ©: {SAR(net)}</span>
        <span className="chip">ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¶ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ© 15%: {SAR(vat)}</span>
        <span className="chip">ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¶ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ©: {SAR(total)}</span>
      </div>
    </div>
  )</div>);
}


