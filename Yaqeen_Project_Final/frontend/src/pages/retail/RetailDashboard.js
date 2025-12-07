import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useRetailStore from '../stores/retail/useRetailStore';

const RetailDashboard = () => {
  const { getDailyReport, getInventoryAlerts, getTopProducts } = useRetailStore();
  const { totalSales, totalItems } = getDailyReport();
  const inventoryAlerts = getInventoryAlerts();
  const topProducts = getTopProducts();

  const salesData = [
    { name: 'السبت', sales: 1200 },
    { name: 'الأحد', sales: 1900 },
    { name: 'الإثنين', sales: 1500 },
    { name: 'الثلاثاء', sales: 2100 },
    { name: 'الأربعاء', sales: 1800 },
    { name: 'الخميس', sales: 2500 },
    { name: 'الجمعة', sales: 3200 }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">لوحة تحكم التجزئة</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">مبيعات اليوم</h3>
          <p className="text-2xl font-bold text-blue-600">{totalSales} ﷼</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">المنتجات المباعة</h3>
          <p className="text-2xl font-bold text-green-600">{totalItems}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">تنبيهات المخزون</h3>
          <p className="text-2xl font-bold text-red-600">{inventoryAlerts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">مبيعات الأسبوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">المنتجات الأكثر مبيعاً</h3>
          <div className="space-y-2">
            {topProducts.map(([productId, data], index) => (
              <div key={productId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium amount-RiyalSymbolToken">المنتج #{index + 1}</span>
                <span className="text-blue-600 font-bold">{data.revenue} ﷼</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">تنبيهات المخزون</h3>
        {inventoryAlerts.length === 0 ? (
          <p className="text-gray-500">لا توجد تنبيهات للمخزون</p>
        ) : (
          <div className="space-y-2">
            {inventoryAlerts.map(product => (
              <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">المخزون: {product.stock} - الحد الأدنى: {product.minStock}</p>
                </div>
                <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  طلب
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailDashboard;







