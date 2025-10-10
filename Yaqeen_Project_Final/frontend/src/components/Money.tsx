import { formatSAR } from "../utils/currency";
export default function Money({ value, className }: { value: number | string; className?: string }) {
  return <span className={className}><span className="money">{formatSAR(value)}</span></span>;
}

