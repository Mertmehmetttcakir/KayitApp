-- Randevu oluşturma sorununu debug et

-- 1. Mevcut auth kullanıcısını kontrol et
SELECT 
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN 'Auth kullanıcısı NULL!'
        ELSE 'Auth kullanıcısı mevcut'
    END as auth_status;

-- 2. Mevcut kullanıcının müşterilerini listele
SELECT 
    id as customer_id, 
    full_name as customer_name, 
    user_id,
    email,
    created_at
FROM customers 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- 3. Appointment INSERT için test sorgusu (gerçek insert yapmaz, sadece kontrol eder)
SELECT 
    'Test: Bu customer_id ile randevu oluşturulabilir mi?' as test_title,
    c.id as customer_id,
    c.full_name as customer_name,
    c.user_id as customer_user_id,
    auth.uid() as current_user_id,
    CASE 
        WHEN c.user_id = auth.uid() THEN 'BAŞARILI: Bu müşteri için randevu oluşturulabilir'
        ELSE 'HATA: Bu müşteri mevcut kullanıcıya ait değil'
    END as test_result
FROM customers c
ORDER BY c.created_at DESC
LIMIT 5;

-- 4. RLS politika kontrolü
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'appointments'
AND cmd = 'INSERT';

-- 5. Eğer bir customer_id test etmek istiyorsanız, aşağıdaki sorguyu kullanabilirsiniz
-- (customer_id'yi gerçek bir değerle değiştirin)
-- SELECT 
--     customer_id,
--     CASE 
--         WHEN customer_id IN (
--             SELECT id FROM customers WHERE user_id = auth.uid()
--         ) THEN 'Bu customer_id ile randevu oluşturulabilir'
--         ELSE 'Bu customer_id mevcut kullanıcıya ait değil'
--     END as can_create_appointment
-- FROM (VALUES ('CUSTOMER_ID_BURAYA_YAZIN'::uuid)) AS test(customer_id); 