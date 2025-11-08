/*
  # إنشاء الجداول الأساسية لنظام يَقين المحاسبي

  ## الجداول الجديدة
  
  ### 1. `branches` - الفروع
    - `id` (uuid, primary key)
    - `name_ar` (text) - اسم الفرع بالعربية
    - `name_en` (text) - اسم الفرع بالإنجليزية
    - `vat_number` (text) - الرقم الضريبي
    - `cr_number` (text) - رقم السجل التجاري
    - `address` (text) - العنوان
    - `phone` (text) - رقم الهاتف
    - `is_active` (boolean) - حالة النشاط

  ### 2. `users_profile` - ملفات المستخدمين
    - `id` (uuid, primary key) - معرف المستخدم (مرتبط بـ auth.users)
    - `full_name` (text) - الاسم الكامل
    - `role` (text) - الدور (admin, manager, cashier, accountant, inventory_manager)
    - `phone` (text) - رقم الهاتف
    - `is_active` (boolean) - حالة النشاط
    - `branch_id` (uuid) - الفرع التابع له
    - `created_at` (timestamptz) - تاريخ الإنشاء
    - `updated_at` (timestamptz) - تاريخ آخر تحديث

  ### 3. `products` - المنتجات
    - `id` (uuid, primary key)
    - `sku` (text, unique) - رمز المنتج
    - `barcode` (text) - الباركود
    - `name_ar` (text) - الاسم بالعربية
    - `name_en` (text) - الاسم بالإنجليزية
    - `description` (text) - الوصف
    - `category` (text) - الفئة
    - `price` (numeric) - سعر البيع
    - `cost` (numeric) - التكلفة
    - `vat_rate` (numeric) - نسبة الضريبة (0.15 للسعودية)
    - `is_active` (boolean) - حالة النشاط

  ### 4. `inventory` - المخزون
    - `id` (uuid, primary key)
    - `product_id` (uuid) - معرف المنتج
    - `branch_id` (uuid) - معرف الفرع
    - `quantity` (numeric) - الكمية المتوفرة
    - `reserved_quantity` (numeric) - الكمية المحجوزة
    - `reorder_point` (numeric) - نقطة إعادة الطلب

  ### 5. `customers` - العملاء
    - `id` (uuid, primary key)
    - `name` (text) - الاسم
    - `phone` (text, unique) - رقم الهاتف
    - `email` (text) - البريد الإلكتروني
    - `vat_number` (text) - الرقم الضريبي (للشركات)
    - `loyalty_points` (numeric) - نقاط الولاء
    - `total_purchases` (numeric) - إجمالي المشتريات

  ### 6. `suppliers` - الموردون
    - `id` (uuid, primary key)
    - `name` (text) - الاسم
    - `phone` (text) - رقم الهاتف
    - `email` (text) - البريد الإلكتروني
    - `vat_number` (text) - الرقم الضريبي
    - `address` (text) - العنوان

  ## الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات للقراءة والكتابة حسب الصلاحيات
    - المستخدمون العاديون يمكنهم القراءة فقط
    - المدراء والإداريون يمكنهم الكتابة
*/

-- جدول الفروع
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  vat_number text,
  cr_number text,
  address text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- جدول ملفات المستخدمين
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'cashier',
  phone text,
  branch_id uuid REFERENCES branches(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'cashier', 'accountant', 'inventory_manager'))
);

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  barcode text,
  name_ar text NOT NULL,
  name_en text,
  description text,
  category text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  cost numeric(10,2) DEFAULT 0,
  vat_rate numeric(5,4) DEFAULT 0.15,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- جدول المخزون
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  quantity numeric(10,2) DEFAULT 0,
  reserved_quantity numeric(10,2) DEFAULT 0,
  reorder_point numeric(10,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(product_id, branch_id)
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text UNIQUE,
  email text,
  vat_number text,
  loyalty_points numeric(10,2) DEFAULT 0,
  total_purchases numeric(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- جدول الموردون
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  vat_number text,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للفروع
CREATE POLICY "Authenticated users can view branches"
  ON branches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage branches"
  ON branches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Admins can update branches"
  ON branches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- سياسات الأمان للمستخدمين
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON users_profile FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can update profiles"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- سياسات الأمان للمنتجات
CREATE POLICY "Authenticated users can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Managers can manage products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Managers can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

-- سياسات الأمان للمخزون
CREATE POLICY "Authenticated users can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authorized users can manage inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Authorized users can update inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

-- سياسات الأمان للعملاء
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- سياسات الأمان للموردين
CREATE POLICY "Authenticated users can view suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can insert suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Managers can update suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_branch ON inventory(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);
CREATE INDEX IF NOT EXISTS idx_users_profile_branch ON users_profile(branch_id);