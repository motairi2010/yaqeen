export function splitTender(grossTotal, prefer = "cash") {
  const total = Number(grossTotal || 0);
  if (!total) return null;

  const hint = `إجمالي مستحق: ${total}
أدخل مبالغ + طريقة (cash/card/transfer/wallet) مفصولة بفواصل
مثال: 50 cash, 30 card, 20 transfer`;
  const txt = window.prompt(hint, `${total} ${prefer || "cash"}`);
  if (!txt) return null;

  const parts = String(txt).split(",").map(s => s.trim()).filter(Boolean);
  const pays = { cash: 0, card: 0, transfer: 0, wallet: 0 };

  for (const p of parts) {
    const [valStr, methodRaw] = p.split(/\s+/);
    const val = Number(valStr || 0);
    const method = (methodRaw || prefer || "cash").toLowerCase();
    if (!val || !Object.prototype.hasOwnProperty.call(pays, method)) continue;
    pays[method] += val;
  }

  const sum = pays.cash + pays.card + pays.transfer + pays.wallet;
  if (Math.abs(sum - total) > 0.01) {
    alert(`المبالغ المُدخلة (${sum}) لا تساوي الإجمالي (${total})`);
    return null;
  }
  return pays;
}
