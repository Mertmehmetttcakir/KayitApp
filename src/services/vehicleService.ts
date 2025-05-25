import { supabase } from '../lib/supabase';
import { Vehicle, VehicleCreate, VehicleUpdate } from '../types/vehicle';
import { BaseApiService } from './baseApiService';

export class VehicleService extends BaseApiService {
  static async getVehicles(): Promise<Vehicle[]> {
    return this.handleListRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .select(`
          *,
          customer:customers (id, name, phone)
        `)
        .order('created_at', { ascending: false }),
      'Araçlar getirilemedi'
    );
  }

  static async getVehicleById(id: string): Promise<Vehicle> {
    return this.handleRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .select(`
          *,
          customer:customers (id, name, phone)
        `)
        .eq('id', id)
        .single(),
      'Araç detayları getirilemedi'
    );
  }

  static async createVehicle(data: VehicleCreate): Promise<Vehicle> {
    return this.handleCreateRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .insert([data])
        .select()
        .single(),
      'Araç oluşturulamadı'
    );
  }

  static async updateVehicle(id: string, data: VehicleUpdate): Promise<Vehicle> {
    return this.handleUpdateRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .update(data)
        .eq('id', id)
        .select()
        .single(),
      'Araç güncellenemedi'
    );
  }

  static async deleteVehicle(id: string): Promise<void> {
    return this.handleDeleteRequest(
      async () => supabase
        .from('vehicles')
        .delete()
        .eq('id', id),
      'Araç silinemedi'
    );
  }

  static async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    return this.handleListRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false }),
      'Müşteri araçları getirilemedi'
    );
  }

  static async searchVehicles(query: string): Promise<Vehicle[]> {
    return this.handleListRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .select(`
          *,
          customer:customers (id, name, phone)
        `)
        .or(`plate.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`)
        .order('created_at', { ascending: false }),
      'Araç araması yapılamadı'
    );
  }

  static async getVehicleServiceHistory(vehicleId: string): Promise<Vehicle> {
    return this.handleRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .select(`
          *,
          service_history (*)
        `)
        .eq('id', vehicleId)
        .single(),
      'Araç servis geçmişi getirilemedi'
    );
  }

  static async getVehiclesByCustomerId(customerId: string): Promise<Vehicle[]> {
    return this.handleListRequest<Vehicle>(
      async () => supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false }),
      'Müşteriye ait araçlar getirilemedi'
    );
  }
} 