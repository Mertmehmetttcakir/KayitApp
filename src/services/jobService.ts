import { supabase } from '../lib/supabase';
import {
  Job,
  JobCreate,
  JobSummary,
  JobUpdate
} from '../types/job';
import { BaseApiService } from './baseApiService';

export class JobService extends BaseApiService {
  static async createJob(data: JobCreate): Promise<Job> {
    return this.handleCreateRequest<Job>(
      async () =>
        supabase
          .from('jobs')
          .insert(data)
          .select('*') // jobs_with_balance view'ından gelen alanlar burada olmaz, direkt tablodan gelir
          .single(),
      'İş oluşturulamadı'
    );
  }

  static async getJobById(id: string): Promise<JobSummary> { // JobSummary dönebiliriz
    return this.handleRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance') // Detayları view'dan çekelim ki bakiye bilgileri de gelsin
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .eq('job_id', id) // View'daki sütun adı job_id olduğu için burada eq buna göre olmalı
          .single(),
      'İş detayları getirilemedi'
    );
  }

  static async getJobsByCustomerId(customerId: string): Promise<JobSummary[]> {
    return this.handleListRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance') // View'dan çekiyoruz
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .eq('customer_id', customerId)
          .order('job_date', { ascending: false }),
      'Müşteriye ait işler getirilemedi'
    );
  }
  
  static async getJobsByVehicleId(vehicleId: string): Promise<JobSummary[]> {
    return this.handleListRequest<JobSummary>(
      async () =>
        supabase
          .from('jobs_with_balance') // View'dan çekiyoruz
          .select('id:job_id, customer_id, vehicle_id, job_description, job_date, total_cost, status:job_status, notes:job_notes, created_at:job_created_at, updated_at:job_updated_at, total_paid_for_job, total_refunded_for_job, remaining_balance_for_job')
          .eq('vehicle_id', vehicleId)
          .order('job_date', { ascending: false }),
      'Araca ait işler getirilemedi'
    );
  }

  static async updateJob(id: string, data: JobUpdate): Promise<Job> {
    // Güncelleme ana `jobs` tablosuna yapılır, bakiye view üzerinden okunur.
    return this.handleUpdateRequest<Job>(
      async () =>
        supabase
          .from('jobs')
          .update(data)
          .eq('id', id)
          .select('*') 
          .single(),
      'İş güncellenemedi'
    );
  }

  static async deleteJob(id: string): Promise<void> {
    // Bir işi silmeden önce, ilişkili finansal işlemleri ne yapacağımıza karar vermeliyiz.
    // ON DELETE SET NULL olduğu için job_id'leri null olacak. Bu istenen davranış mı?
    // Ya da iş silinirken tüm finansal kayıtları da silmeli miyiz (bu genellikle istenmez)?
    // Şimdilik sadece işi siliyoruz.
    return this.handleDeleteRequest(
      async () => supabase.from('jobs').delete().eq('id', id),
      'İş silinemedi'
    );
  }

  // İleride bir işin durumunu güncellemek için özel bir fonksiyon eklenebilir.
  // static async updateJobStatus(id: string, status: JobStatus): Promise<Job> { ... }
} 