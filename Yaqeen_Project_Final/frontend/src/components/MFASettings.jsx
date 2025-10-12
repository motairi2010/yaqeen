import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Key, CheckCircle, XCircle, Copy } from 'lucide-react';
import QRCode from 'qrcode';

export default function MFASettings() {
  const { user, enrollMFA, verifyMFA, unenrollMFA, listMFAFactors } = useAuth();
  const [mfaFactors, setMfaFactors] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showEnrollment, setShowEnrollment] = useState(false);

  useEffect(() => {
    loadMFAFactors();
  }, []);

  useEffect(() => {
    if (enrollmentData?.totp?.qr_code) {
      generateQRCode(enrollmentData.totp.qr_code);
    }
  }, [enrollmentData]);

  const loadMFAFactors = async () => {
    const { data, error } = await listMFAFactors();
    if (!error && data) {
      setMfaFactors(data.all || []);
    }
  };

  const generateQRCode = async (otpauth) => {
    try {
      const url = await QRCode.toDataURL(otpauth);
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleEnrollMFA = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { data, error } = await enrollMFA();

    if (error) {
      setMessage({ type: 'error', text: 'فشل التسجيل في المصادقة متعددة العوامل: ' + error.message });
      setLoading(false);
      return;
    }

    setEnrollmentData(data);
    setShowEnrollment(true);
    setLoading(false);
  };

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'الرجاء إدخال رمز مكون من 6 أرقام' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const { data, error } = await verifyMFA(enrollmentData.id, verificationCode);

    if (error) {
      setMessage({ type: 'error', text: 'فشل التحقق: ' + error.message });
      setLoading(false);
      return;
    }

    setMessage({ type: 'success', text: 'تم تفعيل المصادقة متعددة العوامل بنجاح!' });
    setVerificationCode('');
    setShowEnrollment(false);
    setEnrollmentData(null);
    setQrCodeUrl('');
    setLoading(false);
    await loadMFAFactors();
  };

  const handleUnenrollMFA = async (factorId) => {
    if (!window.confirm('هل أنت متأكد من تعطيل المصادقة متعددة العوامل؟')) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await unenrollMFA(factorId);

    if (error) {
      setMessage({ type: 'error', text: 'فشل إلغاء التسجيل: ' + error.message });
      setLoading(false);
      return;
    }

    setMessage({ type: 'success', text: 'تم تعطيل المصادقة متعددة العوامل' });
    setLoading(false);
    await loadMFAFactors();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'تم النسخ إلى الحافظة' });
    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
  };

  const verifiedFactors = mfaFactors.filter(f => f.status === 'verified');

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Shield size={28} style={{ color: '#0A3A6B' }} />
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>المصادقة متعددة العوامل (MFA)</h3>
          <p style={{ color: '#64748b', fontSize: '14px' }}>حماية إضافية لحسابك باستخدام تطبيق المصادقة</p>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {verifiedFactors.length === 0 && !showEnrollment && (
        <div style={{
          padding: '24px',
          border: '2px dashed #e2e8f0',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <Shield size={48} style={{ color: '#94a3b8', marginBottom: '12px', marginLeft: 'auto', marginRight: 'auto' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>المصادقة متعددة العوامل غير مفعلة</h4>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
            قم بتفعيل المصادقة متعددة العوامل لحماية حسابك بطبقة أمان إضافية
          </p>
          <button
            onClick={handleEnrollMFA}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: '#0A3A6B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'جارٍ التحميل...' : 'تفعيل المصادقة متعددة العوامل'}
          </button>
        </div>
      )}

      {showEnrollment && enrollmentData && (
        <div style={{
          padding: '24px',
          border: '2px solid #0A3A6B',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>إعداد المصادقة متعددة العوامل</h4>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ marginBottom: '12px', fontWeight: '500' }}>الخطوة 1: امسح رمز QR</p>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              استخدم تطبيق المصادقة (مثل Google Authenticator أو Microsoft Authenticator) لمسح الرمز:
            </p>
            {qrCodeUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '200px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ marginBottom: '8px', fontWeight: '500' }}>أو أدخل الرمز يدويًا:</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}>
              <code style={{ flex: 1 }}>{enrollmentData.totp?.secret}</code>
              <button
                onClick={() => copyToClipboard(enrollmentData.totp?.secret)}
                style={{
                  padding: '6px 12px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Copy size={16} />
                نسخ
              </button>
            </div>
          </div>

          <form onSubmit={handleVerifyMFA}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                الخطوة 2: أدخل رمز التحقق المكون من 6 أرقام
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  letterSpacing: '0.5em',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#0A3A6B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading || verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                  opacity: loading || verificationCode.length !== 6 ? 0.6 : 1
                }}
              >
                {loading ? 'جارٍ التحقق...' : 'تحقق وتفعيل'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEnrollment(false);
                  setEnrollmentData(null);
                  setVerificationCode('');
                  setQrCodeUrl('');
                }}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {verifiedFactors.length > 0 && (
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>الأجهزة المفعلة</h4>
          {verifiedFactors.map((factor) => (
            <div key={factor.id} style={{
              padding: '16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '10px',
                  background: '#d1fae5',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Key size={20} style={{ color: '#065f46' }} />
                </div>
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                    {factor.friendly_name || 'جهاز المصادقة'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    تم التفعيل في: {new Date(factor.created_at).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleUnenrollMFA(factor.id)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                تعطيل
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#0369a1' }}>
          معلومات مهمة
        </h5>
        <ul style={{ margin: 0, paddingRight: '20px', fontSize: '13px', color: '#0c4a6e', lineHeight: '1.6' }}>
          <li>احتفظ برموز الاحتياط في مكان آمن</li>
          <li>استخدم تطبيق مصادقة موثوق مثل Google Authenticator</li>
          <li>ستحتاج إلى رمز التحقق في كل مرة تسجل دخولك</li>
          <li>إذا فقدت هاتفك، اتصل بالدعم الفني لاستعادة الوصول</li>
        </ul>
      </div>
    </div>
  );
}
