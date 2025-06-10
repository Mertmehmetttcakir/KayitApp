import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/settingsService';
import { SystemSettingsUpdate } from '../types/settings';

const SETTINGS_QUERY_KEY = 'settings';

/**
 * Sistem ayarlarını getirir
 */
export const useSystemSettings = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'system'],
    queryFn: SettingsService.getSystemSettings,
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
  });
};

/**
 * Sistem ayarlarını günceller
 */
export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data: SystemSettingsUpdate) => SettingsService.updateSystemSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEY, 'system'], data);
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast({
        title: 'Başarılı',
        description: 'Sistem ayarları güncellendi',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Sistem ayarları güncellenemedi',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Sistem bilgilerini getirir
 */
export const useSystemInfo = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY, 'info'],
    queryFn: SettingsService.getSystemInfo,
    staleTime: 2 * 60 * 1000, // 2 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });
};

/**
 * Ayarları varsayılan değerlere sıfırlar
 */
export const useResetSettings = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => SettingsService.resetToDefaults(),
    onSuccess: (data) => {
      queryClient.setQueryData([SETTINGS_QUERY_KEY, 'system'], data);
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast({
        title: 'Başarılı',
        description: 'Ayarlar varsayılan değerlere sıfırlandı',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Ayarlar sıfırlanamadı',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
};

/**
 * Manuel yedekleme oluşturur
 */
export const useCreateBackup = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: () => SettingsService.createBackup(),
    onSuccess: (result) => {
      toast({
        title: result.success ? 'Başarılı' : 'Hata',
        description: result.message,
        status: result.success ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Hata',
        description: error.message || 'Yedekleme oluşturulamadı',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });
}; 