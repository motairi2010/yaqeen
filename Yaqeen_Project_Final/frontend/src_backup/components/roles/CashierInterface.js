import React, { useState } from 'react';
import UnifiedLayout from '../layout/UnifiedLayout';

const CashierInterface = ({ onRoleChange }) => {
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('الكل');

  const categories = ['الكل', 'مشروبات', 'وجبات', 'حلويات'];

  const products = [
    { id: 1, name: "قهوة عربية", price: 15, category: "مشروبات" },
    { id: 2, name: "شاي أخضر", price: 10, category: "مشروبات" },
    { id: 3, name: "كعكة شوكولاتة", price: 25, category: "حلويات" },
    { id: 4, name: "ساندويتش جبن", price: 20, category: "وجبات" },
    { id: 5, name: "عصير برتقال", price: 12, category: "مشروبات" },
    { id: 6, name: "كيك الجبن", price: 22, category: "حلويات" }
  ];

  const filteredProducts = activeCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <UnifiedLayout 
      title="نقطة البيع" 
      userRole="cashier" 
      onRoleChange={onRoleChange}
    >
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* قسم المنتجات */}
        <div className="flex-1 bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">المنتجات</h2>
          
          {/* فئات المنتجات */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 rounded-lg text-sm ${
                  activeCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* قائمة المنتجات */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="text-center">
                  <div className="font-medium text-gray-800">{product.name}</div>
                  <div className="text-green-600 font-bold mt-1">{product.price} ر.س</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* قسم الفاتورة */}
        <div className="w-full md:w-80 bg-white rounded-lg p-4">
          <h2 className="text-lg font-bold mb-4">الفاتورة</h2>
          
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد منتجات في الفاتورة</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">{item.price} ر.س × {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.price * item.quantity} ر.س</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>المجموع:</span>
              <span>{calculateTotal()} ر.س</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-blue-500 text-white py-2 rounded font-medium">
                دفع نقدي
              </button>
              <button className="bg-green-500 text-white py-2 rounded font-medium">
                دفع بالبطاقة
              </button>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default CashierInterface;
