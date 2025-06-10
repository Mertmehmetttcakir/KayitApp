import { supabase } from '../lib/supabase';
import { HttpError } from '../middleware/errorMiddleware';
import {
    CustomerReport,
    FinancialReport,
    ReportExportOptions,
    ReportFilters,
    RevenueChartData,
    ServiceReport,
    TechnicianReport
} from '../types/reports';
import { BaseApiService } from './baseApiService';
import { ErrorLogger } from './errorLogger';

export class ReportsService extends BaseApiService {
  /**
   * Finansal rapor verilerini getirir
   */
  static async getFinancialReport(filters: ReportFilters): Promise<FinancialReport> {
    const errorMessage = 'Finansal rapor getirilemedi';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Tarih aralığını belirle
      const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = filters.dateRange?.end || new Date().toISOString();

      // Mevcut dönem işleri - jobs tablosundan direkt veri al
      let currentJobsQuery = supabase
        .from('jobs')
        .select('id, total_cost, customer_id')
        .gte('job_date', startDate)
        .lte('job_date', endDate);

      if (filters.customerId) {
        currentJobsQuery = currentJobsQuery.eq('customer_id', filters.customerId);
      } else {
        // User'ın müşterilerinin işlerini getir
        const { data: userCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id);
        
        if (userCustomers && userCustomers.length > 0) {
          const customerIds = userCustomers.map(c => c.id);
          currentJobsQuery = currentJobsQuery.in('customer_id', customerIds);
        } else {
          // Hiç müşteri yoksa boş sonuç döndür
          return {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            paidAmount: 0,
            pendingAmount: 0,
            refundAmount: 0,
            revenueGrowth: 0,
            profitMargin: 0,
            previousPeriodRevenue: 0
          };
        }
      }

      const { data: currentJobs, error: jobsError } = await currentJobsQuery;
      
      if (jobsError) {
        console.error('Jobs sorgu hatası:', jobsError);
        throw new Error(`İş verileri alınamadı: ${jobsError.message}`);
      }

      // Toplam gelir potansiyeli
      const totalRevenuePotential = currentJobs?.reduce((acc, job) => acc + (job.total_cost || 0), 0) || 0;

      // Gerçek ödemeler - financial_transactions tablosundan
      let paymentsQuery = supabase
        .from('financial_transactions')
        .select('amount, job_id')
        .eq('transaction_type', 'PAYMENT')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (filters.customerId) {
        paymentsQuery = paymentsQuery.eq('customer_id', filters.customerId);
      }

      const { data: payments, error: paymentsError } = await paymentsQuery;
      
      if (paymentsError) {
        console.error('Payments sorgu hatası:', paymentsError);
      }

      const totalRevenue = payments?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0;

      // Bekleyen ödemeler hesapla
      const jobPayments = new Map<string, number>();
      payments?.forEach(payment => {
        if (payment.job_id) {
          jobPayments.set(payment.job_id, (jobPayments.get(payment.job_id) || 0) + (payment.amount || 0));
        }
      });

      let pendingAmount = 0;
      currentJobs?.forEach(job => {
        const paidForJob = jobPayments.get(job.id) || 0;
        const remaining = (job.total_cost || 0) - paidForJob;
        if (remaining > 0) {
          pendingAmount += remaining;
        }
      });

      // İadeler
      let refundsQuery = supabase
        .from('financial_transactions')
        .select('amount')
        .eq('transaction_type', 'REFUND')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (filters.customerId) {
        refundsQuery = refundsQuery.eq('customer_id', filters.customerId);
      }

      const { data: refunds } = await refundsQuery;
      const refundAmount = refunds?.reduce((acc, refund) => acc + (refund.amount || 0), 0) || 0;

      // Önceki dönem karşılaştırması için basit bir hesaplama
      const periodDiff = this.calculatePeriodDifference(startDate, endDate);
      const previousStartDate = this.subtractPeriod(startDate, periodDiff);
      const previousEndDate = this.subtractPeriod(endDate, periodDiff);

      let previousPaymentsQuery = supabase
        .from('financial_transactions')
        .select('amount')
        .eq('transaction_type', 'PAYMENT')
        .gte('transaction_date', previousStartDate)
        .lte('transaction_date', previousEndDate);

      if (filters.customerId) {
        previousPaymentsQuery = previousPaymentsQuery.eq('customer_id', filters.customerId);
      }

      const { data: previousPayments } = await previousPaymentsQuery;
      const previousPeriodRevenue = previousPayments?.reduce((acc, payment) => acc + (payment.amount || 0), 0) || 0;

      const revenueGrowth = previousPeriodRevenue > 0 
        ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
        : 0;

      const netProfit = totalRevenue - refundAmount;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        totalRevenue,
        totalExpenses: refundAmount, // Şimdilik iadeler gider olarak sayılıyor
        netProfit,
        paidAmount: totalRevenue,
        pendingAmount,
        refundAmount,
        revenueGrowth,
        profitMargin,
        previousPeriodRevenue
      };

    } catch (error) {
      console.error('Finansal rapor hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Müşteri rapor verilerini getirir
   */
  static async getCustomerReport(filters: ReportFilters): Promise<CustomerReport> {
    const errorMessage = 'Müşteri raporu getirilemedi';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Tarih aralığını belirle
      const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = filters.dateRange?.end || new Date().toISOString();

      if (filters.customerId) {
        // Belirli bir müşteri için rapor
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', filters.customerId)
          .single();

        if (customerError || !customer) {
          throw new Error('Müşteri bulunamadı');
        }

        // Bu müşterinin iş sayısı
        const { data: jobs, count: jobCount, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .eq('customer_id', filters.customerId)
          .gte('job_date', startDate)
          .lte('job_date', endDate);

        if (jobsError) {
          console.error('Müşteri işleri sorgu hatası:', jobsError);
        }

        // Bu müşterinin toplam harcaması
        const totalSpent = jobs?.reduce((acc, job) => acc + (job.total_cost || 0), 0) || 0;

        return {
          totalCustomers: 1,
          newCustomers: 0,
          returningCustomers: 1,
          customerRetentionRate: 100,
          averageCustomerValue: totalSpent,
          customerGrowth: 0,
          topCustomers: [{
            id: customer.id,
            name: customer.full_name,
            totalSpent: totalSpent,
            jobCount: jobCount || 0
          }]
        };
      } else {
        // Tüm müşteriler için rapor
        // Toplam müşteri sayısı
        const { data: totalCustomers, count: totalCustomerCount, error: customersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);

        if (customersError) {
          console.error('Müşteriler sorgu hatası:', customersError);
        }

        // Yeni müşteriler (seçili dönemde)
        const { data: newCustomers, count: newCustomerCount, error: newCustomersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (newCustomersError) {
          console.error('Yeni müşteriler sorgu hatası:', newCustomersError);
        }

        // En çok iş yaptıran müşteriler - jobs tablosundan hesapla
        const { data: allJobs, error: allJobsError } = await supabase
          .from('jobs')
          .select('customer_id, total_cost, customers(id, full_name)')
          .gte('job_date', startDate)
          .lte('job_date', endDate);

        if (allJobsError) {
          console.error('Tüm işler sorgu hatası:', allJobsError);
        }

        // User'ın müşterilerini filtrele
        const userCustomerIds = new Set(totalCustomers?.map(c => c.id) || []);
        const filteredJobs = allJobs?.filter(job => userCustomerIds.has(job.customer_id)) || [];

        // Müşteri bazında toplam harcama hesapla
        const customerSpending = new Map<string, { name: string; totalSpent: number; jobCount: number }>();
        
        filteredJobs.forEach(job => {
          const customerId = job.customer_id;
          const customerName = (job.customers as any)?.full_name || 'Bilinmeyen';
          
          if (!customerSpending.has(customerId)) {
            customerSpending.set(customerId, {
              name: customerName,
              totalSpent: 0,
              jobCount: 0
            });
          }
          
          const customerData = customerSpending.get(customerId)!;
          customerData.totalSpent += job.total_cost || 0;
          customerData.jobCount += 1;
        });

        const topCustomers = Array.from(customerSpending.entries())
          .map(([id, data]) => ({
            id,
            name: data.name,
            totalSpent: data.totalSpent,
            jobCount: data.jobCount
          }))
          .sort((a, b) => b.totalSpent - a.totalSpent)
          .slice(0, 10);

        const averageCustomerValue = topCustomers.length > 0 
          ? topCustomers.reduce((acc, customer) => acc + customer.totalSpent, 0) / topCustomers.length 
          : 0;

        return {
          totalCustomers: totalCustomerCount || 0,
          newCustomers: newCustomerCount || 0,
          returningCustomers: (totalCustomerCount || 0) - (newCustomerCount || 0),
          customerRetentionRate: totalCustomerCount && totalCustomerCount > 0 ? 
            (((totalCustomerCount - (newCustomerCount || 0)) / totalCustomerCount) * 100) : 0,
          averageCustomerValue,
          customerGrowth: 0, // Bu hesaplama için önceki dönem verisi gerekli
          topCustomers
        };
      }

    } catch (error) {
      console.error('Müşteri raporu hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Servis rapor verilerini getirir
   */
  static async getServiceReport(filters: ReportFilters): Promise<ServiceReport> {
    const errorMessage = 'Servis raporu getirilemedi';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Kullanıcı kimlik doğrulaması gerekli');
      }

      // Tarih aralığını belirle
      const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
      const endDate = filters.dateRange?.end || new Date().toISOString();

      // İş istatistikleri
      let jobsQuery = supabase
        .from('jobs')
        .select('id, status, total_cost, job_description')
        .gte('job_date', startDate)
        .lte('job_date', endDate);

      if (filters.customerId) {
        jobsQuery = jobsQuery.eq('customer_id', filters.customerId);
      } else {
        // User'ın müşterilerinin işlerini getir
        const { data: userCustomers } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', user.id);
        
        if (userCustomers && userCustomers.length > 0) {
          const customerIds = userCustomers.map(c => c.id);
          jobsQuery = jobsQuery.in('customer_id', customerIds);
        } else {
          // Hiç müşteri yoksa boş sonuç döndür
          return {
            totalJobs: 0,
            completedJobs: 0,
            pendingJobs: 0,
            cancelledJobs: 0,
            averageJobValue: 0,
            averageCompletionTime: 0,
            jobGrowth: 0,
            popularServices: []
          };
        }
      }

      const { data: jobs, error: jobsError } = await jobsQuery;

      if (jobsError) {
        console.error('Servis işleri sorgu hatası:', jobsError);
        throw new Error(`Servis verileri alınamadı: ${jobsError.message}`);
      }

      const totalJobs = jobs?.length || 0;
      const completedJobs = jobs?.filter(job => job.status === 'Tamamen Ödendi').length || 0;
      const pendingJobs = jobs?.filter(job => job.status === 'Açık' || job.status === 'Tamamlandı - Ödeme Bekliyor').length || 0;
      const cancelledJobs = jobs?.filter(job => job.status === 'İptal Edildi').length || 0;
      
      const averageJobValue = jobs && jobs.length > 0 ? 
        jobs.reduce((acc, job) => acc + (job.total_cost || 0), 0) / jobs.length : 0;

      // Popüler servisler analizi
      const serviceCount: Record<string, { count: number; revenue: number }> = {};
      jobs?.forEach(job => {
        const service = job.job_description || 'Belirtilmemiş';
        if (!serviceCount[service]) {
          serviceCount[service] = { count: 0, revenue: 0 };
        }
        serviceCount[service].count++;
        serviceCount[service].revenue += job.total_cost || 0;
      });

      const popularServices = Object.entries(serviceCount)
        .map(([service, data]) => ({ service, count: data.count, revenue: data.revenue }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalJobs,
        completedJobs,
        pendingJobs,
        cancelledJobs,
        averageJobValue,
        averageCompletionTime: 0, // Bu veri için ek hesaplama gerekli
        jobGrowth: 0, // Bu hesaplama için önceki dönem verisi gerekli
        popularServices
      };

    } catch (error) {
      console.error('Servis raporu hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Teknisyen rapor verilerini getirir
   */
  static async getTechnicianReport(filters: ReportFilters): Promise<TechnicianReport> {
    const errorMessage = 'Teknisyen raporu getirilemedi';
    try {
      console.log('Teknisyen raporu için basit veri döndürülüyor...');
      // Şimdilik basit bir implementasyon - gerçek veri olmadığı için
      return {
        totalTechnicians: 5,
        activeTechnicians: 4,
        workload: [
          { technicianId: '1', name: 'Ahmet Yılmaz', completedJobs: 12, totalRevenue: 25000, averageRating: 4.8, efficiency: 95 },
          { technicianId: '2', name: 'Mehmet Demir', completedJobs: 8, totalRevenue: 18000, averageRating: 4.5, efficiency: 87 },
          { technicianId: '3', name: 'Ali Kaya', completedJobs: 15, totalRevenue: 32000, averageRating: 4.9, efficiency: 98 },
          { technicianId: '4', name: 'Mustafa Özkan', completedJobs: 6, totalRevenue: 12000, averageRating: 4.3, efficiency: 82 }
        ],
        productivity: {
          averageJobsPerDay: 2.5,
          averageRevenuePerTechnician: 15000,
          totalWorkHours: 160
        }
      };
    } catch (error) {
      console.error('Teknisyen raporu hatası:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { filters, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Gelir chart verilerini getirir
   */
  static async getRevenueChartData(filters: ReportFilters): Promise<RevenueChartData> {
    // Tarih aralığını belirle
    const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const endDate = filters.dateRange?.end || new Date().toISOString();

    // Base query
    let query = supabase.from('jobs').select(`
      job_date,
      total_cost
    `);

    // Müşteri filtresi varsa ekle
    if (filters.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    // Tarih filtresi
    query = query
      .gte('job_date', startDate)
      .lte('job_date', endDate)
      .order('job_date', { ascending: true });

    const { data: jobs, error } = await query;

    if (error) {
      throw new Error(`Gelir grafiği verileri alınamadı: ${error.message}`);
    }

    // Günlük verileri grupla
    const dailyRevenue = jobs?.reduce((acc: Record<string, number>, job) => {
      const date = new Date(job.job_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (job.total_cost || 0);
      return acc;
    }, {}) || {};

    // Chart formatına dönüştür
    const daily = Object.entries(dailyRevenue).map(([date, value]) => ({
      date,
      name: new Date(date).toLocaleDateString('tr-TR'),
      value: Number(value),
    }));

    // Haftalık, aylık ve yıllık veriler için de benzer işlemler yapılabilir
    // Şu an için sadece günlük veri döndürüyoruz
    return {
      daily,
      weekly: [], // TODO: Implement weekly grouping
      monthly: [], // TODO: Implement monthly grouping
      yearly: [], // TODO: Implement yearly grouping
    };
  }

  /**
   * Müşteri iş verilerini getirir
   */
  static async getCustomerJobsData(customerId: string, filters: ReportFilters): Promise<any[]> {
    const startDate = filters.dateRange?.start || new Date(new Date().getFullYear(), 0, 1).toISOString();
    const endDate = filters.dateRange?.end || new Date().toISOString();

    // Jobs ve financial_transactions tablosundan veri çek
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        job_description,
        job_date,
        total_cost,
        financial_transactions (
          amount,
          transaction_type
        )
      `)
      .eq('customer_id', customerId)
      .gte('job_date', startDate)
      .lte('job_date', endDate)
      .order('job_date', { ascending: true });

    if (error) {
      throw new Error(`Müşteri iş verileri alınamadı: ${error.message}`);
    }

    if (!jobs) return [];

    // Her iş için ödeme bilgilerini hesapla
    const jobsWithPayments = jobs.map(job => {
      const payments = job.financial_transactions?.filter(
        (transaction: any) => transaction.transaction_type === 'PAYMENT'
      ) || [];
      
      const paidAmount = payments.reduce(
        (sum: number, payment: any) => sum + (payment.amount || 0), 
        0
      );

      const totalCost = job.total_cost || 0;
      const remainingBalance = Math.max(0, totalCost - paidAmount);

      return {
        jobId: job.id,
        jobDescription: job.job_description || 'Açıklama yok',
        jobDate: job.job_date,
        totalCost,
        paidAmount,
        remainingBalance,
      };
    });

    return jobsWithPayments;
  }

  /**
   * Rapor export işlemi
   */
  static async exportReport(
    type: 'financial' | 'customer' | 'service' | 'technician',
    filters: ReportFilters,
    options: ReportExportOptions
  ): Promise<Blob> {
    const errorMessage = 'Rapor export edilemedi';
    try {
      // Bu implementasyon daha sonra geliştirilecek
      // Şimdilik basit bir CSV export yapıyoruz
      
      let reportData: any;
      switch (type) {
        case 'financial':
          reportData = await this.getFinancialReport(filters);
          break;
        case 'customer':
          reportData = await this.getCustomerReport(filters);
          break;
        case 'service':
          reportData = await this.getServiceReport(filters);
          break;
        case 'technician':
          reportData = await this.getTechnicianReport(filters);
          break;
        default:
          throw new Error('Geçersiz rapor tipi');
      }

      // CSV formatında export
      const csvContent = this.convertToCSV(reportData, type);
      return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { type, filters, options, originalErrorMessage: errorMessage });
      throw new HttpError(errorMessage, 500);
    }
  }

  /**
   * Yardımcı fonksiyonlar
   */
  private static calculatePeriodDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static subtractPeriod(dateString: string, days: number): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  }

  private static convertToCSV(data: any, type: string): string {
    // Basit CSV dönüştürme implementasyonu
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(value => 
      typeof value === 'object' ? JSON.stringify(value) : value
    ).join(',');
    
    return `${headers}\n${values}`;
  }
} 