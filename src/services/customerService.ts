import { supabase } from '../lib/supabase';
import { Customer, CustomerCreate, CustomerUpdate } from '../types/customer';
import { BaseApiService } from './baseApiService';

// Helper function to map view data to Customer type
const mapCustomerFromView = (customerData: any): Customer => {
  return {
    id: customerData.id,
    full_name: customerData.full_name,
    email: customerData.email,
    phone: customerData.phone,
    address: customerData.address,
    created_at: customerData.customer_created_at, // Mapping from alias
    updated_at: customerData.customer_updated_at, // Mapping from alias
    last_appointment_date: customerData.last_appointment_date,
    total_outstanding_balance_from_jobs: customerData.total_outstanding_balance_from_jobs,
    // vehicles, appointments ve jobs burada doldurulmaz, ayrı sorgu gerektirirler
  };
};

export class CustomerService extends BaseApiService {
  static async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers_extended_details') // Use the new view
        .select('*')
      .order('customer_created_at', { ascending: false }); // Order by aliased column

    if (error) {
      console.error('Error fetching customers from view:', error);
      throw new Error('Müşteriler getirilemedi');
    }
    return (data || []).map(mapCustomerFromView);
  }

  static async getCustomerById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers_extended_details') // Use the new view
        .select('*')
        .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching customer by ID ${id} from view:`, error);
      throw new Error('Müşteri detayları getirilemedi');
    }
    if (!data) {
        throw new Error('Müşteri bulunamadı');
    }
    return mapCustomerFromView(data);
  }

  static async createCustomer(customerData: CustomerCreate): Promise<Customer> {
    // Oluşturma işlemi doğrudan 'customers' tablosuna yapılır.
    // Sonrasında getCustomerById ile view'den çekilebilir, ama bu create içinde direkt view'den seçmek zor.
    // En iyisi oluşturduktan sonra ID ile getCustomerById çağırmak veya temel customer verisini dönmek.
    return this.handleCreateRequest<Customer>(
      async () => supabase
        .from('customers')
        .insert([customerData])
        .select() // Temel customer verisini seçer
        .single(),
      'Müşteri oluşturulamadı'
      // Not: Oluşturma sonrası view'deki tüm alanlar hemen dolu olmayabilir (örn: last_appointment_date)
      // Bunu frontend'de veya getCustomerById ile handle etmek gerekebilir.
    );
  }

  static async updateCustomer(
    id: string,
    customerData: CustomerUpdate
  ): Promise<Customer> {
    // Güncelleme işlemi doğrudan 'customers' tablosuna yapılır.
    return this.handleUpdateRequest<Customer>(
      async () => supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select() // Temel customer verisini seçer
        .single(),
      'Müşteri güncellenemedi'
    );
  }

  static async deleteCustomer(id: string): Promise<void> {
    return this.handleDeleteRequest(
      async () => supabase
        .from('customers')
        .delete()
        .eq('id', id),
      'Müşteri silinemedi'
    );
  }

  static async searchCustomers(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers_extended_details') // View üzerinden arama yapabiliriz
        .select('*')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('customer_created_at', { ascending: false });

    if (error) {
      console.error('Error searching customers from view:', error);
      throw new Error('Müşteri araması yapılamadı');
    }
    return (data || []).map(mapCustomerFromView);
  }

  static async getCustomerVehicles(customerId: string): Promise<Customer> {
    return this.handleRequest<Customer>(
      async () => supabase
        .from('customers')
        .select(`
          *,
          vehicles (*)
        `)
        .eq('id', customerId)
        .single(),
      'Müşteri araçları getirilemedi'
    );
  }

  static async getCustomerAppointments(customerId: string): Promise<Customer> {
    return this.handleRequest<Customer>(
      async () => supabase
        .from('customers')
        .select(`
          *,
          appointments (*)
        `)
        .eq('id', customerId)
        .single(),
      'Müşteri randevuları getirilemedi'
    );
  }

  static async getCustomersWithOutstandingDebt(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers_extended_details')
      .select('*')
      .gt('total_outstanding_balance_from_jobs', 0) // GÜNCELLENDİ
      .order('total_outstanding_balance_from_jobs', { ascending: false }); // GÜNCELLENDİ

    if (error) {
      console.error('Error fetching customers with outstanding debt from view:', error);
      throw new Error('Borçlu müşteriler getirilemedi');
    }
    return (data || []).map(mapCustomerFromView);
  }
} 