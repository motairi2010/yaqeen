import React from "react";
import "./main.css";import "./lib/pay";
import { Routes, Route, Navigate } from "react-router-dom";
import Invoices from "./pages/Invoices";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import PricingEngine from "./pages/PricingEngine";
import Promotions from "./pages/Promotions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CashManagement from "./pages/CashManagement";
import Accounting from "./pages/Accounting";
import Purchasing from "./pages/Purchasing";
import Returns from "./pages/Returns";

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/products" element={<Products />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/pricing" element={<PricingEngine />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/cash-management" element={<CashManagement />} />
        <Route path="/accounting" element={<Accounting />} />
        <Route path="/purchasing" element={<Purchasing />} />
        <Route path="/returns" element={<Returns />} />
              <Route path="/invoices" element={<Invoices />} />
      </Routes>
    </DashboardLayout>
  );
}
















