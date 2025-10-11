/*
  # إنشاء جداول نظام يَقين المحاسبي

  ## 1. الجداول الرئيسية
  
  ### جدول المستخدمين (users_profile)
  - `id` (uuid) - معرّف المستخدم من auth.users
  - `full_name` (text) - الاسم الكامل
  - `role` (text) - الدور: admin, manager, cashier, accountant
  - `phone` (text) - رقم الجوال
  - `is_active` (boolean) - حالة التفعيل
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `updated_at` (timestamptz) - تاريخ التحديث

  ### جدول الفروع (branches)
  - `id` (uuid) - المعرّف الفريد
  - `name` (text) - اسم الفرع
  - `name_en` (text) - الاسم بالإنجليزية
  - `address` (text) - العنوان
  - `city` (text) - المدينة
  - `phone` (text) - رقم التواصل
  - `vat_number` (text) - الرقم الضريبي
  - `cr_number` (text) - رقم السجل التجاري
  - `is_active` (boolean) - حالة التفعيل
  - `created_at` (timestamptz)

  ### جدول الفئات (categories)
  - `id` (uuid) - المعرّف
  - `name` (text) - اسم الفئة
  - `name_en` (text) - الاسم بالإنجليزية
  - `description` (text) - الوصف
  - `parent_id` (uuid) - الفئة الأب (للفئات الفرعية)
  - `sort_order` (integer) - ترتيب العرض
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### جدول المنتجات (products)
  - `id` (uuid) - المعرّف
  - `sku` (text) - كود المنتج
  - `barcode` (text) - الباركود
  - `name` (text) - اسم المنتج
  - `name_en` (text) - الاسم بالإنجليزية
  - `description` (text) - الوصف
  - `category_id` (uuid) - الفئة
  - `cost_price` (decimal) - سعر التكلفة
  - `sale_price` (decimal) - سعر البيع
  - `vat_rate` (decimal) - نسبة الضريبة (0.15 = 15%)
  - `unit` (text) - الوحدة (قطعة، كيلو، لتر، إلخ)
  - `image_url` (text) - رابط الصورة
  - `is_active` (boolean)
  - `track_inventory` (boolean) - تتبع المخزون
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### جدول المخزون (inventory)
  - `id` (uuid) - المعرّف
  - `product_id` (uuid) - المنتج
  - `branch_id` (uuid) - الفرع
  - `quantity` (decimal) - الكمية الحالية
  - `min_quantity` (decimal) - الحد الأدنى
  - `max_quantity` (decimal) - الحد الأقصى
  - `last_updated` (timestamptz)

  ### جدول العملاء (customers)
  - `id` (uuid) - المعرّف
  - `name` (text) - الاسم
  - `phone` (text) - رقم الجوال (فريد)
  - `email` (text) - البريد الإلكتروني
  - `address` (text) - العنوان
  - `city` (text) - المدينة
  - `tax_number` (text) - الرقم الضريبي
  - `loyalty_points` (integer) - نقاط الولاء
  - `total_purchases` (decimal) - إجمالي المشتريات
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### جدول الفواتير (invoices)
  - `id` (uuid) - المعرّف
  - `invoice_number` (text) - رقم الفاتورة (فريد)
  - `invoice_type` (text) - نوع الفاتورة: sale, return, purchase
  - `customer_id` (uuid) - العميل
  - `branch_id` (uuid) - الفرع
  - `user_id` (uuid) - الموظف
  - `invoice_date` (timestamptz) - تاريخ الفاتورة
  - `due_date` (date) - تاريخ الاستحقاق
  - `subtotal` (decimal) - الإجمالي قبل الضريبة
  - `vat_amount` (decimal) - قيمة الضريبة
  - `discount_amount` (decimal) - قيمة الخصم
  - `total_amount` (decimal) - الإجمالي النهائي
  - `payment_status` (text) - حالة الدفع: paid, partial, unpaid
  - `payment_method` (text) - طريقة الدفع: cash, card, bank, wallet
  - `notes` (text) - ملاحظات
  - `zatca_qr` (text) - QR Code للفاتورة الإلكترونية
  - `zatca_uuid` (text) - معرّف ZATCA
  - `is_cancelled` (boolean) - ملغاة
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### جدول تفاصيل الفواتير (invoice_items)
  - `id` (uuid) - المعرّف
  - `invoice_id` (uuid) - الفاتورة
  - `product_id` (uuid) - المنتج
  - `description` (text) - الوصف
  - `quantity` (decimal) - الكمية
  - `unit_price` (decimal) - سعر الوحدة
  - `vat_rate` (decimal) - نسبة الضريبة
  - `vat_amount` (decimal) - قيمة الضريبة
  - `discount_amount` (decimal) - الخصم
  - `total_amount` (decimal) - الإجمالي
  - `created_at` (timestamptz)

  ### جدول الورديات (shifts)
  - `id` (uuid) - المعرّف
  - `user_id` (uuid) - الموظف
  - `branch_id` (uuid) - الفرع
  - `start_time` (timestamptz) - وقت البداية
  - `end_time` (timestamptz) - وقت النهاية
  - `opening_cash` (decimal) - رصيد الافتتاح
  - `closing_cash` (decimal) - رصيد الإغلاق
  - `total_sales` (decimal) - إجمالي المبيعات
  - `cash_sales` (decimal) - مبيعات نقدي
  - `card_sales` (decimal) - مبيعات بطاقة
  - `status` (text) - الحالة: open, closed
  - `notes` (text) - ملاحظات
  - `created_at` (timestamptz)

  ### جدول الموردين (suppliers)
  - `id` (uuid) - المعرّف
  - `name` (text) - اسم المورد
  - `contact_person` (text) - جهة الاتصال
  - `phone` (text) - رقم الجوال
  - `email` (text) - البريد الإلكتروني
  - `address` (text) - العنوان
  - `tax_number` (text) - الرقم الضريبي
  - `payment_terms` (text) - شروط الدفع
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ## 2. الأمان
  - تفعيل RLS على جميع الجداول
  - إضافة سياسات الوصول حسب الأدوار

  ## 3. الفهارس
  - إضافة فهارس على الأعمدة المستخدمة بكثرة
*/

-- إنشاء جدول ملفات المستخدمين
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier', 'accountant')),
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الفروع
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  address text,
  city text,
  phone text,
  vat_number text,
  cr_number text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  barcode text UNIQUE,
  name text NOT NULL,
  name_en text,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  cost_price decimal(10,2) DEFAULT 0,
  sale_price decimal(10,2) NOT NULL,
  vat_rate decimal(5,4) DEFAULT 0.15,
  unit text DEFAULT 'قطعة',
  image_url text,
  is_active boolean DEFAULT true,
  track_inventory boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المخزون
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  quantity decimal(10,2) DEFAULT 0,
  min_quantity decimal(10,2) DEFAULT 0,
  max_quantity decimal(10,2) DEFAULT 1000,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(product_id, branch_id)
);

-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE NOT NULL,
  email text,
  address text,
  city text,
  tax_number text,
  loyalty_points integer DEFAULT 0,
  total_purchases decimal(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول الموردين
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  tax_number text,
  payment_terms text DEFAULT 'نقدي',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  invoice_type text DEFAULT 'sale' CHECK (invoice_type IN ('sale', 'return', 'purchase')),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invoice_date timestamptz DEFAULT now(),
  due_date date,
  subtotal decimal(12,2) DEFAULT 0,
  vat_amount decimal(12,2) DEFAULT 0,
  discount_amount decimal(12,2) DEFAULT 0,
  total_amount decimal(12,2) DEFAULT 0,
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
  payment_method text CHECK (payment_method IN ('cash', 'card', 'bank', 'wallet', 'mixed')),
  notes text,
  zatca_qr text,
  zatca_uuid text,
  is_cancelled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول تفاصيل الفواتير
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  description text NOT NULL,
  quantity decimal(10,2) NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  vat_rate decimal(5,4) DEFAULT 0.15,
  vat_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول الورديات
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  opening_cash decimal(10,2) DEFAULT 0,
  closing_cash decimal(10,2),
  total_sales decimal(12,2) DEFAULT 0,
  cash_sales decimal(12,2) DEFAULT 0,
  card_sales decimal(12,2) DEFAULT 0,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- إضافة الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_branch ON inventory(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- تفعيل Row Level Security
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول للمستخدمين المصادق عليهم
-- users_profile
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- branches (الكل يمكنه القراءة، المديرون فقط يمكنهم التعديل)
CREATE POLICY "Anyone can view active branches"
  ON branches FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage branches"
  ON branches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- inventory
CREATE POLICY "Anyone can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- customers
CREATE POLICY "Anyone can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- suppliers
CREATE POLICY "Anyone can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage suppliers"
  ON suppliers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- invoices
CREATE POLICY "Anyone can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Staff can update own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role IN ('admin', 'manager', 'accountant')
  ));

-- invoice_items
CREATE POLICY "Anyone can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage invoice items"
  ON invoice_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- shifts
CREATE POLICY "Users can view own shifts"
  ON shifts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  ));

CREATE POLICY "Users can manage own shifts"
  ON shifts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());