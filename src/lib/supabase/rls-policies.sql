-- RLS'yi etkinleştir
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

-- Müşteriler için politikalar
CREATE POLICY "Müşteriler kendi verilerini görebilir"
ON customers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Yöneticiler tüm müşterileri görebilir"
ON customers FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Araçlar için politikalar
CREATE POLICY "Müşteriler kendi araçlarını görebilir"
ON vehicles FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Yöneticiler tüm araçları görebilir"
ON vehicles FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Randevular için politikalar
CREATE POLICY "Müşteriler kendi randevularını görebilir"
ON appointments FOR SELECT
USING (customer_id IN (
  SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Teknisyenler kendilerine atanan randevuları görebilir"
ON appointments FOR SELECT
USING (technician_id = auth.uid());

CREATE POLICY "Yöneticiler tüm randevuları görebilir"
ON appointments FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Servis geçmişi için politikalar
CREATE POLICY "Müşteriler kendi servis geçmişini görebilir"
ON service_history FOR SELECT
USING (appointment_id IN (
  SELECT id FROM appointments WHERE customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Yöneticiler tüm servis geçmişini görebilir"
ON service_history FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Teknisyenler için politikalar
CREATE POLICY "Herkes teknisyenleri görebilir"
ON technicians FOR SELECT
USING (true);

CREATE POLICY "Sadece yöneticiler teknisyen ekleyebilir"
ON technicians FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Sadece yöneticiler teknisyen güncelleyebilir"
ON technicians FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin'); 