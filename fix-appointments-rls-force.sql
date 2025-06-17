-- Appointments tablosu RLS politikalarını zorla düzelt

-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin randevularını oluştura" ON appointments;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin randevularını oluşturabilir" ON appointments;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin randevularını güncelleyebilir" ON appointments;
DROP POLICY IF EXISTS "Kullanıcılar kendi müşterilerinin randevularını silebilir" ON appointments;

-- INSERT politikası
CREATE POLICY "Appointment insert policy"
ON appointments FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- UPDATE politikası  
CREATE POLICY "Appointment update policy"
ON appointments FOR UPDATE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- DELETE politikası
CREATE POLICY "Appointment delete policy"
ON appointments FOR DELETE
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- RLS'yi etkinleştir
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Test: mevcut kullanıcının müşterilerini kontrol et
SELECT 
    'Düzeltme tamamlandı' as status,
    count(*) as available_customers
FROM customers 
WHERE user_id = auth.uid(); 