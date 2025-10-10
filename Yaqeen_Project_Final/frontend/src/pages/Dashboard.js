import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import useAppStore from '../stores/useAppStore';

// مُنسّق أرقام بالعربية (بدون عملة)
const fmt = (v) =>
    new Intl.NumberFormat("ar-SA", { style: "decimal", minimumFractionDigits: 2, maximumFractionDigits: 2 })
        .format(Number(v ?? 0));

const Dashboard = () => {
    const { getStats } = useAppStore();
    const stats = getStats();

    const chartData = [
        { name: 'يناير', sales: 4000, expenses: 2400 },
        { name: 'فبراير', sales: 3000, expenses: 1398 },
        { name: 'مارس', sales: 2000, expenses: 9800 },
        { name: 'أبريل', sales: 2780, expenses: 3908 },
        { name: 'مايو', sales: 1890, expenses: 4800 },
        { name: 'يونيو', sales: 2390, expenses: 3800 },
    ];

    const StatCard = ({ icon: Icon, title, value, color }) => (
        <div className="stat-card">
            <div className="flex items-center">
                <div className={`p-3 rounded-full ${color} mr-4`}>
                    <Icon size={24} className="text-white" />
                </div>
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="yaqeen-container">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">لوحة التحكم</h1>

            {/* بطاقات الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={DollarSign}
                    title="إجمالي المبيعات"
                    // الرقم فقط + الرمز يضاف عبر CSS على .amount-RiyalSymbolToken
                    value={<span className="amount-RiyalSymbolToken">{fmt(stats.totalSales)}</span>}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={TrendingUp}
                    title="الفواتير المسددة"
                    value={stats.paidInvoices}
                    color="bg-green-500"
                />
                <StatCard
                    icon={Users}
                    title="العملاء"
                    value={stats.customers?.length || 0}
                    color="bg-purple-500"
                />
                <StatCard
                    icon={Package}
                    title="المنتجات"
                    value={stats.products?.length || 0}
                    color="bg-orange-500"
                />
            </div>

            {/* الرسوم البيانية */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="chart-container">
                    <h3 className="chart-title">الإيرادات والمصروفات</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sales" fill="currentColor" name="الإيرادات" />
                            <Bar dataKey="expenses" fill="currentColor" name="المصروفات" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container">
                    <h3 className="chart-title">أداء المبيعات</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sales" fill="currentColor" name="المبيعات" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* الجداول السريعة */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">آخر الفواتير</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>العميل</th>
                                <th>المبلغ</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {/* لا تضيف amount-RiyalSymbolToken على رقم الفاتورة */}
                                <td>INV-001</td>
                                <td>أحمد محمد</td>
                                <td className="amount-RiyalSymbolToken">{fmt(1250)}</td>
                                <td><span className="bg-green-100 text-green-800 px-2 py-1 rounded">مسددة</span></td>
                            </tr>
                            <tr>
                                <td>INV-002</td>
                                <td>شركة التقنية</td>
                                <td className="amount-RiyalSymbolToken">{fmt(3800)}</td>
                                <td><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">قيد الانتظار</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">المنتجات الأكثر مبيعاً</h3>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>المبيعات</th>
                                <th>الإيرادات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>قهوة عربية</td>
                                {/* المبيعات = عدد، لا نضع رمز عملة */}
                                <td>150</td>
                                <td className="amount-RiyalSymbolToken">{fmt(2250)}</td>
                            </tr>
                            <tr>
                                <td>كعكة الشوكولاتة</td>
                                <td>85</td>
                                <td className="amount-RiyalSymbolToken">{fmt(2125)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;



