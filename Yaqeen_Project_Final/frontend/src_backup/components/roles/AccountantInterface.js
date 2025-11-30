import React, { useState } from 'react';
import UnifiedLayout from '../layout/UnifiedLayout';

const AccountantInterface = ({ onRoleChange }) => {
  const [activeTab, setActiveTab] = useState('المالية');

  const financialData = {
    revenue: 150000,
    expenses: 95000,
    profit: 55000,
    taxAmount: 8250,
    zakatAmount: 1375
  };

  return (
    <UnifiedLayout 
      title="الشؤون المالية" 
      userRole="accountant" 
      onRoleChange={onRoleChange}
    >
      <div className="bg-white rounded-lg p-4">
        <div className="flex gap-2 mb-6">
          {['المالية', 'الضريبة', 'الزكاة'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'المالية' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{financialData.revenue.toLocaleString()} ر.س</div>
              <div className="text-gray-600">الإيرادات</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{financialData.expenses.toLocaleString()} ر.س</div>
              <div className="text-gray-600">المصروفات</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{financialData.profit.toLocaleString()} ر.س</div>
              <div className="text-gray-600">صافي الربح</div>
            </div>
          </div>
        )}

        {activeTab === 'الضريبة' && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">الضريبة</h3>
            <div className="flex justify-between items-center mb-4">
              <span>مبلغ الضريبة المستحقة:</span>
              <span className="text-blue-600 font-bold">{financialData.taxAmount.toLocaleString()} ر.س</span>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              إنشاء إقرار ضريبي
            </button>
          </div>
        )}

        {activeTab === 'الزكاة' && (
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">الزكاة</h3>
            <div className="flex justify-between items-center mb-4">
              <span>مبلغ الزكاة المستحقة:</span>
              <span className="text-green-600 font-bold">{financialData.zakatAmount.toLocaleString()} ر.س</span>
            </div>
            <button className="bg-green-500 text-white px-4 py-2 rounded">
              إنشاء إقرار زكاة
            </button>
          </div>
        )}
      </div>
    </UnifiedLayout>
  );
};

export default AccountantInterface;
