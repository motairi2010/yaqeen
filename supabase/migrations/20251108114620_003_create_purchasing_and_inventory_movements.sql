/*
  # إنشاء جداول المشتريات وحركة المخزون

  ## الجداول الجديدة
  
  ### 1. `purchase_orders` - طلبات الشراء
    - `id` (uuid, primary key)
    - `po_number` (text, unique) - رقم طلب الشراء
    - `supplier_id` (uuid) - معرف المورد
    - `branch_id` (uuid) - معرف الفرع
    - `user_id` (uuid) - المستخدم الذي أنشأ الطلب
    - `order_date` (timestamptz) - تاريخ الطلب
    - `expected_date` (timestamptz) - تاريخ التسليم المتوقع
    - `received_date` (timestamptz) - تاريخ الاستلام الفعلي
    - `subtotal` (numeric) - المجموع قبل الضريبة
    - `vat_amount` (numeric) - مبلغ الضريبة
    - `total_amount` (numeric) - المبلغ الإجمالي
    - `status` (text) - الحالة (draft, sent, partial, received, cancelled)
    - `notes` (text) - ملاحظات

  ### 2. `purchase_order_items` - عناصر طلبات الشراء
    - `id` (uuid, primary key)
    - `po_id` (uuid) - معرف طلب الشراء
    - `product_id` (uuid) - معرف المنتج
    - `description` (text) - الوصف
    - `quantity_ordered` (numeric) - الكمية المطلوبة
    - `quantity_received` (numeric) - الكمية المستلمة
    - `unit_cost` (numeric) - تكلفة الوحدة
    - `vat_rate` (numeric) - نسبة الضريبة
    - `line_total` (numeric) - المجموع

  ### 3. `stock_movements` - حركات المخزون
    - `id` (uuid, primary key)
    - `product_id` (uuid) - معرف المنتج
    - `branch_id` (uuid) - معرف الفرع
    - `movement_type` (text) - نوع الحركة (purchase, sale, return, adjustment, transfer)
    - `reference_type` (text) - نوع المرجع (invoice, purchase_order, adjustment)
    - `reference_id` (uuid) - معرف المرجع
    - `quantity` (numeric) - الكمية (موجبة للوارد، سالبة للصادر)
    - `cost_per_unit` (numeric) - التكلفة للوحدة
    - `movement_date` (timestamptz) - تاريخ الحركة
    - `user_id` (uuid) - المستخدم الذي سجل الحركة
    - `notes` (text) - ملاحظات

  ### 4. `stock_adjustments` - تسويات المخزون
    - `id` (uuid, primary key)
    - `branch_id` (uuid) - معرف الفرع
    - `adjustment_date` (timestamptz) - تاريخ التسوية
    - `adjustment_type` (text) - نوع التسوية (stocktake, damage, theft, correction)
    - `user_id` (uuid) - المستخدم
    - `approved_by` (uuid) - من وافق على التسوية
    - `notes` (text) - ملاحظات
    - `status` (text) - الحالة (draft, approved, rejected)

  ### 5. `stock_adjustment_items` - عناصر التسويات
    - `id` (uuid, primary key)
    - `adjustment_id` (uuid) - معرف التسوية
    - `product_id` (uuid) - معرف المنتج
    - `expected_quantity` (numeric) - الكمية المتوقعة
    - `actual_quantity` (numeric) - الكمية الفعلية
    - `variance` (numeric) - الفرق
    - `reason` (text) - السبب

  ### 6. `promotions` - العروض الترويجية
    - `id` (uuid, primary key)
    - `name` (text) - اسم العرض
    - `description` (text) - الوصف
    - `promo_type` (text) - نوع العرض (percentage, fixed_amount, buy_x_get_y)
    - `discount_value` (numeric) - قيمة الخصم
    - `start_date` (timestamptz) - تاريخ البداية
    - `end_date` (timestamptz) - تاريخ النهاية
    - `min_purchase_amount` (numeric) - الحد الأدنى للشراء
    - `max_discount` (numeric) - الحد الأقصى للخصم
    - `is_active` (boolean) - حالة النشاط
    - `applicable_products` (jsonb) - المنتجات المشمولة
    - `applicable_categories` (jsonb) - الفئات المشمولة

  ## الأمان
    - تفعيل RLS على جميع الجداول
    - سياسات أمان مناسبة لكل جدول
*/

-- جدول طلبات الشراء
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) NOT NULL,
  branch_id uuid REFERENCES branches(id) NOT NULL,
  user_id uuid REFERENCES users_profile(id) NOT NULL,
  order_date timestamptz DEFAULT now(),
  expected_date timestamptz,
  received_date timestamptz,
  subtotal numeric(12,2) DEFAULT 0,
  vat_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  status text DEFAULT 'draft',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_po_status CHECK (status IN ('draft', 'sent', 'partial', 'received', 'cancelled'))
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

-- جدول عناصر طلبات الشراء
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  description text,
  quantity_ordered numeric(10,2) NOT NULL,
  quantity_received numeric(10,2) DEFAULT 0,
  unit_cost numeric(10,2) NOT NULL,
  vat_rate numeric(5,4) DEFAULT 0.15,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- جدول حركات المخزون
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) NOT NULL,
  branch_id uuid REFERENCES branches(id) NOT NULL,
  movement_type text NOT NULL,
  reference_type text,
  reference_id uuid,
  quantity numeric(10,2) NOT NULL,
  cost_per_unit numeric(10,2),
  movement_date timestamptz DEFAULT now(),
  user_id uuid REFERENCES users_profile(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer'))
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- جدول تسويات المخزون
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid REFERENCES branches(id) NOT NULL,
  adjustment_date timestamptz DEFAULT now(),
  adjustment_type text NOT NULL,
  user_id uuid REFERENCES users_profile(id) NOT NULL,
  approved_by uuid REFERENCES users_profile(id),
  notes text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_adjustment_type CHECK (adjustment_type IN ('stocktake', 'damage', 'theft', 'correction', 'expiry')),
  CONSTRAINT valid_adjustment_status CHECK (status IN ('draft', 'approved', 'rejected'))
);

ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;

-- جدول عناصر التسويات
CREATE TABLE IF NOT EXISTS stock_adjustment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adjustment_id uuid REFERENCES stock_adjustments(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  expected_quantity numeric(10,2) NOT NULL,
  actual_quantity numeric(10,2) NOT NULL,
  variance numeric(10,2) GENERATED ALWAYS AS (actual_quantity - expected_quantity) STORED,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_adjustment_items ENABLE ROW LEVEL SECURITY;

-- جدول العروض الترويجية
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  promo_type text NOT NULL,
  discount_value numeric(10,2),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  min_purchase_amount numeric(10,2) DEFAULT 0,
  max_discount numeric(10,2),
  is_active boolean DEFAULT true,
  applicable_products jsonb DEFAULT '[]'::jsonb,
  applicable_categories jsonb DEFAULT '[]'::jsonb,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_promo_type CHECK (promo_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'))
);

ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لطلبات الشراء
CREATE POLICY "Authorized users can view purchase orders"
  ON purchase_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager', 'accountant')
    )
  );

CREATE POLICY "Authorized users can create purchase orders"
  ON purchase_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Authorized users can update purchase orders"
  ON purchase_orders FOR UPDATE
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

-- سياسات الأمان لعناصر طلبات الشراء
CREATE POLICY "Users can view PO items"
  ON purchase_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager', 'accountant')
    )
  );

CREATE POLICY "Authorized users can manage PO items"
  ON purchase_order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

-- سياسات الأمان لحركات المخزون
CREATE POLICY "Users can view stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert stock movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- سياسات الأمان للتسويات
CREATE POLICY "Authorized users can view adjustments"
  ON stock_adjustments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Inventory managers can create adjustments"
  ON stock_adjustments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Authorized users can update adjustments"
  ON stock_adjustments FOR UPDATE
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

-- سياسات الأمان لعناصر التسويات
CREATE POLICY "Users can view adjustment items"
  ON stock_adjustment_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

CREATE POLICY "Authorized users can manage adjustment items"
  ON stock_adjustment_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager', 'inventory_manager')
    )
  );

-- سياسات الأمان للعروض
CREATE POLICY "Everyone can view active promotions"
  ON promotions FOR SELECT
  TO authenticated
  USING (is_active = true AND CURRENT_TIMESTAMP BETWEEN start_date AND end_date);

CREATE POLICY "Managers can manage promotions"
  ON promotions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role IN ('admin', 'manager')
    )
  );

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_purchase_orders_number ON purchase_orders(po_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_branch ON purchase_orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_po_items_product ON purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_branch ON stock_movements(branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_adjustments_branch ON stock_adjustments(branch_id);
CREATE INDEX IF NOT EXISTS idx_adjustments_status ON stock_adjustments(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);

-- Function لتوليد رقم طلب شراء
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS text AS $$
DECLARE
  year text;
  seq_num integer;
  new_number text;
BEGIN
  year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(po_number FROM '\d+$') AS integer)
  ), 0) + 1
  INTO seq_num
  FROM purchase_orders
  WHERE po_number LIKE 'PO-' || year || '-%';
  
  new_number := 'PO-' || year || '-' || LPAD(seq_num::text, 5, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function لتحديث المخزون عند استلام طلب شراء
CREATE OR REPLACE FUNCTION update_inventory_on_receipt()
RETURNS TRIGGER AS $$
BEGIN
  -- تحديث المخزون
  INSERT INTO inventory (product_id, branch_id, quantity, last_updated)
  SELECT 
    poi.product_id,
    po.branch_id,
    poi.quantity_received,
    NOW()
  FROM purchase_order_items poi
  JOIN purchase_orders po ON po.id = poi.po_id
  WHERE poi.id = NEW.id
  ON CONFLICT (product_id, branch_id)
  DO UPDATE SET
    quantity = inventory.quantity + EXCLUDED.quantity,
    last_updated = NOW();
  
  -- تسجيل حركة المخزون
  INSERT INTO stock_movements (
    product_id,
    branch_id,
    movement_type,
    reference_type,
    reference_id,
    quantity,
    cost_per_unit,
    movement_date,
    user_id
  )
  SELECT 
    NEW.product_id,
    po.branch_id,
    'purchase',
    'purchase_order',
    NEW.po_id,
    NEW.quantity_received - OLD.quantity_received,
    NEW.unit_cost,
    NOW(),
    po.user_id
  FROM purchase_orders po
  WHERE po.id = NEW.po_id
  AND NEW.quantity_received > OLD.quantity_received;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث المخزون عند استلام البضاعة
CREATE TRIGGER trigger_update_inventory_on_receipt
AFTER UPDATE OF quantity_received ON purchase_order_items
FOR EACH ROW
WHEN (NEW.quantity_received > OLD.quantity_received)
EXECUTE FUNCTION update_inventory_on_receipt();

-- Function لتحديث المخزون من حركة البيع
CREATE OR REPLACE FUNCTION update_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- خصم الكمية من المخزون
    UPDATE inventory
    SET 
      quantity = quantity - NEW.quantity,
      last_updated = NOW()
    WHERE product_id = NEW.product_id
    AND branch_id = (SELECT branch_id FROM invoices WHERE id = NEW.invoice_id);
    
    -- تسجيل حركة المخزون
    INSERT INTO stock_movements (
      product_id,
      branch_id,
      movement_type,
      reference_type,
      reference_id,
      quantity,
      cost_per_unit,
      movement_date,
      user_id
    )
    SELECT 
      NEW.product_id,
      inv.branch_id,
      'sale',
      'invoice',
      NEW.invoice_id,
      -NEW.quantity,
      p.cost,
      NOW(),
      inv.user_id
    FROM invoices inv
    JOIN products p ON p.id = NEW.product_id
    WHERE inv.id = NEW.invoice_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث المخزون عند البيع
CREATE TRIGGER trigger_update_inventory_on_sale
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_sale();

-- Function لتطبيق تسويات المخزون
CREATE OR REPLACE FUNCTION apply_stock_adjustment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- تحديث المخزون بناءً على التسويات
    UPDATE inventory i
    SET 
      quantity = i.quantity + sai.variance,
      last_updated = NOW()
    FROM stock_adjustment_items sai
    WHERE sai.adjustment_id = NEW.id
    AND sai.product_id = i.product_id
    AND i.branch_id = NEW.branch_id;
    
    -- تسجيل حركات المخزون
    INSERT INTO stock_movements (
      product_id,
      branch_id,
      movement_type,
      reference_type,
      reference_id,
      quantity,
      movement_date,
      user_id,
      notes
    )
    SELECT 
      sai.product_id,
      NEW.branch_id,
      'adjustment',
      'adjustment',
      NEW.id,
      sai.variance,
      NOW(),
      NEW.approved_by,
      sai.reason
    FROM stock_adjustment_items sai
    WHERE sai.adjustment_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتطبيق التسويات عند الموافقة
CREATE TRIGGER trigger_apply_stock_adjustment
AFTER UPDATE OF status ON stock_adjustments
FOR EACH ROW
EXECUTE FUNCTION apply_stock_adjustment();