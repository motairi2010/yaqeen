// src/components/InvoiceHeaderGrid.jsx
import React from "react";
import { INVOICE_FIELDS } from "../config/invoiceFields";
import "../styles/invoice-grid.css";

export default function InvoiceHeaderGrid({ values = {}, onChange }) {
  const get = (k) => (values && values[k] != null ? values[k] : "");
  const set = (k) => (e) => { if (onChange) onChange(k, e.target.value); };

  const renderField = (f) => {
    const val = get(f.key);

    // ملاحظة: <option> ما تدعم صور، لذا نعرض الرمز كنص داخل القائمة
    if (f.key === "currency") {
      return (
        <select id={f.key} name={f.key} value={val || "\uFDFC"} onChange={set(f.key)}>
          <option value="\uFDFC">{"\uFDFC"}</option>
          <option value="USD $">{"USD $"}</option>
          <option value={"EUR \u20AC"}>{"EUR \u20AC"}</option>
        </select>
      );
    }

    if (f.key === "vat") {
      return (
        <input
          id={f.key}
          name={f.key}
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={val === "" ? 15 : val}
          onChange={(e)=>{ if (onChange) onChange("vat", e.target.value.replace(",", ".")); }}
        />
      );
    }

    if (f.key === "invoiceDate" || f.key === "dueDate") {
      return <input id={f.key} name={f.key} type="date" value={val} onChange={set(f.key)} />;
    }

    if (f.key === "notes") {
      return <textarea id={f.key} name={f.key} rows={3} value={val} onChange={set(f.key)} />;
    }

    return <input id={f.key} name={f.key} type="text" value={val} onChange={set(f.key)} />;
  };

  return (
    <div className="invoice-grid">
      {INVOICE_FIELDS.map((f) => (
        <div key={f.key} className={`cell ${f.full ? "full" : ""} span-${f.span || 1}`}>
          <label htmlFor={f.key}>{f.label}</label>
          {renderField(f)}
        </div>
      ))}
    </div>
  );
}
