import { supabase } from '../lib/supabase';
import {
    FinancialTransaction,
    FinancialTransactionCreate,
    FinancialTransactionUpdate,
} from '../types/financial';
import { BaseApiService } from './baseApiService';

export class FinancialTransactionService extends BaseApiService {
  static async createFinancialTransaction(
    data: FinancialTransactionCreate
  ): Promise<FinancialTransaction> {
    return this.handleCreateRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .insert(data)
          .select('*') // Gerekirse ilişkili verileri de seçebilirsiniz: '*, customer:customers(id, full_name)'
          .single(),
      'Finansal işlem oluşturulamadı'
    );
  }

  static async getFinancialTransactionById(
    id: string
  ): Promise<FinancialTransaction> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            customer:customers!inner(id, full_name, user_id), 
            vehicle:vehicles(id, plate)
          `)
          .eq('id', id)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .single(),
      'Finansal işlem detayları getirilemedi'
    );
  }

  static async getFinancialTransactionsByCustomerId(
    customerId: string
  ): Promise<FinancialTransaction[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            vehicle:vehicles(id, plate),
            customer:customers!inner(id, full_name, user_id)
          `)
          .eq('customer_id', customerId)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .order('transaction_date', { ascending: false }),
      'Müşteriye ait finansal işlemler getirilemedi'
    );
  }

  static async getFinancialTransactionsByVehicleId(
    vehicleId: string
  ): Promise<FinancialTransaction[]> {
    // Mevcut kullanıcının ID'sini al
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Kullanıcı kimlik doğrulaması gerekli');
    }

    return this.handleListRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .select(`
            *, 
            customer:customers!inner(id, full_name, user_id)
          `)
          .eq('vehicle_id', vehicleId)
          .eq('customer.user_id', user.id) // Sadece giriş yapan kullanıcının müşterilerinin işlemlerini getir
          .order('transaction_date', { ascending: false }),
      'Araca ait finansal işlemler getirilemedi'
    );
  }

  static async updateFinancialTransaction(
    id: string,
    data: FinancialTransactionUpdate
  ): Promise<FinancialTransaction> {
    return this.handleUpdateRequest<FinancialTransaction>(
      async () =>
        supabase
          .from('financial_transactions')
          .update(data)
          .eq('id', id)
          .select('*')
          .single(),
      'Finansal işlem güncellenemedi'
    );
  }

  static async deleteFinancialTransaction(id: string): Promise<void> {
    return this.handleDeleteRequest(
      async () =>
        supabase.from('financial_transactions').delete().eq('id', id),
      'Finansal işlem silinemedi'
    );
  }

  // Toplu işlem ekleme (örn: araç formu için)
  static async createMultipleFinancialTransactions(
    transactions: FinancialTransactionCreate[]
  ): Promise<FinancialTransaction[]> {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    return this.handleCreateRequest<FinancialTransaction[]>(
      async () => supabase
        .from('financial_transactions')
        .insert(transactions)
        .select('*'),
      'Finansal işlemler oluşturulamadı'
    );
  }
} 