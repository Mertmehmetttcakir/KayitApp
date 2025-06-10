-- paid_jobs_revenue view'ını kullanıcı bazlı filtreleme için güncelle

-- Önce mevcut view'ı sil
DROP VIEW IF EXISTS paid_jobs_revenue;

-- Yeni view'ı customer_user_id alanı ile oluştur
CREATE VIEW paid_jobs_revenue AS
SELECT 
    ft.id as transaction_id,
    ft.customer_id,
    c.user_id as customer_user_id, -- Kullanıcı bazlı filtreleme için
    ft.job_id,
    ft.amount as paid_amount,
    ft.transaction_date,
    
    -- Tarih bazlı filtreleme için alanlar
    DATE(ft.transaction_date) as payment_day_ts,
    DATE_TRUNC('week', ft.transaction_date::date) as payment_week_ts,
    DATE_TRUNC('month', ft.transaction_date::date) as payment_month_ts,
    DATE_TRUNC('year', ft.transaction_date::date) as payment_year_ts,
    
    -- ISO hafta ve yıl hesaplamaları
    EXTRACT(ISOYEAR FROM ft.transaction_date::date) as payment_isoyear_num,
    EXTRACT(WEEK FROM ft.transaction_date::date) as payment_week_num,
    EXTRACT(YEAR FROM ft.transaction_date::date) as payment_year_num,
    EXTRACT(MONTH FROM ft.transaction_date::date) as payment_month_num,
    EXTRACT(DAY FROM ft.transaction_date::date) as payment_day_num
    
FROM financial_transactions ft
INNER JOIN customers c ON ft.customer_id = c.id
WHERE ft.transaction_type = 'PAYMENT' -- Sadece ödeme işlemlerini dahil et
  AND ft.amount > 0; -- Pozitif tutarları dahil et

-- View için RLS politikası ekle (eğer gerekirse)
-- Bu view zaten customers tablosu üzerinden filtreleneceği için ek RLS gerekmeyebilir
-- Ancak güvenlik için ekleyebiliriz

-- View'a yorum ekle
COMMENT ON VIEW paid_jobs_revenue IS 'Ödeme işlemlerinden elde edilen ciro verilerini kullanıcı bazlı filtreleme ile sunar'; 