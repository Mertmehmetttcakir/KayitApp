-- Customers tablosunun yapısını kontrol et

-- 1. Customers tablosunun tüm sütunlarını listele
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Auth kullanıcısını kontrol et
SELECT auth.uid() as current_user_id;

-- 3. Customers tablosundaki örnek verileri kontrol et
SELECT 
    id, 
    full_name, 
    user_id, 
    email,
    created_at
FROM customers 
LIMIT 5;

-- 4. Mevcut kullanıcının müşterilerini kontrol et
SELECT 
    id, 
    full_name, 
    user_id,
    created_at
FROM customers 
WHERE user_id = auth.uid();

-- 5. User_id alanının null olan kayıtları kontrol et
SELECT 
    count(*) as total_customers,
    count(user_id) as customers_with_user_id,
    count(*) - count(user_id) as customers_without_user_id
FROM customers; 