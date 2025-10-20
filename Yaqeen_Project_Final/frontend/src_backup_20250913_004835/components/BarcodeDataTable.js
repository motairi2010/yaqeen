import React, { useState, useRef, useEffect } from 'react';
import { Barcode, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import useBarcodeStore from '../stores/useBarcodeStore';

const BarcodeDataTable = () => {
  const {
    scannedItems,
    addScannedItem,
    updateQuantity,
    removeItem,
    clearAll,
    getTotal,
    getItemCount
  } = useBarcodeStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const inputRef = useRef(null);
  const total = getTotal();
  const itemCount = getItemCount();

  // التركيز على حقل الإدخال تلقائياً
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      addScannedItem(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  const handleManualAdd = () => {
    if (barcodeInput.trim()) {
      addScannedItem(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  const handleQuantityChange = (barcode, change) => {
    const item = scannedItems.find(item => item.barcode === barcode);
    if (item) {
      updateQuantity(barcode, item.quantity + change);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* العنوان وشريط الإدخال */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Barcode className="ml-2" size={28} />
              نظام إدخال البيانات بالباركود
            </h1>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                <ShoppingCart size={16} className="inline ml-1" />
                {itemCount} عنصر
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                الإجمالي: {total.toFixed(2)} ر.س
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مسح الباركود
              </label>
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeScan}
                  placeholder="اقرأ الباركود أو اكتبه ثم اضغط Enter..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleManualAdd}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  إضافة
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                استخدم قارئ الباركود أو اكتب الرقم يدوياً ثم اضغط Enter
              </p>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={clearAll}
                disabled={scannedItems.length === 0}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={18} className="inline ml-1" />
                مسح الكل
              </button>
            </div>
          </div>
        </div>

        {/* جدول البيانات */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {scannedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Barcode size={48} className="mx-auto mb-4 text-gray-300" />
              <p>لم يتم إضافة أي عناصر بعد</p>
              <p className="text-sm">استخدم قارئ الباركود لبدء إضافة المنتجات</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الباركود</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">اسم المنتج</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الفئة</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">السعر</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الكمية</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">المجموع</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الوقت</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-700">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scannedItems.map((item, index) => (
                    <tr key={item.barcode} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.barcode}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.price.toFixed(2)} ر.س</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.barcode, -1)}
                            className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.barcode, 1)}
                            className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">{item.total.toFixed(2)} ر.س</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{item.timestamp}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeItem(item.barcode)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-right text-sm font-medium">
                      الإجمالي العام:
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{itemCount}</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{total.toFixed(2)} ر.س</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </>
          )}
        </div>

        {/* أزرار الإجراءات */}
        {scannedItems.length > 0 && (
          <div className="mt-6 flex space-x-4 justify-end">
            <button className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              حفظ البيانات
            </button>
            <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              طباعة الفاتورة
            </button>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              تصدير Excel
            </button>
          </div>
        )}

        {/* تعليمات الاستخدام */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-800 mb-4">تعليمات الاستخدام:</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>استخدم قارئ الباركود لمسح المنتجات تلقائياً</li>
            <li>يمكنك كتابة رقم الباركود يدوياً ثم الضغط على Enter</li>
            <li>استخدم أزرار (+) و (-) لتعديل الكميات</li>
            <li>اضغط على أيقونة السلة لحذف العنصر</li>
            <li>استخدم "مسح الكل" لبدء جلسة جديدة</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BarcodeDataTable;
