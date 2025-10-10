import React, { useState } from 'react';

const Invoices = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    customer: '',
    items: [{ description: '', quantity: 1, price: 0, total: 0 }],
    total: 0
  });

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, price: 0, total: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    setInvoiceData({
      ...invoiceData,
      items: newItems,
      total: newItems.reduce((sum, item) => sum + item.total, 0)
    });
  };

  return (
    <div className="yaqeen-container">
      <h1>إنشاء فاتورة جديدة</h1>
      
      <div className="yaqeen-card">
        <h2>معلومات الفاتورة</h2>
        
        <div className="form-group">
          <label>رقم الفاتورة</label>
          <input 
            type="text" 
            value={invoiceData.invoiceNumber}
            onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>تاريخ الفاتورة</label>
          <input 
            type="date" 
            value={invoiceData.invoiceDate}
            onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>تاريخ الاستحقاق</label>
          <input 
            type="date" 
            value={invoiceData.dueDate}
            onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
          />
        </div>
      </div>

      <div className="yaqeen-card">
        <h2>تفاصيل العميل</h2>
        
        <div className="form-group">
          <label>اختيار العميل</label>
          <select 
            value={invoiceData.customer}
            onChange={(e) => setInvoiceData({...invoiceData, customer: e.target.value})}
          >
            <option value="">اختر عميل</option>
            <option value="customer1">أحمد محمد</option>
            <option value="customer2">شركة التقنية</option>
            <option value="customer3">مكتب المحاسبة</option>
          </select>
        </div>
        
        <button className="yaqeen-btn">إضافة عميل جديد</button>
      </div>

      <div className="yaqeen-card">
        <h2>تفاصيل السلع/الخدمات</h2>
        
        <table className="invoice-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <input 
                    type="text" 
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                  />
                </td>
                <td>{item.total.toLocaleString()} ﷼</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <button className="yaqeen-btn" onClick={addItem}>إضافة صف</button>
      </div>

      <div className="yaqeen-card">
        <h2>المجموع: {invoiceData.total.toLocaleString()} ﷼</h2>
        
        <div>
          <button className="yaqeen-btn">حفظ الفاتورة</button>
          <button className="yaqeen-btn">طباعة الفاتورة</button>
          <button className="yaqeen-btn">إلغاء</button>
        </div>
      </div>
    </div>
  );
};

export default Invoices;



