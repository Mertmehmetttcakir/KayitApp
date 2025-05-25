import { supabase } from '../lib/supabase';

const ALLOWED_FILE_TYPES = {
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'application/pdf': true,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class StorageService {
  private static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
      return {
        isValid: false,
        error: 'Desteklenmeyen dosya türü',
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'Dosya boyutu çok büyük (max: 5MB)',
      };
    }

    return { isValid: true };
  }

  static async uploadFile(
    file: File,
    bucket: string,
    path: string
  ): Promise<{ url: string; error?: string }> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { url: '', error: validation.error };
      }

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Dosya yükleme hatası:', error);
        return { url: '', error: 'Dosya yüklenemedi' };
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      return { url: '', error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  static async deleteFile(
    bucket: string,
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Dosya silme hatası:', error);
        return { success: false, error: 'Dosya silinemedi' };
      }

      return { success: true };
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      return { success: false, error: 'Beklenmeyen bir hata oluştu' };
    }
  }

  static async getFileUrl(
    bucket: string,
    path: string
  ): Promise<{ url: string; error?: string }> {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { url: publicUrl };
    } catch (error) {
      console.error('Dosya URL hatası:', error);
      return { url: '', error: 'Dosya URL\'i alınamadı' };
    }
  }
} 