import React from 'react';

const Reports = () => {
  const financialData = {
    revenue: [120000, 135000, 125000, 140000, 155000, 160000],
    expenses: [80000, 85000, 82000, 88000, 90000, 92000],
    profit: [40000, 50000, 43000, 52000, 65000, 68000],
    months: ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  };

  return (
    <div className="yaqeen-container">
      <h1>التقارير المالية</h1>
      
      <div className="chart-container">
        <h2>قائمة الدخل</h2>
        <div style={{height: '300px', background: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <p>رسم بياني يوضح الإيرادات والمصروفات على مدار الأشهر</p>
        </div>
      </div>

      <div className="yaqeen-card">
        <h2>التفاصيل المالية</h2>
        <table className="yaqeen-table">
          <thead>
            <tr>
              <th>الشهر</th>
              <th>الإيرادات</th>
              <th>المصروفات</th>
              <th>الأرباح</th>
            </tr>
          </thead>
          <tbody>
            {financialData.months.map((month, index) => (
              <tr key={index}>
                <td>{month}</td>
                <td>{financialData.revenue[index].toLocaleString()} ر.س</td>
                <td>{financialData.expenses[index].toLocaleString()} ر.س</td>
                <td>{financialData.profit[index].toLocaleString()} ر.س</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
