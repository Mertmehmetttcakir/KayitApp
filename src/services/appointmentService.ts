import { supabase } from '../lib/supabase';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '../types/appointment';
import { BaseApiService } from './baseApiService';

export class AppointmentService extends BaseApiService {
  static async getAppointments(): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .order('appointment_date', { ascending: true }),
      'Randevular getirilemedi'
    );
  }

  static async getAppointmentById(id: string): Promise<Appointment> {
    return this.handleRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers (id, name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('id', id)
        .single(),
      'Randevu detayları getirilemedi'
    );
  }

  static async createAppointment(data: AppointmentCreate): Promise<Appointment> {
    return this.handleCreateRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .insert([data])
        .select(`
          *,
          customer:customers (id, name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .single(),
      'Randevu oluşturulamadı'
    );
  }

  static async updateAppointment(
    id: string,
    data: AppointmentUpdate
  ): Promise<Appointment> {
    return this.handleUpdateRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          customer:customers (id, name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .single(),
      'Randevu güncellenemedi'
    );
  }

  static async deleteAppointment(id: string): Promise<void> {
    return this.handleDeleteRequest(
      async () => supabase
        .from('appointments')
        .delete()
        .eq('id', id),
      'Randevu silinemedi'
    );
  }

  static async getCustomerAppointments(customerId: string): Promise<Appointment[]> {
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers (id, name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: true }),
      'Müşteri randevuları getirilemedi'
    );
  }

  static async getVehicleAppointments(vehicleId: string): Promise<Appointment[]> {
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers (id, name, phone),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('vehicle_id', vehicleId)
        .order('appointment_date', { ascending: true }),
      'Araç randevuları getirilemedi'
    );
  }

  static async getUpcomingAppointments(): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const now = new Date().toISOString();
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .gte('appointment_date', now)
        .order('appointment_date', { ascending: true }),
      'Yaklaşan randevular getirilemedi'
    );
  }

  static async getPastAppointments(): Promise<Appointment[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    const now = new Date().toISOString();
    return this.handleListRequest<Appointment>(
      async () => supabase
        .from('appointments')
        .select(`
          *,
          customer:customers!inner (id, name, phone, user_id),
          vehicle:vehicles (id, plate, brand, model)
        `)
        .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin randevularını getir
        .lt('appointment_date', now)
        .order('appointment_date', { ascending: false }),
      'Geçmiş randevular getirilemedi'
    );
  }

  static async createRecurringAppointments(data: AppointmentCreate): Promise<Appointment[]> {
    // Tekrarlanan randevular için basit bir implementasyon
    // Gerçek uygulamada daha karmaşık bir tekrarlama mantığı olmalıdır
    
    // İlk randevuyu oluştur
    const firstAppointment = await this.createAppointment(data);
    const appointments: Appointment[] = [firstAppointment];
    
    // Burada gerçek bir implementasyonda recurrence pattern'e göre
    // tekrarlanan randevular oluşturulacaktır.
    // Şimdilik sadece ilk randevuyu dönüyoruz.
    
    return appointments;
  }

  static async getAppointmentsByCustomerId(customerId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments_with_balance') // View'ı kullanıyoruz
      .select('*') // Veya sadece gerekli alanları: '*, customer:customers(*), vehicle:vehicles(*)' gibi
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
    return data || [];
  }
} 