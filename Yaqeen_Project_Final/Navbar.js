# إنشاء مجلد components إذا لم يكن موجوداً
mkdir src/components -Force

# إنشاء ملف Navbar.js
@'
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-primary-500 text-white p-4">
      <h1 className="text-xl font-bold">شريط التنقل - يَقين</h1>
    </nav>
  );
};

export default Navbar;
'@ | Out-File -FilePath src/components/Navbar.js -Encoding UTF8