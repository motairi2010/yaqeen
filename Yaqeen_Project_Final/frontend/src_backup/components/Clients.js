import React from "react";

const Clients = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="yaqeen-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-500">إدارة العملاء</h2>
          <button className="yaqeen-btn">
            + عميل جديد
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full table-arabic">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">اسم العميل</th>
                <th className="p-3">البريد الإلكتروني</th>
                <th className="p-3">الهاتف</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 text-center" colSpan="4">
                  <p className="text-gray-500 py-4">لا توجد عملاء حتى الآن</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;
