-- Timezone sorunlarını düzeltmek için appointment tablosu güncellemeleri

-- 1. Mevcut appointment_date sütununun timezone bilgisini kontrol et
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
  AND column_name = 'appointment_date';

-- 2. Eğer appointment_date timestamp without time zone ise, with time zone'a çevir
-- NOT: Bu işlem sadece gerekirse çalıştırılmalı
-- ALTER TABLE appointments 
-- ALTER COLUMN appointment_date TYPE timestamp with time zone 
-- USING appointment_date AT TIME ZONE 'UTC';

-- 3. Appointment tarihlerini UTC'ye dönüştür (eğer yerel saat dilimindeyse)
-- Bu sorgu mevcut verileri UTC'ye çevirir
-- UPDATE appointments 
-- SET appointment_date = appointment_date AT TIME ZONE 'Europe/Istanbul' AT TIME ZONE 'UTC'
-- WHERE appointment_date IS NOT NULL;

-- 4. Yeni randevular için trigger oluştur (timezone otomatik dönüşümü)
CREATE OR REPLACE FUNCTION ensure_appointment_utc()
RETURNS TRIGGER AS $$
BEGIN
  -- Eğer appointment_date UTC timezone bilgisi içermiyorsa, UTC olarak ayarla
  IF NEW.appointment_date IS NOT NULL THEN
    -- Gelen tarihi UTC olarak kaydet
    NEW.appointment_date = NEW.appointment_date AT TIME ZONE 'UTC';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı appointment tablosuna ekle
DROP TRIGGER IF EXISTS ensure_appointment_utc_trigger ON appointments;
CREATE TRIGGER ensure_appointment_utc_trigger
  BEFORE INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION ensure_appointment_utc();

-- 5. Timezone fonksiyonları (PostgreSQL'de kullanmak için)
-- Frontend'den gelen UTC tarihini yerel saate çevirmek için view
CREATE OR REPLACE VIEW appointments_local_time AS
SELECT 
  *,
  appointment_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul' as local_appointment_date
FROM appointments;

-- 6. Test sorguları
-- Mevcut appointment verilerini kontrol et
SELECT 
  id,
  appointment_date,
  appointment_date AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Istanbul' as local_time,
  extract(timezone from appointment_date) as timezone_offset
FROM appointments 
ORDER BY appointment_date DESC 
LIMIT 5;

-- Timezone offset bilgisini kontrol et
SELECT 
  now() as current_utc,
  now() AT TIME ZONE 'Europe/Istanbul' as current_local,
  extract(timezone from now()) as current_offset;

COMMENT ON TABLE appointments IS 'Randevu tablosu - appointment_date her zaman UTC olarak saklanır';
COMMENT ON COLUMN appointments.appointment_date IS 'Randevu tarihi ve saati (UTC timezone)'; 