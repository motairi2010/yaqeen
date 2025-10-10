import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // حالة المستخدم
  user: {
    name: 'محمد أحمد',
    role: 'admin',
    email: 'mohamed@yaqeen.com'
  },
  
  // حالة الفواتير
  invoices: [],
  
  // حالة العملاء
  customers: [],
  
  // حالة المنتجات
  products: [],
  
  // إضافة فاتورة
  addInvoice: (invoice) => set((state) => ({
    invoices: [...state.invoices, invoice]
  })),
  
  // تحديث فاتورة
  updateInvoice: (id, updatedInvoice) => set((state) => ({
    invoices: state.invoices.map(invoice =>
      invoice.id === id ? { ...invoice, ...updatedInvoice } : invoice
    )
  })),
  
  // حذف فاتورة
  deleteInvoice: (id) => set((state) => ({
    invoices: state.invoices.filter(invoice => invoice.id !== id)
  })),
  
  // إضافة عميل
  addCustomer: (customer) => set((state) => ({
    customers: [...state.customers, customer]
  })),
  
  // إضافة منتج
  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),
  
  // جلب الإحصائيات
  getStats: () => {
    const { invoices } = get();
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid');
    const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
    
    return {
      totalSales,
      paidInvoices: paidInvoices.length,
      pendingInvoices: pendingInvoices.length,
      totalInvoices: invoices.length
    };
  }
}));

export default useAppStore;


