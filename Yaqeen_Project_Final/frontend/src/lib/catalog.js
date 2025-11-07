import { getInventoryMap } from "./inventory";
import { findProductByCode } from "../services/productsService";

/** يعيد الصنف من المخزون المحلي إن وُجد (للاستخدام في POS) */
export function findLocalProduct(sku){
  const map = getInventoryMap();
  const it = map[sku];
  if(!it) return null;
  // نفترض VAT 15% (يمكن جعلها إعدادًا لاحقًا)
  return { sku, name: it.name, price: Number(it.price||0), vat: 0.15 };
}

/** يبحث عن المنتج في قاعدة البيانات (يدعم SKU و Barcode) */
export async function findProductInDatabase(code) {
  try {
    const { data, error } = await findProductByCode(code);

    if (error) {
      console.error('Error finding product:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      sku: data.sku,
      name: data.name_ar,
      price: Number(data.price || 0),
      cost: Number(data.cost || 0),
      vat: Number(data.vat_rate || 0.15),
      barcode: data.barcode,
      category: data.category
    };
  } catch (error) {
    console.error('Error in findProductInDatabase:', error);
    return null;
  }
}


