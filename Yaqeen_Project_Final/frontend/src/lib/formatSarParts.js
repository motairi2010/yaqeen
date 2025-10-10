// src/lib/formatSarParts.js
// ظٹط¹طھظ…ط¯ ط¹ظ„ظ‰ Intl ظ„ظ„ط±ظ‚ظ…طŒ ظˆظٹط¨ط¯ظ‘ظ„ ط¬ط²ط، ط§ظ„ط¹ظ…ظ„ط© ط¥ظ„ظ‰ ï·¼ ظ…ط¹ NBSP

const SYM  = "\uFDFC"; // ï·¼
const NBSP = "\u00A0";

export function formatSarParts(value, { digits = 2 } = {}) {
  const n = Number(value) || 0;

  const nf = new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "RiyalSymbolToken",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    // ظ…ط§ ظٹظ‡ظ…ظ†ط§ ظˆط´ ظٹط·ظ„ط¹ ظ‡ظ†ط§ط› ط¨ظ†ط¨ط¯ظ‘ظ„ ط§ظ„ط±ظ…ط² ظ„ط§ط­ظ‚ط§ظ‹
    // currencyDisplay: "symbol" | "narrowSymbol" | "code"
  });

  try {
    const parts = nf.formatToParts(n);
    // ط¨ط¯ظ‘ظ„ ط§ظ„ط¹ظ…ظ„ط©طŒ ظˆط«ط¨ظ‘طھ ط§ظ„ظ…ط³ط§ظپط§طھ ظƒظ€ NBSP ط­طھظ‰ ظ…ط§ طھظ†ظƒط³ط±
    return parts
      .map(p => (p.type === "currency" ? SYM : p.value.replace(/\s/g, NBSP)))
      .join("");
  } catch {
    // ظ…ط­ط±ظƒط§طھ ظ‚ط¯ظٹظ…ط© ظ…ط§ طھط¯ط¹ظ… formatToPartsطں ظ†ط±ط¬ط¹ ط§ظ„ظ†ط³ط®ط© ط§ظ„ظٹط¯ظˆظٹط© ظƒط®ط·ط© ط¨
    const num = new Intl.NumberFormat("ar-SA", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(n);
    return `${SYM}${NBSP}${num}`;
  }
}



