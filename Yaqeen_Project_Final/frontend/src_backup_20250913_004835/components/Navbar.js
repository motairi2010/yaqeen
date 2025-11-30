import React from "react";

const Navbar = ({ setCurrentPage }) => {
  return (
    <nav className="bg-primary-500 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">يَقين - البرنامج المحاسبي</h1>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => setCurrentPage("dashboard")}
            className="hover:bg-primary-600 px-3 py-2 rounded"
          >
            لوحة التحكم
          </button>
          <button 
            onClick={() => setCurrentPage("invoices")}
            className="hover:bg-primary-600 px-3 py-2 rounded"
          >
            الفواتير
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
