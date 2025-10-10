import React, { useState } from 'react';
import UnifiedLayout from '../layout/UnifiedLayout';

const InventoryManagerInterface = ({ onRoleChange }) => {
  const [inventory] = useState([
    { id: 1, name: "قهوة عربية", stock: 45, minStock: 10, category: "مشروبات" },
    { id: 2, name: "شاي أخضر", stock: 32, minStock: 15, category: "مشروبات" },
    { id: 3, name: "كعكة شوكولاتة", stock: 8, minStock: 5, category: "حلويات" },
    { id: 4, name: "ساندويتش جبن", stock: 3, minStock: 8, category: "وجبات" }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const categories = ['الكل', 'مشروبات', 'وجبات', 'حلويات'];

  const filteredInventory = selectedCategory === 'الكل'
    ? inventory
    : inventory.filter(item => item.category === selectedCategory);

  return (
    <UnifiedLayout 
      title="إدارة المخزون" 
      userRole="inventory_manager" 
      onRoleChange={onRoleChange}
    >
      <div className="bg-white rounded-lg p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm ${
                selectedCategory === category
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-right text-sm">المنتج</th>
                <th className="p-3 text-right text-sm">المخزون</th>
                <th className="p-3 text-right text-sm">أقل كمية</th>
                <th className="p-3 text-right text-sm">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.stock}</td>
                  <td className="p-3">{item.minStock}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.stock <= item.minStock 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.stock <= item.minStock ? 'تحتاج طلب' : 'متوفر'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            إضافة منتج
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            طلب منتجات
          </button>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default InventoryManagerInterface;
