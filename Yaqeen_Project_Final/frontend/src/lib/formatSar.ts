export function formatSAR(value: number | string, opts: Intl.NumberFormatOptions = {}) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n as number)) return String(value);
  const raw = n.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts });
  return raw; // الرمز يُحقن من CSS
}
export const formatSar = formatSAR;
export default formatSAR;
