/*
  # إنشاء جدول سجل التدقيق (Audit Log)

  ## 1. الجداول الجديدة
  - `audit_logs`
    - `id` (uuid) - المعرّف الفريد
    - `event_type` (text) - نوع الحدث
    - `user_id` (uuid) - المستخدم
    - `entity_type` (text) - نوع الكيان
    - `entity_id` (text) - معرّف الكيان
    - `action` (text) - الإجراء
    - `old_data` (jsonb) - البيانات القديمة
    - `new_data` (jsonb) - البيانات الجديدة
    - `ip_address` (text) - عنوان IP
    - `user_agent` (text) - معلومات المتصفح
    - `metadata` (jsonb) - معلومات إضافية
    - `created_at` (timestamptz) - وقت الحدث

  ## 2. الأمان
  - تفعيل RLS
  - المستخدمون المصادق عليهم يمكنهم القراءة والكتابة

  ## 3. الفهارس
  - فهارس للأداء
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text,
  entity_id text,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);