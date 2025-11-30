import { getInventoryMap } from "./inventory";

/** يعيد الصنف من المخزون المحلي إن وُجد (للاستخدام في POS) */
export function findLocalProduct(sku){
  const map = getInventoryMap();
  const it = map[sku];
  if(!it) return null;
  // نفترض VAT 15% (يمكن جعلها إعدادًا لاحقًا)
  return { sku, name: it.name, price: Number(it.price||0), vat: 0.15 };
}


