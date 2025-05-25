import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key tanımlanmamış!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gelişmiş tip tanımlamaları
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone?: string;
          role: 'customer' | 'technician' | 'admin';
          created_at: string;
          last_login?: string;
          status: 'active' | 'inactive' | 'suspended';
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string;
          role?: 'customer' | 'technician' | 'admin';
          status?: 'active' | 'inactive' | 'suspended';
        };
        Update: {
          full_name?: string;
          phone?: string;
          role?: 'customer' | 'technician' | 'admin';
          last_login?: string;
          status?: 'active' | 'inactive' | 'suspended';
        };
      };
      login_history: {
        Row: {
          id: string;
          user_id: string;
          login_time: string;
          ip_address: string;
          device_info: string;
        };
        Insert: {
          user_id: string;
          login_time?: string;
          ip_address?: string;
          device_info?: string;
        };
      };
    };
  };
};

// Kullanıcı profil yönetimi fonksiyonları
export const createUserProfile = async (user: { 
  id: string, 
  email: string, 
  fullName: string, 
  phone?: string 
}) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      phone: user.phone,
      role: 'customer',
      status: 'active'
    });

  if (error) {
    console.error('Kullanıcı profili oluşturma hatası:', error);
    throw error;
  }
};

export const updateUserLoginHistory = async (userId: string) => {
  const { error } = await supabase
    .from('login_history')
    .insert({
      user_id: userId,
      login_time: new Date().toISOString(),
      ip_address: '', // TODO: Gerçek IP adresi eklenecek
      device_info: navigator.userAgent
    });

  if (error) {
    console.error('Giriş geçmişi kaydetme hatası:', error);
  }
}; 