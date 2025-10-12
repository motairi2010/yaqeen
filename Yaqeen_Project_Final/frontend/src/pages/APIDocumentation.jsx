import React, { useState } from 'react';
import { Code, Key, Book, Database, Lock, Copy, CheckCircle } from 'lucide-react';

export default function APIDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      category: 'المنتجات (Products)',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/v1/products',
          description: 'الحصول على قائمة جميع المنتجات',
          params: ['select', 'order', 'limit'],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/products?select=*" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        },
        {
          method: 'GET',
          path: '/rest/v1/products?id=eq.{id}',
          description: 'الحصول على منتج محدد',
          params: ['id'],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/products?id=eq.123" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        },
        {
          method: 'POST',
          path: '/rest/v1/products',
          description: 'إضافة منتج جديد',
          params: ['name', 'sku', 'price', 'category_id'],
          example: `curl -X POST "${apiBaseUrl}/rest/v1/products" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "منتج جديد",
    "sku": "SKU001",
    "price": 100.00,
    "category_id": 1,
    "is_active": true
  }'`
        },
        {
          method: 'PATCH',
          path: '/rest/v1/products?id=eq.{id}',
          description: 'تحديث منتج',
          params: ['id', 'fields to update'],
          example: `curl -X PATCH "${apiBaseUrl}/rest/v1/products?id=eq.123" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"price": 150.00}'`
        },
        {
          method: 'DELETE',
          path: '/rest/v1/products?id=eq.{id}',
          description: 'حذف منتج (soft delete)',
          params: ['id'],
          example: `curl -X PATCH "${apiBaseUrl}/rest/v1/products?id=eq.123" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"is_active": false}'`
        }
      ]
    },
    {
      category: 'الفواتير (Invoices)',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/v1/invoices',
          description: 'الحصول على قائمة الفواتير',
          params: ['select', 'invoice_type', 'order', 'limit'],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/invoices?select=*,customers(name)&invoice_type=eq.sale&order=invoice_date.desc" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        },
        {
          method: 'GET',
          path: '/rest/v1/invoices?id=eq.{id}',
          description: 'الحصول على فاتورة محددة مع بنودها',
          params: ['id'],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/invoices?id=eq.123&select=*,invoice_items(*),customers(*)" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        },
        {
          method: 'POST',
          path: '/rest/v1/invoices',
          description: 'إنشاء فاتورة جديدة',
          params: ['invoice_type', 'customer_id', 'invoice_items'],
          example: `curl -X POST "${apiBaseUrl}/rest/v1/invoices" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "invoice_type": "sale",
    "customer_id": 1,
    "invoice_date": "2025-10-12",
    "total_amount": 230.00,
    "vat_amount": 30.00,
    "payment_status": "paid"
  }'`
        }
      ]
    },
    {
      category: 'العملاء (Customers)',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/v1/customers',
          description: 'الحصول على قائمة العملاء',
          params: ['select', 'is_active', 'order'],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/customers?select=*&is_active=eq.true" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        },
        {
          method: 'POST',
          path: '/rest/v1/customers',
          description: 'إضافة عميل جديد',
          params: ['name', 'email', 'phone'],
          example: `curl -X POST "${apiBaseUrl}/rest/v1/customers" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "عميل جديد",
    "email": "customer@example.com",
    "phone": "0501234567",
    "is_active": true
  }'`
        }
      ]
    },
    {
      category: 'المخزون (Inventory)',
      endpoints: [
        {
          method: 'GET',
          path: '/rest/v1/inventory',
          description: 'الحصول على قائمة المخزون',
          params: ['select', 'order'],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/inventory?select=*,products(name,sku)" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        },
        {
          method: 'GET',
          path: '/rest/v1/inventory?quantity=lt.min_quantity',
          description: 'الحصول على المنتجات منخفضة المخزون',
          params: [],
          example: `curl -X GET "${apiBaseUrl}/rest/v1/inventory?quantity=lt.min_quantity&select=*,products(name)" \\
  -H "apikey: YOUR_ANON_KEY" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"`
        }
      ]
    }
  ];

  const getMethodColor = (method) => {
    const colors = {
      GET: '#10b981',
      POST: '#3b82f6',
      PUT: '#f59e0b',
      PATCH: '#8b5cf6',
      DELETE: '#ef4444'
    };
    return colors[method] || '#6b7280';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Book size={32} style={{ color: '#0A3A6B' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0 }}>توثيق API</h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          دليل المطور للتكامل مع نظام يقين المحاسبي
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Key size={24} style={{ color: '#0A3A6B' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>المصادقة (Authentication)</h2>
          </div>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>
            يستخدم API نظام Supabase للمصادقة. تحتاج إلى مفتاحين للوصول:
          </p>
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontWeight: '600', color: '#334155' }}>API Key (Anon):</span>
              <code style={{ display: 'block', marginTop: '4px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'}
              </code>
            </div>
            <div>
              <span style={{ fontWeight: '600', color: '#334155' }}>Base URL:</span>
              <code style={{ display: 'block', marginTop: '4px', padding: '8px', background: 'white', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}>
                {apiBaseUrl}
              </code>
            </div>
          </div>
          <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '12px', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '14px' }}>
              <Lock size={18} />
              <span>
                <strong>مهم:</strong> جميع الطلبات تتطلب رأس Authorization مع Access Token صالح
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Database size={24} style={{ color: '#0A3A6B' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>قواعد البيانات والأمان</h2>
          </div>
          <ul style={{ margin: 0, paddingRight: '20px', color: '#64748b', lineHeight: '1.8' }}>
            <li>جميع الجداول محمية بواسطة Row Level Security (RLS)</li>
            <li>يجب أن يكون المستخدم مصادقًا للوصول إلى البيانات</li>
            <li>يمكن للمستخدمين الوصول فقط إلى البيانات المصرح لهم بها</li>
            <li>استخدم Supabase JS Client للحصول على أفضل تجربة تطوير</li>
          </ul>
        </div>
      </div>

      {endpoints.map((category, idx) => (
        <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={22} style={{ color: '#0A3A6B' }} />
            {category.category}
          </h3>

          {category.endpoints.map((endpoint, endpointIdx) => (
            <div key={endpointIdx} style={{ marginBottom: endpointIdx < category.endpoints.length - 1 ? '24px' : 0, paddingBottom: endpointIdx < category.endpoints.length - 1 ? '24px' : 0, borderBottom: endpointIdx < category.endpoints.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '700',
                  background: getMethodColor(endpoint.method),
                  color: 'white'
                }}>
                  {endpoint.method}
                </span>
                <code style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{endpoint.path}</code>
              </div>

              <p style={{ color: '#64748b', marginBottom: '12px', fontSize: '14px' }}>{endpoint.description}</p>

              {endpoint.params.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>المعاملات:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {endpoint.params.map((param, paramIdx) => (
                      <span key={paramIdx} style={{
                        padding: '3px 8px',
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#475569',
                        fontFamily: 'monospace'
                      }}>
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>مثال:</span>
                  <button
                    onClick={() => copyToClipboard(endpoint.example, `${idx}-${endpointIdx}`)}
                    style={{
                      padding: '4px 12px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: copiedEndpoint === `${idx}-${endpointIdx}` ? '#10b981' : '#64748b'
                    }}
                  >
                    {copiedEndpoint === `${idx}-${endpointIdx}` ? (
                      <>
                        <CheckCircle size={14} />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        نسخ
                      </>
                    )}
                  </button>
                </div>
                <pre style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  <code>{endpoint.example}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>مصادر إضافية</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <a href="https://supabase.com/docs/reference/javascript/introduction" target="_blank" rel="noopener noreferrer"
            style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#0A3A6B', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0' }}>
            <Book size={18} />
            <span style={{ fontWeight: '500' }}>توثيق Supabase JavaScript Client</span>
          </a>
          <a href="https://supabase.com/docs/guides/api" target="_blank" rel="noopener noreferrer"
            style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textDecoration: 'none', color: '#0A3A6B', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0' }}>
            <Database size={18} />
            <span style={{ fontWeight: '500' }}>دليل Supabase REST API</span>
          </a>
        </div>
      </div>
    </div>
  );
}
