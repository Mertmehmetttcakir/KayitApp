-- Müşteriyi mevcut kullanıcıya ata

-- 1. Mevcut durum kontrolü
SELECT 
    id,
    full_name,
    user_id,
    'Şu anda bu kullanıcıya ait: ' || 
    COALESCE(user_id::text, 'NULL') as current_owner
FROM customers 
WHERE id = 'ee5a4fc6-074a-4ecd-a55d-2c6e46b7bb17';

-- 2. Müşteriyi mevcut kullanıcıya ata
UPDATE customers 
SET user_id = auth.uid() 
WHERE id = 'ee5a4fc6-074a-4ecd-a55d-2c6e46b7bb17';

-- 3. Güncellenmiş durum kontrolü
SELECT 
    id,
    full_name,
    user_id,
    'Artık bu kullanıcıya ait: ' || user_id::text as new_owner,
    CASE 
        WHEN user_id = auth.uid() THEN 'BAŞARILI: Artık bu müşteri için randevu oluşturulabilir'
        ELSE 'HATA: Hala atama sorunu var'
    END as assignment_status
FROM customers 
WHERE id = 'ee5a4fc6-074a-4ecd-a55d-2c6e46b7bb17';

-- 4. Test: Randevu oluşturma kontrolü
SELECT 
    'ee5a4fc6-074a-4ecd-a55d-2c6e46b7bb17'::uuid as customer_id,
    CASE 
        WHEN 'ee5a4fc6-074a-4ecd-a55d-2c6e46b7bb17'::uuid IN (
            SELECT id FROM customers WHERE user_id = auth.uid()
        ) THEN 'BAŞARILI: Bu customer_id ile randevu oluşturulabilir'
        ELSE 'HATA: Hala sorun var'
    END as final_test; 