import React, { useState, useEffect } from "react";
import CreateInvoiceModal from "./modals/CreateInvoiceModal";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 15,
    totalClients: 8, 
    totalProducts: 24,
    recentInvoices: [
      { id: 1, client: "شركة النور", amount: "١٬٢٠٠ ر.س", status: "مسددة" },
      { id: 2, client: "مؤسسة التقنية", amount: "٣٬٥٠٠ ر.س", status: "غير مسددة" }
    ]
  });

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleAddClient = () => {
    // سيتم تنفيذ هذا لاحقاً
    alert("سيتم فتح نموذج إضافة عميل جديد قريباً");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="yaqeen-card">
        <h2 className="text-2xl font-bold text-primary-500 mb-8">لوحة تحكم يَقين</h2>
        
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalInvoices}</div>
            <h3 className="text-lg font-semibold text-blue-800">إجمالي الفواتير</h3>
          </div>
          
          <div className="stat-card bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalClients}</div>
            <h3 className="text-lg font-semibold text-green-800">العملاء</h3>
          </div>
          
          <div className="stat-card bg-orange-50 p-6 rounded-lg border border-orange-200 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.totalProducts}</div>
            <h3 className="text-lg font-semibold text-orange-800">المنتجات</h3>
          </div>
        </div>

        {/* آخر الفواتير */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">آخر الفواتير</h3>
          
          <div className="space-y-4">
            {stats.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{invoice.client}</h4>
                  <p className="text-sm text-gray-600">#{invoice.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">{invoice.amount}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.status === "مسددة" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* أزرار إجراءات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleCreateInvoice}
            className="yaqeen-btn flex items-center justify-center"
          >
            📄 إنشاء فاتورة جديدة
          </button>
          <button 
            onClick={handleAddClient}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            👥 إضافة عميل جديد
          </button>
        </div>
      </div>

      {/* Modal إنشاء فاتورة */}
      <CreateInvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
