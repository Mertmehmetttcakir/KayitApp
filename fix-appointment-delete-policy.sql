-- Appointments DELETE politikasını kontrol et ve ekle

-- 1. Mevcut DELETE politikalarını kontrol et
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'appointments'
AND cmd = 'DELETE';

-- 2. DELETE politikası ekle (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND cmd = 'DELETE'
    ) THEN
        CREATE POLICY "Users can delete own customer appointments"
        ON appointments FOR DELETE
        USING (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;
END $$;

-- 3. Sonuç kontrolü
SELECT 
    'DELETE politikası eklendi' as status,
    count(*) as total_delete_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'appointments'
AND cmd = 'DELETE'; 