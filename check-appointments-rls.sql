-- Appointments tablosu için mevcut RLS politikalarını kontrol et

-- 1. Appointments tablosunun RLS durumunu kontrol et
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'appointments';

-- 2. Mevcut RLS politikalarını listele
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'appointments'
ORDER BY cmd, policyname;

-- 3. Auth user kontrol fonksiyonunu test et
SELECT auth.uid() as current_user_id;

-- 4. Customers tablosunda user_id alanının varlığını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name = 'user_id'
AND table_schema = 'public';

-- 5. Sample customer data with user_id check
SELECT id, full_name, user_id, created_at
FROM customers 
WHERE user_id = auth.uid()
LIMIT 5;

-- 6. Appointments tablosunun yapısını kontrol et
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND table_schema = 'public'
ORDER BY ordinal_position; 