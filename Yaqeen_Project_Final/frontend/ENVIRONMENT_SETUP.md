# إعداد متغيرات البيئة

## متطلبات Supabase

لتشغيل التطبيق مع قاعدة البيانات، تحتاج إلى إعداد متغيرات البيئة التالية:

### 1. إنشاء ملف .env

أنشئ ملف `.env` في مجلد `frontend` وأضف المتغيرات التالية:

```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. الحصول على بيانات Supabase

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. اذهب إلى Settings > API
4. انسخ:
   - **Project URL** → `REACT_APP_SUPABASE_URL`
   - **anon public** key → `REACT_APP_SUPABASE_ANON_KEY`

### 3. تشغيل الهجرات

```bash
# في مجلد supabase
supabase db push
```

### 4. التشغيل بدون Supabase

إذا لم تكن تريد استخدام Supabase حالياً، يمكن للتطبيق العمل في وضع Mock:

- سيظهر تحذير في console: "Supabase not configured. Using mock authentication."
- يمكنك تسجيل الدخول بأي بريد إلكتروني وكلمة مرور
- البيانات ستكون وهمية ولن تُحفظ

## مثال على ملف .env

```env
REACT_APP_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
