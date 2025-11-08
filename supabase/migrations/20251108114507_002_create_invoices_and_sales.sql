/*
  # إنشاء جداول الفواتير والمبيعات

  ## الجداول الجديدة
  
  ### 1. `invoices` - الفواتير
    - `id` (uuid, primary key)
    - `invoice_number` (text, unique) - رقم الفاتورة
    - `invoice_type` (text) - نوع الفاتورة (sale, return, credit_note)
    - `customer_id` (uuid) - معرف العميل
    - `branch_id` (uuid) - معرف الفرع
    - `user_id` (uuid) - معرف المستخدم الذي أصدر الفاتورة
    - `invoice_date` (timestamptz) - تاريخ الفاتورة
    - `due_date` (timestamptz) - تاريخ الاستحقاق
    - `subtotal` (numeric) - المجموع قبل الضريبة
    - `vat_amount` (numeric) - مبلغ الضريبة
    - `discount_amount` (numeric) - مبلغ الخصم
    - `total_amount` (numeric) - المبلغ الإجمالي
    - `payment_status` (text) - حالة الدفع (paid, pending, partial, cancelled)
    - `payment_method` (text) - طريقة الدفع (cash, card, bank_transfer, wallet)
    - `notes` (text) - ملاحظات
    - `zatca_qr` (text) - رمز QR حسب ZATCA
    - `zatca_uuid` (text) - معرف ZATCA الفريد
    - `is_submitted_zatca` (boolean) - هل تم إرسالها لـ ZATCA

  ### 2. `invoice_items` - عناصر الفواتير
    - `id` (uuid, primary key)
    - `invoice_id` (uuid) - معرف الفاتورة
    - `product_id` (uuid) - معرف المنتج
    - `description` (text) - الوصف
    - `quantity` (numeric) - الكمية
    - `unit_price` (numeric) - سعر الوحدة
    - `vat_rate` (numeric) - نسبة الضريبة
    - `vat_amount` (numeric) - مبلغ الضريبة
    - `discount_amount` (numeric) - مبلغ الخصم
    - `line_total` (numeric) - المجموع

  ### 3. `payments` - المدفوعات
    - `id` (uuid, primary key)
    - `invoice_id` (uuid) - معرف الفاتورة
    - `payment_date` (timestamptz) - تاريخ الدفع
    - `amount` (numeric) - المبلغ
    - `payment_method` (text) - طريقة الدفع
    - `reference_number` (text) - رقم المرجع (للتحويلات/البطاقات)
    - `user_id` (uuid) - المستخدم الذي سجل الدفع

  ### 4. `cash_shifts` - الورديات
    - `id` (uuid, primary key)
    - `branch_id` (uuid) - معرف الفرع
    - `user_id` (uuid) - معرف المستخدم
    - `shift_start` (timestamptz) - بداية الوردية
    - `shift_end` (timestamptz) - نهاية الوردية
    - `opening_balance` (numeric) - الرصيد الافتتاحي
    - `closing_balance` (numeric) - الرصيد الختامي
    - `expected_cash` (numeric) - النقد المتوقع
    - `actual_cash` (numeric) - النقد الفعلي
    - `variance` (numeric) - الفرق
    - `status` (text) - الحالة (open, closed)

  ### 5. `audit_log` - سجل التدقيق
    - `id` (uuid, primary key)
    - `user_id` (uuid) - المستخدم
    - `action` (text) - الإجراء
    - `table_name` (text) - اسم الجدول
    - `record_id` (uuid) - معرف السجل
    - `old_data` (jsonb) - البيانات القديمة
    - `new_data` (jsonb) - البيانات الجديدة
    - `created_at` (timestamptz) - وقت الإجراء

  ## الأمان
    - تفعيل RLS على جميع الجداول
    - الموظفون يمكنهم إنشاء الفواتير
    - الإداريون فقط يمكنهم الحذف
    - سجل التدقيق للقراءة فقط للإداريين
*/

-- جدول الفواتير
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  invoice_type text NOT NULL DEFAULT 'sale',
  customer_id uuid REFERENCES customers(id),
  branch_id uuid REFERENCES branches(id) NOT NULL,
  user_id uuid REFERENCES users_profile(id) NOT NULL,
  invoice_date timestamptz DEFAULT now(),
  due_date timestamptz,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  vat_amount numeric(12,2) DEFAULT 0,
  discount_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_method text,
  notes text,
  zatca_qr text,
  zatca_uuid text,
  is_submitted_zatca boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_invoice_type CHECK (invoice_type IN ('sale', 'return', 'credit_note')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('paid', 'pending', 'partial', 'cancelled'))
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- جدول عناصر الفواتير
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id),
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  vat_rate numeric(5,4) DEFAULT 0.15,
  vat_amount numeric(10,2) DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- جدول المدفوعات
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  payment_date timestamptz DEFAULT now(),
  amount numeric(12,2) NOT NULL,
  payment_method text NOT NULL,
  reference_number text,
  user_id uuid REFERENCES users_profile(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'wallet', 'split'))
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- جدول الورديات
CREATE TABLE IF NOT EXISTS cash_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES branches(id) NOT NULL,
  user_id uuid REFERENCES users_profile(id) NOT NULL,
  shift_start timestamptz DEFAULT now(),
  shift_end timestamptz,
  opening_balance numeric(12,2) DEFAULT 0,
  closing_balance numeric(12,2),
  expected_cash numeric(12,2),
  actual_cash numeric(12,2),
  variance numeric(12,2),
  status text DEFAULT 'open',
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_shift_status CHECK (status IN ('open', 'closed'))
);

ALTER TABLE cash_shifts ENABLE ROW LEVEL SECURITY;

-- جدول سجل التدقيق
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للفواتير
CREATE POLICY "Authenticated users can view invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update own invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- سياسات الأمان لعناصر الفواتير
CREATE POLICY "Users can view invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
    )
  );

CREATE POLICY "Staff can insert invoice items"
  ON invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update invoice items"
  ON invoice_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات الأمان للمدفوعات
CREATE POLICY "Users can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can record payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسات الأمان للورديات
CREATE POLICY "Users can view own shifts"
  ON cash_shifts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view all shifts"
  ON cash_shifts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Staff can create shifts"
  ON cash_shifts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can update own shifts"
  ON cash_shifts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- سياسات الأمان لسجل التدقيق
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'accountant')
    )
  );

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- إنشاء indexes للأداء
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_branch ON invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_user ON cash_shifts(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_branch ON cash_shifts(branch_id);
CREATE INDEX IF NOT EXISTS idx_cash_shifts_status ON cash_shifts(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- Function لتوليد رقم فاتورة تلقائي
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year text;
  seq_num integer;
  new_number text;
BEGIN
  year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM '\d+$') AS integer)
  ), 0) + 1
  INTO seq_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year || '-%';
  
  new_number := 'INV-' || year || '-' || LPAD(seq_num::text, 5, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function لتحديث إجمالي الفاتورة تلقائيا
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET 
    subtotal = (
      SELECT COALESCE(SUM(line_total - vat_amount), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    ),
    vat_amount = (
      SELECT COALESCE(SUM(vat_amount), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    ),
    total_amount = (
      SELECT COALESCE(SUM(line_total), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    )
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث إجماليات الفاتورة عند إضافة/تعديل/حذف عناصر
CREATE TRIGGER trigger_update_invoice_totals_insert
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER trigger_update_invoice_totals_update
AFTER UPDATE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER trigger_update_invoice_totals_delete
AFTER DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

-- Function لتسجيل التدقيق التلقائي
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تطبيق Audit Trail على الجداول المهمة
CREATE TRIGGER audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION log_audit_trail();