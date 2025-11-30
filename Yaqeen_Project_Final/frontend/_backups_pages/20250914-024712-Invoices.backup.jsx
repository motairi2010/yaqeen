import React from "react";
import { listInvoices, findInvoice, exportUBL } from "../lib/invoices";
import { printHtml } from "../lib/printer";
import "../styles/invoices.css";
import "../utils/invoice-tweaks";
import "../../utils/invoice-ux"; // /* invoice-ux-stage6 */

export default function Invoices(){
  const [q, setQ] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [sel, setSel] = React.useState({}); // id -> true
  const [loading, setLoading] = React.useState(false);

  React.useEffect(()=>{ refresh(); }, []);

  function refresh(){
    setLoading(true);
    try{
      setRows(listInvoices({ q, from, to }));
    }finally{
      setLoading(false);
    }
  }

  function toggleAll(e){
    const v = !!e.target.checked;
    const next = {};
    if(v) rows.forEach(r=> next[r.id]=true);
    setSel(next);
  }
  function toggleOne(id, v){ setSel(s=> ({...s, [id]: v})); }

  function reprintOne(id){
    const inv = findInvoice(id);
    if(!inv){ alert("ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط·â€؛ط·آ¸ط¸آ¹ط·آ·ط¢آ± ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ·ط¢آ¯ط·آ·ط¢آ©"); return; }
    const html = renderInvoice(inv);
    printHtml("ط·آ·ط¢آ¥ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ·ط¢آ¯ط·آ·ط¢آ© ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ©", html);
  }

  function downloadXmlOne(id){
    const inv = findInvoice(id);
    if(!inv){ alert("ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط·â€؛ط·آ¸ط¸آ¹ط·آ·ط¢آ± ط·آ¸أ¢â‚¬آ¦ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ¸ط«â€ ط·آ·ط¢آ¯ط·آ·ط¢آ©"); return; }
    const xml = exportUBL(inv);
    downloadBlob(`${id}.xml`, xml, "application/xml");
  }

  function reprintSelected(){
    const ids = Object.keys(sel).filter(k=> sel[k]);
    if(!ids.length){ alert("ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ ط·آ¸ط¸آ¹ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ·ط¢آ¯ ط·آ¸ط¸آ¾ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ·ط¢آ±"); return; }
    ids.forEach(reprintOne);
  }

  function downloadXmlSelected(){
    const ids = Object.keys(sel).filter(k=> sel[k]);
    if(!ids.length){ alert("ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ ط·آ¸ط¸آ¹ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ·ط¢آ¯ ط·آ¸ط¸آ¾ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ·ط¢آ±"); return; }
    ids.forEach(downloadXmlOne); // ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ²ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ ط·آ¸أ¢â‚¬â€چط·آ¸ط¦â€™ط·آ¸أ¢â‚¬â€چ ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ©
  }

  return (<div className="invoice-page"className="invoice-page"className="invoice-page">
    <div className="card"className="card invoice-page"className="card invoice-page">
      <h3 style={{marginTop:0}}>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ·ط¢آ±</h3>

      <div className="grid"className="grid invoice-page"className="grid invoice-page" style={{gap:12, alignItems:"end"}}>
        <div>
          <label className="badge">ط·آ·ط¢آ¨ط·آ·ط¢آ­ط·آ·ط¢آ«</label>
          <input className="pill-input" value={q} onChange={e=> setQ(e.target.value)} placeholder="ط·آ·ط¢آ§ط·آ·ط¢آ¨ط·آ·ط¢آ­ط·آ·ط¢آ« ط·آ·ط¢آ¨ط·آ·ط¢آ±ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ£ط·آ¸ط«â€  ط·آ·ط¢آ§ط·آ·ط¢آ³ط·آ¸أ¢â‚¬آ¦ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¹ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ"
            style={inpStyle}/>
        </div>
        <div>
          <label className="badge">ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬آ  ط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ®</label>
          <input className="pill-input" type="date" value={from} onChange={e=> setFrom(e.target.value)} style={inpStyle}/>
        </div>
        <div>
          <label className="badge">ط·آ·ط¢آ¥ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ° ط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ®</label>
          <input className="pill-input" type="date" value={to} onChange={e=> setTo(e.target.value)} style={inpStyle}/>
        </div>
        <div>
          <button className="btn" onClick={refresh} disabled={loading}>ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ¸ط¸آ¹ط·آ·ط¢آ«</button>
        </div>
        <div style={{marginInlineStart:"auto", display:"flex", gap:8}}>
          <button className="btn" onClick={reprintSelected}>ط¸â€¹ط¹ط›أ¢â‚¬â€œط¢آ¨ط£آ¯ط¢آ¸ط¹ث† ط·آ·ط¢آ¥ط·آ·ط¢آ¹ط·آ·ط¢آ§ط·آ·ط¢آ¯ط·آ·ط¢آ© ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ·ط¢آ¯</button>
          <button className="btn" onClick={downloadXmlSelected}>ط£آ¢ط¢آ¬أ¢â‚¬طŒط£آ¯ط¢آ¸ط¹ث† ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ ط·آ·ط¢آ²ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ UBL (XML) ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ­ط·آ·ط¢آ¯ط·آ·ط¢آ¯</button>
        </div>
      </div>

      <div style={{marginTop:12, overflowX:"auto"}}>
        <table className="invoice-lines" className="invoice-lines" className="table">
          <thead>
            <tr>
              <th><input className="pill-input" type="checkbox" onChange={toggleAll}/></th>
              <th>ط·آ·ط¢آ±ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬آ¦</th>
              <th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ®</th>
              <th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¹ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ</th>
              <th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ (ط·آ·ط¢آ´ط·آ·ط¢آ§ط·آ¸أ¢â‚¬آ¦ط·آ¸أ¢â‚¬â€چ)</th>
              <th>ط·آ·ط¢آ·ط·آ·ط¢آ±ط·آ¸أ¢â‚¬ع‘ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¯ط·آ¸ط¸آ¾ط·آ·ط¢آ¹</th>
              <th>ط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط·إ’ط·آ·ط¢آ§ط·آ·ط¹آ¾</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>{
              const dt = new Date(r.date||r.createdAt||Date.now()).toLocaleString("ar-SA");
              const gross = fmt(r.grossTotal ?? (Number(r.netTotal||0)+Number(r.vatTotal||0)));
              const pay = r.payments || {};
              const pays = ["cash","card","transfer","wallet"].map(k=> pay[k]? `${mapPay(k)}: ${fmt(pay[k])}`:null).filter(Boolean).join("ط·آ·ط¥â€™ ");
              return (<div className="invoice-page"className="invoice-page"className="invoice-page">
                <tr key={r.id}>
                  <td><input className="pill-input" type="checkbox" checked={!!sel[r.id]} onChange={e=>toggleOne(r.id, e.target.checked)}/></td>
                  <td>{r.id}</td>
                  <td>{dt}</td>
                  <td>{r.customerName||"ط£آ¢أ¢â€ڑآ¬أ¢â‚¬â€Œ"}</td>
                  <td>{gross}</td>
                  <td className="muted">{pays||"ط£آ¢أ¢â€ڑآ¬أ¢â‚¬â€Œ"}</td>
                  <td style={{display:"flex", gap:8}}>
                    <button className="btn" onClick={()=>reprintOne(r.id)}>ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ¹ط·آ·ط¢آ©</button>
                    <button className="btn" onClick={()=>downloadXmlOne(r.id)}>UBL/XML</button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr><td colSpan="7" className="muted" style={{textAlign:"center"}}>ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ§ ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ¬ط·آ·ط¢آ¯ ط·آ¸ط¸آ¾ط·آ¸ط«â€ ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط¸آ¹ط·آ·ط¢آ±</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inpStyle = {width:240, background:"transparent", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 8px"};

function fmt(v){ return new Intl.NumberFormat("ar-SA",{style:"currency",currency:"SAR"}).format(Number(v||0)); }
function mapPay(k){ return (<div className="invoice-page"className="invoice-page"className="invoice-page">{cash:"ط·آ¸أ¢â‚¬آ ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ¯",card:"ط·آ·ط¢آ¨ط·آ·ط¢آ·ط·آ·ط¢آ§ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ©",transfer:"ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ¸ط«â€ ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬â€چ",wallet:"ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ­ط·آ¸ط¸آ¾ط·آ·ط¢آ¸ط·آ·ط¢آ©"})[k] || k; }

function downloadBlob(name, content, type="text/plain"){
  const blob = new Blob([content], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// ط·آ·ط¢آ·ط·آ·ط¢آ¨ط·آ·ط¢آ§ط·آ·ط¢آ¹ط·آ·ط¢آ© ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ¨ط·آ·ط¢آ³ط·آ¸ط¸آ¹ط·آ·ط¢آ·ط·آ·ط¢آ© (ط·آ·ط¢آ­ط·آ·ط¢آ±ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¸آ¹/A4) ط£آ¢أ¢â€ڑآ¬أ¢â‚¬â€Œ ط·آ·ط¹آ¾ط·آ·ط¢آ¹ط·آ·ط¹آ¾ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ¯ printHtml
function renderInvoice(inv){
  const esc = (s)=> String(s??"").replace(/[&<>]/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  const items = Array.isArray(inv?.items)? inv.items: [];
  const rows = items.map(it=>`
    <tr>
      <td>${esc(it.name||it.sku||"")}</td>
      <td>${Number(it.qty||1)}</td>
      <td>${Number(it.price||0).toFixed(2)}</td>
      <td>${Number((it.qty||1)*(it.price||0)).toFixed(2)}</td>
    </tr>
  `).join("");

  const net  = Number(inv.netTotal||0).toFixed(2);
  const vat  = Number(inv.vatTotal||0).toFixed(2);
  const gross= Number(inv.grossTotal|| (Number(inv.netTotal||0)+Number(inv.vatTotal||0))).toFixed(2);
  const dt = new Date(inv.date||inv.createdAt||Date.now()).toLocaleString("ar-SA");

  return `
    <div class="wrap">
      <h2 style="margin:0 0 8px 0">ط·آ¸ط¸آ¾ط·آ·ط¢آ§ط·آ·ط¹آ¾ط·آ¸ط«â€ ط·آ·ط¢آ±ط·آ·ط¢آ© ط·آ·ط¢آ±ط·آ¸أ¢â‚¬ع‘ط·آ¸أ¢â‚¬آ¦ ${esc(inv.id||"")}</h2>
      <div class="muted" style="margin-bottom:8px">ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¹آ¾ط·آ·ط¢آ§ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ®: ${dt}</div>
      <table className="invoice-lines" className="invoice-lines">
        <thead><tr><th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آµط·آ¸أ¢â‚¬آ ط·آ¸ط¸آ¾</th><th>ط·آ¸ط¦â€™ط·آ¸أ¢â‚¬آ¦ط·آ¸ط¸آ¹ط·آ·ط¢آ©</th><th>ط·آ·ط¢آ³ط·آ·ط¢آ¹ط·آ·ط¢آ±</th><th>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:10px">
        <div>ط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ ط·آ¸أ¢â‚¬ع‘ط·آ·ط¢آ¨ط·آ¸أ¢â‚¬â€چ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¶ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ©: <b>${net}</b></div>
        <div>ط·آ¸أ¢â‚¬ع‘ط·آ¸ط¸آ¹ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ© ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¶ط·آ·ط¢آ±ط·آ¸ط¸آ¹ط·آ·ط¢آ¨ط·آ·ط¢آ©: <b>${vat}</b></div>
        <div>ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ·ط¢آ¥ط·آ·ط¢آ¬ط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸ط¸آ¹ ط·آ·ط¢آ§ط·آ¸أ¢â‚¬â€چط·آ¸أ¢â‚¬آ¦ط·آ·ط¢آ³ط·آ·ط¹آ¾ط·آ·ط¢آ­ط·آ¸أ¢â‚¬ع‘: <b>${gross}</b></div>
      </div>
    </div>
  `;
}


