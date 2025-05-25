# ServiceTracker Plus

Otomotiv servis işletmeleri için modern ve kapsamlı bir yönetim sistemi.

## Özellikler

- 🚗 Müşteri ve Araç Yönetimi
- 📅 Randevu Planlama
- 💰 Finansal Takip
- 📊 Raporlama ve Analiz
- 👥 Teknisyen Yönetimi

## Teknolojiler

- React + TypeScript
- Redux + Zustand (State Yönetimi)
- React Query (API Yönetimi)
- Chakra UI + Tailwind (UI Framework)
- Styled Components (Stil Yönetimi)
- Jest + Testing Library (Test)

## Başlangıç

### Gereksinimler

- Node.js (>= 14.0.0)
- npm (>= 6.0.0)

### Kurulum

```bash
# Projeyi klonlayın
git clone https://github.com/kullanici/servicetracker-plus.git

# Proje dizinine gidin
cd servicetracker-plus

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

### Test

```bash
# Testleri çalıştırın
npm test

# Test coverage raporu
npm test -- --coverage
```

## Proje Yapısı

```
src/
├── components/     # UI Bileşenleri
│   ├── common/    # Genel bileşenler
│   └── features/  # Özellik bazlı bileşenler
├── hooks/         # Custom hooks
├── services/      # API servisleri
├── store/         # State yönetimi
├── types/         # Tip tanımlamaları
└── utils/         # Yardımcı fonksiyonlar
```

## API Dokümantasyonu

### Müşteri Endpoints

- `GET /api/customers` - Tüm müşterileri listele
- `GET /api/customers/:id` - Müşteri detaylarını getir
- `POST /api/customers` - Yeni müşteri oluştur
- `PUT /api/customers/:id` - Müşteri bilgilerini güncelle
- `DELETE /api/customers/:id` - Müşteri kaydını sil

### Servis Endpoints

- `GET /api/services` - Tüm servisleri listele
- `POST /api/services` - Yeni servis kaydı oluştur
- `PUT /api/services/:id` - Servis durumunu güncelle

## Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Yöneticisi - [@projeYoneticisi-----](https://twitter.com/---)

Proje Linki: [https://github.com/kullanici/servicetracker-plus](https://github.com/kullanici/servicetracker-plus) 