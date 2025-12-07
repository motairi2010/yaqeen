import React from 'react';
import UnifiedLayout from '../layout/UnifiedLayout';

const BusinessOwnerInterface = ({ onRoleChange }) => {
  const businessMetrics = {
    totalRevenue: 125000,
    totalExpenses: 85000,
    netProfit: 40000,
    customerCount: 1245
  };

  return (
    <UnifiedLayout 
      title="لوحة تحكم مدير النظام" 
      userRole="business_owner" 
      onRoleChange={onRoleChange}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{businessMetrics.totalRevenue.toLocaleString()} ﷼</div>
            <div className="text-gray-600">الإيرادات</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{businessMetrics.totalExpenses.toLocaleString()} ﷼</div>
            <div className="text-gray-600">المصروفات</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{businessMetrics.netProfit.toLocaleString()} ﷼</div>
            <div className="text-gray-600">صافي الربح</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{businessMetrics.customerCount.toLocaleString()}</div>
            <div className="text-gray-600">عدد العملاء</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">تقارير الأداء</div>
            </div>
          </button>
          <button className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">إدارة الموظفين</div>
            </div>
          </button>
          <button className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">الإعدادات</div>
            </div>
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4">نظرة عامة على الأداء</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>معدل الإشغال اليومي:</span>
              <span className="text-green-600 amount-RiyalSymbolToken">78%</span>
            </div>
            <div className="flex justify-between">
              <span>متوسط قيمة الفاتورة:</span>
              <span className="text-green-600 amount-RiyalSymbolToken">45 ﷼</span>
            </div>
            <div className="flex justify-between">
              <span>التكلفة التشغيلية:</span>
              <span className="text-red-600 amount-RiyalSymbolToken">68% من الإيرادات</span>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default BusinessOwnerInterface;






