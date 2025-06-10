import { supabase } from '../lib/supabase';
import { SystemInfo, SystemSettings, SystemSettingsUpdate } from '../types/settings';
import { BaseApiService } from './baseApiService';
import { StorageService } from './storageService';

export class SettingsService extends BaseApiService {
  /**
   * Kullanıcının sistem ayarlarını getirir
   */
  static async getSystemSettings(): Promise<SystemSettings | null> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Kayıt bulunamadı, varsayılan ayarları oluştur
        return await SettingsService.createDefaultSettings();
      }
      console.error('Sistem ayarları getirme hatası:', error);
      throw new Error('Sistem ayarları getirilemedi');
    }

    return data;
  }

  /**
   * Varsayılan sistem ayarlarını oluşturur
   */
  static async createDefaultSettings(): Promise<SystemSettings> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const defaultSettings = {
      user_id: user.id,
      language: 'tr' as const,
      timezone: 'Europe/Istanbul',
      currency: 'TRY' as const,
      date_format: 'DD/MM/YYYY' as const,
      records_per_page: 25,
      email_notifications: true,
      sms_notifications: false,
      appointment_reminders: true,
      payment_reminders: true,
      session_timeout: 60, // 1 saat
      auto_logout: true,
      auto_backup: true,
      backup_frequency: 'weekly' as const,
    };

    return super.handleCreateRequest<SystemSettings>(
      async () => supabase
        .from('system_settings')
        .insert([defaultSettings])
        .select('*')
        .single(),
      'Varsayılan sistem ayarları oluşturulamadı'
    );
  }

  /**
   * Sistem ayarlarını günceller
   */
  static async updateSystemSettings(data: SystemSettingsUpdate): Promise<SystemSettings> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return super.handleUpdateRequest<SystemSettings>(
      async () => supabase
        .from('system_settings')
        .update(data)
        .eq('user_id', user.id)
        .select('*')
        .single(),
      'Sistem ayarları güncellenemedi'
    );
  }

  /**
   * Sistem bilgilerini getirir
   */
  static async getSystemInfo(): Promise<SystemInfo> {
    try {
      // Mevcut kullanıcının ID'sini al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Önce kullanıcının müşterilerini al
      const { data: userCustomers } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id);

      const customerIds = userCustomers?.map(c => c.id) || [];

      // Paralel sorgular
      const [
        usersQuery,
        customersQuery,
        jobsQuery,
        storageInfo
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        customerIds.length > 0 
          ? supabase.from('jobs').select('id', { count: 'exact', head: true }).in('customer_id', customerIds)
          : Promise.resolve({ count: 0 }),
        StorageService.calculateUserStorageUsage(user.id)
      ]);

      // Kullanıcının storage planını belirle
      const totalCustomers = customersQuery.count || 0;
      const storagePlan = StorageService.getUserStoragePlan(totalCustomers);

      return {
        app_version: '1.0.0',
        last_updated: new Date().toISOString(),
        total_users: usersQuery.count || 0,
        total_customers: totalCustomers,
        total_jobs: jobsQuery.count || 0,
        storage_used: storageInfo.used,
        storage_limit: storagePlan.limit,
        storage_breakdown: storageInfo.breakdown,
        storage_plan: storagePlan.name,
      };
    } catch (error) {
      console.error('Sistem bilgileri getirme hatası:', error);
      throw new Error('Sistem bilgileri getirilemedi');
    }
  }

  /**
   * Ayarları varsayılan değerlere sıfırlar
   */
  static async resetToDefaults(): Promise<SystemSettings> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const defaultSettings: SystemSettingsUpdate = {
      language: 'tr',
      timezone: 'Europe/Istanbul',
      currency: 'TRY',
      date_format: 'DD/MM/YYYY',
      records_per_page: 25,
      email_notifications: true,
      sms_notifications: false,
      appointment_reminders: true,
      payment_reminders: true,
      session_timeout: 60,
      auto_logout: true,
      auto_backup: true,
      backup_frequency: 'weekly',
    };

    return SettingsService.updateSystemSettings(defaultSettings);
  }

  /**
   * Manuel yedekleme işlemi başlatır
   */
  static async createBackup(): Promise<{ success: boolean; message: string }> {
    try {
      // Bu gerçek bir implementasyonda, verileri export edip dosya olarak indirecek
      // Şimdilik placeholder
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 saniye bekle
      
      return {
        success: true,
        message: 'Yedekleme başarıyla oluşturuldu'
      };
    } catch (error) {
      console.error('Yedekleme hatası:', error);
      return {
        success: false,
        message: 'Yedekleme oluşturulamadı'
      };
    }
  }
} 