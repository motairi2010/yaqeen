import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import BrandLogo from "../components/BrandLogo";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("cashier");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBranches();
  }, []);

  async function loadBranches() {
    const { data } = await supabase.from("branches").select("id, name_ar").eq("is_active", true);
    if (data) setBranches(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
        phone,
        role,
        branch_id: branchId
      });

      if (error) {
        setError(error.message || "فشل إنشاء الحساب");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "420px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
          <h2 style={{ color: "#27ae60", marginBottom: "12px" }}>تم إنشاء الحساب بنجاح!</h2>
          <p style={{ color: "#718096" }}>جارٍ تحويلك إلى صفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        maxWidth: "520px",
        width: "100%",
        padding: "40px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <BrandLogo />
          <h1 style={{ margin: "16px 0 8px", fontSize: "28px", fontWeight: "700", color: "#1a202c" }}>
            إنشاء حساب جديد
          </h1>
          <p style={{ color: "#718096", fontSize: "14px" }}>
            انضم إلى نظام يَقين المحاسبي
          </p>
        </div>

        {error && (
          <div style={{
            background: "#FEE",
            border: "1px solid #FCC",
            color: "#C33",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>
              الاسم الكامل
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="أحمد محمد"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>
              رقم الجوال
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none"
              }}
            />
            <p style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
              يجب أن تكون 6 أحرف على الأقل
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>
              الدور الوظيفي
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "white"
              }}
            >
              <option value="cashier">كاشير</option>
              <option value="manager">مدير</option>
              <option value="inventory_manager">مدير مخزون</option>
              <option value="accountant">محاسب</option>
              <option value="admin">مدير نظام</option>
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2d3748", fontSize: "14px" }}>
              الفرع
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                background: "white"
              }}
            >
              <option value="">اختر الفرع</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name_ar}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#cbd5e0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s"
            }}
          >
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <p style={{ color: "#718096", fontSize: "14px" }}>
            لديك حساب بالفعل؟{" "}
            <a href="/login" style={{ color: "#667eea", fontWeight: "600", textDecoration: "none" }}>
              تسجيل الدخول
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
