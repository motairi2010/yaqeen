// src/pages/Invoices.jsx
import React from "react";
import InvoiceHeaderGrid from "../components/InvoiceHeaderGrid";
import "../styles/invoice-grid.css";
import "../styles/invoices.css";

const initialHeader = {
  customer: "",
  branch: "",
  currency: "SAR",
  vat: 15,
  invoiceNumber: "",
  invoiceDate: "",
  dueDate: "",
  paymentTerms: "",
  paymentMethod: "",
  warehouse: "",
  notes: ""
};

export default function Invoices() {
  const [header, setHeader] = React.useState(initialHeader);
  const [items, setItems] = React.useState([{ description: "", qty: 1, price: 0 }]);

  const setH = (k, v) => setHeader((old) => ({ ...old, [k]: v }));

  const renderField = (f) => {
    const common = {
      id: f.key, name: f.key,
      value: header[f.key] ?? "",
      onChange: (e) => setH(f.key, e.target.value)
    };
    if (f.key === "notes") return <textarea {...common} rows={3} />;
    if (f.key === "invoiceDate" || f.key === "dueDate") return <input {...common} type="date" />;
    if (f.key === "currency") {
      return (
        <select {...common} style={{fontFamily: 'Arial, "Segoe UI Symbol", "Noto Sans Symbols", sans-serif', fontSize: '16px'}}>
          <option value="SAR">﷼ ريال</option>
          <option value="USD">$ دولار</option>
          <option value="EUR">€ يورو</option>
        </select>
      );
    }
    if (f.key === "paymentMethod") {
      return (
        <select {...common}>
          <option value="">{'\u0627\u062e\u062a\u0631'}</option>
          <option value="cash">{'\u0646\u0642\u062f\u064a'}</option>
          <option value="card">{'\u0628\u0637\u0627\u0642\u0629'}</option>
          <option value="bank">{'\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a'}</option>
        </select>
      );
    }
    if (f.key === "vat") {
      return (
        <input {...common} type="number" min="0" max="100" step="0.01"
               onChange={(e) => setH("vat", e.target.value.replace(",", "."))} />
      );
    }
    return <input {...common} type="text" />;
  };

  const addItem = () => setItems((list) => [...list, { description: "", qty: 1, price: 0 }]);
  const removeItem = (idx) => setItems((list) => list.filter((_, i) => i !== idx));
  const setItem = (idx, key, val) =>
    setItems((list) =>
      list.map((row, i) =>
        i === idx ? { ...row, [key]: key === "description" ? val : (val + "").replace(",", ".") } : row
      )
    );

  const subtotal   = React.useMemo(() => items.reduce((s, r) => s + (parseFloat(r.qty)||0) * (parseFloat(r.price)||0), 0), [items]);
  const vatPct     = parseFloat(header.vat) || 0;
  const vatAmount  = (subtotal * vatPct) / 100;
  const grandTotal = subtotal + vatAmount;
  const fmt = (n) => new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(isFinite(n) ? n : 0);

  const onSave  = (e) => { e.preventDefault(); const payload = { header, items, totals: { subtotal, vatPct, vatAmount, grandTotal } };
    console.log("Saving invoice payload:", payload);
    alert("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 (\u062A\u062C\u0631\u064A\u0628\u064A).");
  };
  const onPrint = () => window.print();
  const onCancel = () => { if (window.history && typeof window.history.back === "function") window.history.back(); };

  return (
    <div className="invoice-page" dir="rtl" style={{ padding: 16 }}>
      <h1 style={{ textAlign: "right", marginBottom: 8 }}>
        {'\u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629'}
      </h1>

      <form onSubmit={onSave}>
        <h2 style={{ textAlign: "right", margin: "12px 0" }}>
          {'\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629'}
        </h2>
        <InvoiceHeaderGrid values={header} onChange={setH} renderField={renderField} />

        <h2 style={{ textAlign: "right", margin: "24px 0 8px" }}>
          {'\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0639\u0645\u064A\u0644'}
        </h2>
        <div style={{ display: "flex", gap: 12, maxWidth: 520 }}>
          <input
            placeholder={'\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0639\u0645\u064A\u0644'}
            value={header.customer}
            onChange={(e) => setH("customer", e.target.value)}
            style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
          />
          <button type="button" onClick={() => alert("\u0625\u0636\u0627\u0641\u0629 \u0639\u0645\u064A\u0644 \u062C\u062F\u064A\u062F (\u062A\u062C\u0631\u064A\u0628\u064A)")}
                  style={{ padding: "10px 14px", borderRadius: 10 }}>
            {'\u0625\u0636\u0627\u0641\u0629 \u0639\u0645\u064A\u0644 \u062C\u062F\u064A\u062F'}
          </button>
        </div>

        <h2 style={{ textAlign: "right", margin: "24px 0 8px" }}>
          {'\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0633\u0644\u0639/\u0627\u0644\u062E\u062F\u0645\u0627\u062A'}
        </h2>

        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 720 }}>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr auto", gap: 8, fontWeight: 700, marginBottom: 8 }}>
              <div style={{ textAlign: "right" }} className="amount-sar">{'\u0627\u0644\u0648\u0635\u0641'}</div>
              <div style={{ textAlign: "right" }} className="amount-sar">{'\u0627\u0644\u0643\u0645\u064A\u0629'}</div>
              <div style={{ textAlign: "right" }} className="amount-sar">{'\u0627\u0644\u0633\u0639\u0631'}</div>
              <div style={{ textAlign: "right" }} className="amount-sar">{'\u0627\u0644\u0645\u062C\u0645\u0648\u0639'}</div>
              <div />
            </div>

            {items.map((row, idx) => {
              const lineTotal = (parseFloat(row.qty) || 0) * (parseFloat(row.price) || 0);
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                  <input
                    placeholder={'\u0627\u0644\u0648\u0635\u0641'}
                    value={row.description}
                    onChange={(e) => setItem(idx, "description", e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                  />
                  <input
                    type="number" step="0.01" min="0"
                    value={row.qty}
                    onChange={(e) => setItem(idx, "qty", e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                  />
                  <input
                    type="number" step="0.01" min="0"
                    value={row.price}
                    onChange={(e) => setItem(idx, "price", e.target.value)}
                    style={{ padding: 10, borderRadius: 10, border: "1px solid #e5e7eb" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                    <span className="money">{fmt(lineTotal)}</span> <RiyalSymbol style={{ marginInlineStart: 6 }} />
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} style={{ padding: "8px 12px", borderRadius: 10 }}>
                    {'\u062D\u0630\u0641'}
                  </button>
                </div>
              );
            })}

            <button type="button" onClick={addItem} style={{ padding: "10px 14px", borderRadius: 10, marginTop: 6 }}>
              {'\u0625\u0636\u0627\u0641\u0629 \u0633\u0637\u0631'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "grid", gap: 6, maxWidth: 420, marginInlineStart: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="amount-sar">{'\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0642\u0628\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629'}</span>
            <strong><span className="money">{fmt(subtotal)}</span> <RiyalSymbol style={{ marginInlineStart: 6 }} /></strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="amount-sar">{'\u0627\u0644\u0636\u0631\u064A\u0628\u0629 '} <span className="money">{fmt(vatPct)}</span>{'%'}</span>
            <strong><span className="money">{fmt(vatAmount)}</span> <RiyalSymbol style={{ marginInlineStart: 6 }} /></strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18 }}>
            <span className="amount-sar">{'\u0627\u0644\u0645\u062C\u0645\u0648\u0639:'}</span>
            <strong><span className="money">{fmt(grandTotal)}</span> <RiyalSymbol style={{ marginInlineStart: 6 }} /></strong>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="submit" onClick={onSave}   style={{ padding: "10px 14px", borderRadius: 10 }}>{'\u062D\u0641\u0638 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629'}</button>
          <button type="button" onClick={onPrint}  style={{ padding: "10px 14px", borderRadius: 10 }}>{'\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629'}</button>
          <button type="button" onClick={onCancel} style={{ padding: "10px 14px", borderRadius: 10 }}>{'\u0625\u0644\u063A\u0627\u0621'}</button>
        </div>
      </form>
    </div>
  );
}





















