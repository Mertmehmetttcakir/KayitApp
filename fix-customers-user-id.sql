-- Customers tablosuna user_id alanı ekle ve mevcut kayıtları güncelle

-- 1. User_id alanını ekle (eğer yoksa)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Mevcut auth kullanıcısını kontrol et
SELECT auth.uid() as current_user_id;

-- 3. Eğer mevcut müşterilerin user_id'si null ise, mevcut kullanıcıya ata
UPDATE customers 
SET user_id = auth.uid() 
WHERE user_id IS NULL;

-- 4. İndeks oluştur (performans için)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- 5. Sonuç kontrolü
SELECT 
    'User_id alanı başarıyla eklendi' as status,
    count(*) as total_customers,
    count(user_id) as customers_with_user_id
FROM customers;

-- 6. Mevcut kullanıcının müşterilerini kontrol et
SELECT 
    id, 
    full_name, 
    user_id,
    created_at
FROM customers 
WHERE user_id = auth.uid()
LIMIT 5; 