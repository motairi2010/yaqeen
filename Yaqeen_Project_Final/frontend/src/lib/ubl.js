export function buildInvoiceUBL(inv){
  const id = inv?.id || ("INV-"+Date.now());
  const issueDate = (inv?.at ? new Date(inv.at) : new Date()).toISOString().slice(0,10);
  const lines = Array.isArray(inv?.lines)? inv.lines : [];
  const sellerName = inv?.seller?.name || "Yaqeen Seller";
  const sellerVAT = inv?.seller?.vat  || "300000000000003";
  const currency = "﷼";
  const sum = (a, s)=> (a||[]).reduce((t,x)=> t + (s? s(x): (Number(x)||0)), 0);
  const net  = inv?.net  ?? sum(lines, x=> Number(x.price||0)*Number(x.qty||1));
  const vat  = inv?.vat  ?? (net * 0.15);
  const gross= inv?.gross?? (net + vat);

  function esc(s){ return (s??"").toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  let xml = '';
  xml += '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"';
  xml += ' xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"';
  xml += ' xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">';
  xml += '<cbc:ID>'+esc(id)+'</cbc:ID>';
  xml += '<cbc:IssueDate>'+esc(issueDate)+'</cbc:IssueDate>';
  xml += '<cbc:DocumentCurrencyCode>'+currency+'</cbc:DocumentCurrencyCode>';
  xml += '<cac:AccountingSupplierParty><cac:Party><cac:PartyName><cbc:Name>'+esc(sellerName)+'</cbc:Name></cac:PartyName>';
  xml += '<cac:PartyTaxScheme><cbc:CompanyID>'+esc(sellerVAT)+'</cbc:CompanyID></cac:PartyTaxScheme>';
  xml += '</cac:Party></cac:AccountingSupplierParty>';
  xml += '<cac:LegalMonetaryTotal>';
  xml += '<cbc:LineExtensionAmount currencyID="'+currency+'">'+net.toFixed(2)+'</cbc:LineExtensionAmount>';
  xml += '<cbc:TaxExclusiveAmount currencyID="'+currency+'">'+net.toFixed(2)+'</cbc:TaxExclusiveAmount>';
  xml += '<cbc:TaxInclusiveAmount currencyID="'+currency+'">'+gross.toFixed(2)+'</cbc:TaxInclusiveAmount>';
  xml += '<cbc:PayableAmount currencyID="'+currency+'">'+gross.toFixed(2)+'</cbc:PayableAmount>';
  xml += '</cac:LegalMonetaryTotal>';
  for(let i=0;i<lines.length;i++){
    const L = lines[i]; const qty = Number(L.qty||1); const price = Number(L.price||0);
    xml += '<cac:InvoiceLine>';
    xml += '<cbc:ID>'+(i+1)+'</cbc:ID>';
    xml += '<cbc:InvoicedQuantity unitCode="EA">'+qty+'</cbc:InvoicedQuantity>';
    xml += '<cbc:LineExtensionAmount currencyID="'+currency+'">'+(qty*price).toFixed(2)+'</cbc:LineExtensionAmount>';
    xml += '<cac:Item><cbc:Name>'+esc(L.name||"")+'</cbc:Name></cac:Item>';
    xml += '<cac:Price><cbc:PriceAmount currencyID="'+currency+'">'+price.toFixed(2)+'</cbc:PriceAmount></cac:Price>';
    xml += '</cac:InvoiceLine>';
  }
  xml += '</Invoice>';
  return xml;
}



