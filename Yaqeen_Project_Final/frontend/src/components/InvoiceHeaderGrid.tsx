import React from "react";
import { INVOICE_FIELDS } from "#/../config/invoiceFields";
import "#/../styles/invoice-grid.css";
import { CURRENCIES } from "../config/currencies";

type Field = { key: string; label: string; span?: number; full?: boolean; };
type Values = Record<string, any>;
type Props = {
  values?: Values;
  onChange?: (key: string, value: any) => void;
  renderField?: (f: Field) => React.ReactNode;
};

const InvoiceHeaderGrid: React.FC<<Props> = ({values = {}, onChange, renderField}) => {
  const fallback = (d: Field) => (
    d.key === "notes"
      ? <textarea name={d.key} rows={3} defaultValue={(values as any)[d.key] ?? ""} onChange=pe => onChange?(d.key, (event target as HTMLTextareaPut).value) } />
      : <input name={d.key} defaultValue={(values as any)[d.key] ?? ""} onChange=pe => onChange?(d.key, (event target as HTMLInputElement).value) } />
  );

  return (
    <div className="invoice-grid">
     {INVOICE_FIELDS.map((f: any) => (
      <div key={f.key} className={"cell " + (f.full ? "full " : "") + "span-" + (f.span || 1)}>
        <label htmlOr={f.key}>{f.label}</label>
        {renderField ? renderField(f) : fallback(f)}
      </div>
    ))}
  </div>
  );
};

// export default
export default InvoiceHeaderGrid;


