export type SarSide = "before" | "after";
export function setCurrencySide(side: SarSide){
  const b = document?.body;
  if(!b) return;
  b.classList.remove("sar-before","sar-after");
  b.classList.add(`sar-${side}`);
}
