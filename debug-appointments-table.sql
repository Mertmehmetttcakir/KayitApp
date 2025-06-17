-- Appointments tablosunu debug et

-- 1. Mevcut kullanıcının tüm randevularını listele
SELECT 
    a.id,
    a.service_type,
    a.status,
    a.appointment_date,
    c.full_name as customer_name,
    c.user_id as customer_user_id,
    auth.uid() as current_user_id
FROM appointments a
JOIN customers c ON a.customer_id = c.id
WHERE c.user_id = auth.uid()
ORDER BY a.created_at DESC;

-- 2. Belirli bir appointment ID'sini test et (ID'yi güncel bir değerle değiştirin)
-- SELECT 
--     a.id,
--     a.service_type,
--     a.status,
--     c.full_name,
--     c.user_id,
--     auth.uid() as current_user_id,
--     CASE 
--         WHEN c.user_id = auth.uid() THEN 'Bu randevu güncellenebilir'
--         ELSE 'Bu randevu güncellenemez'
--     END as update_permission
-- FROM appointments a
-- JOIN customers c ON a.customer_id = c.id
-- WHERE a.id = 'APPOINTMENT_ID_BURAYA_YAZIN';

-- 3. Appointments tablosunda duplicate ID kontrolü
SELECT id, count(*) as count
FROM appointments 
GROUP BY id 
HAVING count(*) > 1;

-- 4. Null değer kontrolü
SELECT 
    count(*) as total_appointments,
    count(id) as appointments_with_id,
    count(customer_id) as appointments_with_customer
FROM appointments; 