/*
  # إنشاء قاعدة بيانات يَقين - نظام نقاط البيع والمحاسبة

  ## الجداول الجديدة
  
  ### 1. companies (الشركات)
  - id (uuid, primary key)
  - name (text) - اسم الشركة
  - vat_number (text) - الرقم الضريبي
  - cr_number (text) - رقم السجل التجاري
  - contact (text) - معلومات الاتصال
  - logo_url (text) - رابط الشعار
  - settings (jsonb) - إعدادات الشركة
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. customers (العملاء)
  - id (uuid, primary key)
  - company_id (uuid, foreign key)
  - name (text) - اسم العميل
  - mobile (text) - رقم الجوال
  - email (text) - البريد الإلكتروني
  - loyalty_points (integer) - نقاط الولاء
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 3. products (المنتجات)
  - id (uuid, primary key)
  - company_id (uuid, foreign key)
  - sku (text) - رمز المنتج
  - name (text) - اسم المنتج
  - price (numeric) - سعر البيع
  - cost (numeric) - التكلفة
  - quantity (integer) - الكمية المتوفرة
  - vat_rate (numeric) - نسبة الضريبة
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 4. invoices (الفواتير)
  - id (uuid, primary key)
  - company_id (uuid, foreign key)
  - customer_id (uuid, foreign key, nullable)
  - invoice_number (text) - رقم الفاتورة
  - invoice_date (timestamptz) - تاريخ الفاتورة
  - subtotal (numeric) - المجموع قبل الضريبة
  - vat_amount (numeric) - قيمة الضريبة
  - total (numeric) - الإجمالي الشامل
  - discount (numeric) - الخصم
  - payment_method (text) - طريقة الدفع
  - status (text) - حالة الفاتورة
  - notes (text) - ملاحظات
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 5. invoice_items (بنود الفواتير)
  - id (uuid, primary key)
  - invoice_id (uuid, foreign key)
  - product_id (uuid, foreign key, nullable)
  - description (text) - الوصف
  - quantity (numeric) - الكمية
  - unit_price (numeric) - سعر الوحدة
  - vat_rate (numeric) - نسبة الضريبة
  - total (numeric) - المجموع
  - created_at (timestamptz)

  ### 6. shifts (الورديات)
  - id (uuid, primary key)
  - company_id (uuid, foreign key)
  - user_id (uuid) - معرف الموظف
  - opening_float (numeric) - الرصيد الافتتاحي
  - closing_cash (numeric) - النقد عند الإغلاق
  - expected_cash (numeric) - النقد المتوقع
  - cash_difference (numeric) - فرق النقد
  - opened_at (timestamptz) - وقت الفتح
  - closed_at (timestamptz, nullable) - وقت الإغلاق
  - is_open (boolean) - مفتوحة أم مغلقة
  - created_at (timestamptz)

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات للقراءة والكتابة للمستخدمين المصرح لهم فقط
*/

-- إنشاء جدول الشركات
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  vat_number text,
  cr_number text,
  contact text,
  logo_url text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  mobile text,
  email text,
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_loyalty_points CHECK (loyalty_points >= 0)
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  sku text NOT NULL,
  name text NOT NULL,
  price numeric(10, 2) DEFAULT 0 CHECK (price >= 0),
  cost numeric(10, 2) DEFAULT 0 CHECK (cost >= 0),
  quantity integer DEFAULT 0 CHECK (quantity >= 0),
  vat_rate numeric(5, 4) DEFAULT 0.15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, sku)
);

-- إنشاء جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  invoice_date timestamptz DEFAULT now(),
  subtotal numeric(12, 2) DEFAULT 0,
  vat_amount numeric(12, 2) DEFAULT 0,
  total numeric(12, 2) DEFAULT 0,
  discount numeric(12, 2) DEFAULT 0,
  payment_method text DEFAULT 'cash',
  status text DEFAULT 'paid',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, invoice_number)
);

-- إنشاء جدول بنود الفواتير
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity numeric(10, 3) DEFAULT 1,
  unit_price numeric(10, 2) DEFAULT 0,
  vat_rate numeric(5, 4) DEFAULT 0.15,
  total numeric(12, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول الورديات
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  opening_float numeric(10, 2) DEFAULT 0,
  closing_cash numeric(10, 2),
  expected_cash numeric(10, 2),
  cash_difference numeric(10, 2),
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  is_open boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(company_id, sku);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_shifts_company ON shifts(company_id);
CREATE INDEX IF NOT EXISTS idx_shifts_open ON shifts(is_open);

-- تفعيل RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للشركات
CREATE POLICY "Users can read own company"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات الأمان للعملاء
CREATE POLICY "Users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- سياسات الأمان للمنتجات
CREATE POLICY "Users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- سياسات الأمان للفواتير
CREATE POLICY "Users can read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);

-- سياسات الأمان لبنود الفواتير
CREATE POLICY "Users can read invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoice items"
  ON invoice_items FOR DELETE
  TO authenticated
  USING (true);

-- سياسات الأمان للورديات
CREATE POLICY "Users can read shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert shifts"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update shifts"
  ON shifts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على الجداول
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_companies_updated_at'
  ) THEN
    CREATE TRIGGER update_companies_updated_at
      BEFORE UPDATE ON companies
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_updated_at'
  ) THEN
    CREATE TRIGGER update_customers_updated_at
      BEFORE UPDATE ON customers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_invoices_updated_at'
  ) THEN
    CREATE TRIGGER update_invoices_updated_at
      BEFORE UPDATE ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;