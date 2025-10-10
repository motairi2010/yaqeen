import QRCode from "qrcode";

/** TLV helper (ZATCA)
 *  Tags: 1-SellerName, 2-VATNumber, 3-Timestamp(ISO8601), 4-TotalWithVAT, 5-VATAmount
 */
function toBytes(str){ return new TextEncoder().encode(String(str)); }
function tlv(tag, value){
  const v = toBytes(value);
  if(v.length > 255) throw new Error("TLV value too long");
  const arr = new Uint8Array(2 + v.length);
  arr[0] = tag; arr[1] = v.length; arr.set(v, 2);
  return arr;
}
export function buildZatcaTLVBase64({ sellerName, vatNumber, timestamp, totalWithVat, vatAmount }){
  const totalStr = Number(totalWithVat ?? 0).toFixed(2);
  const vatStr   = Number(vatAmount   ?? 0).toFixed(2);
  const ts = timestamp || new Date().toISOString();
  const chunks = [
    tlv(1, sellerName || ""),
    tlv(2, vatNumber  || ""),
    tlv(3, ts),
    tlv(4, totalStr),
    tlv(5, vatStr),
  ];
  let len = 0; for(const c of chunks) len += c.length;
  const merged = new Uint8Array(len);
  let o=0; for(const c of chunks){ merged.set(c,o); o+=c.length; }
  // QR content is Base64 of TLV bytes
  return btoa(String.fromCharCode(...merged));
}

export async function makeZatcaQrDataUrl(args){
  const payload = buildZatcaTLVBase64(args);
  return QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 144 });
}

/** UBL/XML (قالب مبسّط — نقطة بداية) */
function xmlEsc(s){ return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

export function buildUBLXml({ invoiceNo, issueDateTime, supplier, items, totals, currency="﷼" }){
  const date = new Date(issueDateTime || Date.now());
  const d = date.toISOString().slice(0,10);      // YYYY-MM-DD
  const t = date.toISOString().slice(11,19);     // HH:MM:SS
  const taxPercent = 15;

  const lines = (items||[]).map((it, idx)=>{
    const qty = Number(it.qty||0);
    const price = Number(it.price||0);
    const lineExt = +(qty * price).toFixed(2);
    return `
  <cac:InvoiceLine>
    <cbc:ID>${idx+1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${lineExt.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>${xmlEsc(it.name || it.sku)}</cbc:Name>
      ${it.sku ? `<cac:SellersItemIdentification><cbc:ID>${xmlEsc(it.sku)}</cbc:ID></cac:SellersItemIdentification>` : ""}
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currency}">${price.toFixed(2)}</cbc:PriceAmount>
      <cbc:BaseQuantity unitCode="EA">1</cbc:BaseQuantity>
    </cac:Price>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currency}">${(lineExt * 0.15).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currency}">${lineExt.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currency}">${(lineExt * 0.15).toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${taxPercent}</cbc:Percent>
          <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
  </cac:InvoiceLine>`;
  }).join("");

  const supplierName = supplier?.name || "";
  const vatNumber = supplier?.vat || "";

  const net  = Number(totals?.net || 0).toFixed(2);
  const tax  = Number(totals?.vat || 0).toFixed(2);
  const gross= Number(totals?.gross || 0).toFixed(2);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${xmlEsc(invoiceNo)}</cbc:ID>
  <cbc:IssueDate>${d}</cbc:IssueDate>
  <cbc:IssueTime>${t}Z</cbc:IssueTime>
  <cbc:InvoiceTypeCode>388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${xmlEsc(supplierName)}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEsc(vatNumber)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${tax}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${net}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${tax}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:Percent>${taxPercent}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${net}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${net}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${gross}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${gross}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  ${lines}
</Invoice>`;
}



