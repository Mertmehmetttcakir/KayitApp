import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Varsayılan önbellekleme süresi: 5 dakika
      staleTime: 5 * 60 * 1000,
      // Garbage collection süresi: 30 dakika
      gcTime: 30 * 60 * 1000,
      // Hata durumunda 3 kez tekrar dene
      retry: 3,
      // Sayfa yüklendiğinde otomatik veri yenileme
      refetchOnWindowFocus: true,
      // Ağ bağlantısı geri geldiğinde veriyi yenile
      refetchOnReconnect: true,
    },
    mutations: {
      // Hata durumunda tekrar deneme
      retry: 2,
    },
  },
}); 