import React from "react";

const Invoices = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="yaqeen-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-500">إدارة الفواتير</h2>
          <button className="yaqeen-btn">
            + فاتورة جديدة
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-right">رقم الفاتورة</th>
                <th className="p-3 text-right">العميل</th>
                <th className="p-3 text-right">المبلغ</th>
                <th className="p-3 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-center" colSpan="4">
                  <p className="text-gray-500 py-4">لا توجد فواتير حتى الآن</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;


