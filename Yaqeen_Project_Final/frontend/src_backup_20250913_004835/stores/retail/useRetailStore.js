import { create } from 'zustand';

const useRetailStore = create((set, get) => ({
  // البيانات الأساسية
  stores: [
    { id: 1, name: 'الفرع الرئيسي', location: 'الرياض', manager: 'أحمد محمد' },
    { id: 2, name: 'فرع النخيل', location: 'الرياض', manager: 'فاطمة عبدالله' }
  ],
  
  products: [
    { id: 1, name: 'قهوة عربية', price: 15, cost: 8, category: 'مشروبات', stock: 45, minStock: 10, barcode: '123456789' },
    { id: 2, name: 'شاي أخضر', price: 10, cost: 5, category: 'مشروبات', stock: 32, minStock: 15, barcode: '987654321' },
    { id: 3, name: 'كعكة الشوكولاتة', price: 25, cost: 12, category: 'حلويات', stock: 8, minStock: 5, barcode: '456789123' }
  ],
  
  suppliers: [
    { id: 1, name: 'مورد القهوة', contact: '0551234567', products: [1] },
    { id: 2, name: 'مورد الحلويات', contact: '0557654321', products: [3] }
  ],
  
  dailySales: [],
  
  // الإجراءات
  addSale: (saleData) => set((state) => {
    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...saleData
    };
    
    // تحديث المخزون
    const updatedProducts = state.products.map(product => {
      const soldItem = saleData.items.find(item => item.productId === product.id);
      if (soldItem) {
        return { ...product, stock: product.stock - soldItem.quantity };
      }
      return product;
    });
    
    return {
      dailySales: [...state.dailySales, newSale],
      products: updatedProducts
    };
  }),
  
  addProduct: (productData) => set((state) => ({
    products: [...state.products, { id: Date.now(), ...productData }]
  })),
  
  updateStock: (productId, newStock) => set((state) => ({
    products: state.products.map(product =>
      product.id === productId ? { ...product, stock: newStock } : product
    )
  })),
  
  // التقارير
  getDailyReport: (date = new Date()) => {
    const { dailySales } = get();
    const today = date.toISOString().split('T')[0];
    const todaySales = dailySales.filter(sale => sale.date.startsWith(today));
    
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = todaySales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    
    return { todaySales, totalSales, totalItems };
  },
  
  getInventoryAlerts: () => {
    const { products } = get();
    return products.filter(product => product.stock <= product.minStock);
  },
  
  getTopProducts: (limit = 5) => {
    const { dailySales } = get();
    const productSales = {};
    
    dailySales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });
    
    return Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, limit);
  }
}));

export default useRetailStore;
