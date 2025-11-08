import React from "react";
import "./main.css";import "./lib/pay";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f7fafc"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "#718096" }}>جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><DashboardLayout><POS /></DashboardLayout></ProtectedRoute>} />
      <Route path="/sales" element={<ProtectedRoute><DashboardLayout><Sales /></DashboardLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><DashboardLayout><Products /></DashboardLayout></ProtectedRoute>} />
      <Route path="/suppliers" element={<ProtectedRoute><DashboardLayout><Suppliers /></DashboardLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><DashboardLayout><PricingEngine /></DashboardLayout></ProtectedRoute>} />
      <Route path="/promotions" element={<ProtectedRoute><DashboardLayout><Promotions /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
      <Route path="/cash-management" element={<ProtectedRoute><DashboardLayout><CashManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/accounting" element={<ProtectedRoute><DashboardLayout><Accounting /></DashboardLayout></ProtectedRoute>} />
      <Route path="/purchasing" element={<ProtectedRoute><DashboardLayout><Purchasing /></DashboardLayout></ProtectedRoute>} />
      <Route path="/returns" element={<ProtectedRoute><DashboardLayout><Returns /></DashboardLayout></ProtectedRoute>} />
      <Route path="/invoices" element={<ProtectedRoute><DashboardLayout><Invoices /></DashboardLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
















