-- Service History tablosunu oluştur
CREATE TABLE IF NOT EXISTS service_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'in-progress',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_service_history_customer_id ON service_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_history_vehicle_id ON service_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_history_service_date ON service_history(service_date);
CREATE INDEX IF NOT EXISTS idx_service_history_status ON service_history(status);

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_service_history_updated_at 
    BEFORE UPDATE ON service_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) etkinleştir
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişini görebilir"
ON service_history FOR SELECT
USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişi oluşturabilir"
ON service_history FOR INSERT
WITH CHECK (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişini güncelleyebilir"
ON service_history FOR UPDATE
USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
));

CREATE POLICY "Kullanıcılar kendi müşterilerinin servis geçmişini silebilir"
ON service_history FOR DELETE
USING (customer_id IN (
    SELECT id FROM customers WHERE user_id = auth.uid()
)); 