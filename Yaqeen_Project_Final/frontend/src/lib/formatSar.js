export function formatSar(value, opts = {}) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return String(value);
  const raw = n.toLocaleString("ar-SA", Object.assign({ minimumFractionDigits: 2, maximumFractionDigits: 2 }, opts));
  return raw; // الرمز يُحقن من CSS
}

export default formatSar;
