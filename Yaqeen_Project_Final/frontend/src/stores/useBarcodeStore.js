import { create } from 'zustand';

const useBarcodeStore = create((set, get) => ({
  scannedItems: [],
  products: [
    { barcode: '1234567890123', name: 'قهوة عربية 250جم', price: 25.00, category: 'مشروبات' },
    { barcode: '2345678901234', name: 'شاي أخضر 100جم', price: 15.00, category: 'مشروبات' },
    { barcode: '3456789012345', name: 'سكر 1كجم', price: 8.00, category: 'مواد غذائية' },
    { barcode: '4567890123456', name: 'حليب 1لتر', price: 6.50, category: 'ألبان' },
    { barcode: '5678901234567', name: 'خبز توست', price: 5.00, category: 'مخبوزات' }
  ],

  // إضافة عنصر مسح بالباركود
  addScannedItem: (barcode) => {
    const { products, scannedItems } = get();
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
      const existingItem = scannedItems.find(item => item.barcode === barcode);
      
      if (existingItem) {
        // زيادة الكمية إذا المنتج موجود
        set({
          scannedItems: scannedItems.map(item =>
            item.barcode === barcode
              ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
              : item
          )
        });
      } else {
        // إضافة منتج جديد
        set({
          scannedItems: [...scannedItems, { 
            ...product, 
            quantity: 1, 
            total: product.price,
            timestamp: new Date().toLocaleString('ar-SA')
          }]
        });
      }
    }
  },

  // تحديث الكمية يدوياً
  updateQuantity: (barcode, newQuantity) => {
    const { scannedItems } = get();
    set({
      scannedItems: scannedItems.map(item =>
        item.barcode === barcode
          ? { 
              ...item, 
              quantity: Math.max(0, newQuantity), 
              total: Math.max(0, newQuantity) * item.price 
            }
          : item
      ).filter(item => item.quantity > 0)
    });
  },

  // حذف عنصر
  removeItem: (barcode) => {
    const { scannedItems } = get();
    set({
      scannedItems: scannedItems.filter(item => item.barcode !== barcode)
    });
  },

  // مسح جميع العناصر
  clearAll: () => {
    set({ scannedItems: [] });
  },

  // الحصول على الإجمالي
  getTotal: () => {
    const { scannedItems } = get();
    return scannedItems.reduce((sum, item) => sum + item.total, 0);
  },

  // الحصول على عدد العناصر
  getItemCount: () => {
    const { scannedItems } = get();
    return scannedItems.reduce((count, item) => count + item.quantity, 0);
  }
}));

export default useBarcodeStore;


