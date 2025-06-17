-- Appointments tablosu için eksik RLS politikalarını düzelt

-- İlk olarak mevcut politikaları kontrol et
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'appointments';

-- Eksik INSERT politikasını ekle
CREATE POLICY "Kullanıcılar kendi müşterilerinin randevularını oluşturabilir"
ON appointments FOR INSERT
WITH CHECK (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

-- UPDATE politikasını ekle (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Kullanıcılar kendi müşterilerinin randevularını güncelleyebilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterilerinin randevularını güncelleyebilir"
        ON appointments FOR UPDATE
        USING (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;
END $$;

-- DELETE politikasını ekle (yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'appointments' 
        AND policyname = 'Kullanıcılar kendi müşterilerinin randevularını silebilir'
    ) THEN
        CREATE POLICY "Kullanıcılar kendi müşterilerinin randevularını silebilir"
        ON appointments FOR DELETE
        USING (customer_id IN (
          SELECT id FROM customers WHERE user_id = auth.uid()
        ));
    END IF;
END $$;

-- RLS'nin etkin olduğunu doğrula
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Sonuç kontrolü
SELECT 
    'Appointments RLS politikaları başarıyla düzeltildi.' as status,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'appointments') as total_policies; 