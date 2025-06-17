-- Appointments UPDATE RLS politikasını düzelt

-- 1. Mevcut UPDATE politikalarını kontrol et
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'appointments'
AND cmd = 'UPDATE';

-- 2. Tüm appointment UPDATE politikalarını sil
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin randevularını güncelleyebilir" ON appointments;
DROP POLICY IF EXISTS "Users can update own customer appointments" ON appointments;
DROP POLICY IF EXISTS "Appointment update policy" ON appointments;

-- 3. Yeni, basit UPDATE politikası oluştur
CREATE POLICY "Allow update own customer appointments"
ON appointments FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
))
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- 4. Politika kontrolü
SELECT 
    'UPDATE politikası eklendi' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'appointments'
AND cmd = 'UPDATE'; 