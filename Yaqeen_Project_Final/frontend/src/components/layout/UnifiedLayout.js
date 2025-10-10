import React from "react";

const UnifiedLayout = ({ title, userRole, children, onRoleChange }) => {
  const roles = [
    { id: "cashier", name: "كاشير", icon: "💳", color: "from-blue-500 to-blue-600" },
    { id: "inventory_manager", name: "مدير المخازن", icon: "📦", color: "from-green-500 to-green-600" },
    { id: "accountant", name: "المحاسب", icon: "📊", color: "from-purple-500 to-purple-600" },
    { id: "business_owner", name: "مدير النظام", icon: "👑", color: "from-orange-500 to-orange-600" }
  ];

  const quickActions = [
    { id: "home", name: "الرئيسية", icon: "🏠" },
    { id: "reports", name: "التقارير", icon: "📈" },
    { id: "settings", name: "الإعدادات", icon: "⚙️" },
    { id: "help", name: "المساعدة", icon: "❓" }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* الشريط الجانبي */}
      <div className="w-64 bg-white shadow-lg border-l border-gray-200">
        {/* الشعار */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <span className="text-lg">ي</span>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">يَقين</div>
              <div className="text-sm text-gray-600">النظام المحاسبي</div>
            </div>
          </div>
        </div>

        {/* قائمة الأدوار */}
        <div className="p-4">
          <div className="text-sm text-gray-500 mb-2">تبديل الوظيفة:</div>
          <div className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`w-full text-right p-3 rounded-lg transition-all ${
                  userRole === role.id
                    ? `bg-gradient-to-r ${role.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span>{role.icon}</span>
                    <span>{role.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* إجراءات سريعة */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2">إجراءات سريعة:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition-colors"
              >
                <div className="text-center">
                  <div className="text-lg">{action.icon}</div>
                  <div className="text-xs mt-1">{action.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* معلومات المستخدم */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              م
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">محمد أحمد</div>
              <div className="text-xs text-gray-600">مدير النظام</div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* الشريط العلوي */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-sm text-gray-600">مرحباً، محمد</div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                م
              </div>
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UnifiedLayout;


