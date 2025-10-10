export type SarSide = "before" | "after";

export function formatNumberAr(value: number){
  return new Intl.NumberFormat("ar-SA", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export ` : `${n} ﷼`;
}

