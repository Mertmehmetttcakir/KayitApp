import { supabase } from '../lib/supabase';
import { HttpError } from '../middleware/errorMiddleware';
import { RevenueFilterParams, TotalRevenue } from '../types/dashboard';
import { BaseApiService } from './baseApiService';
import { ErrorLogger } from './errorLogger';

export class DashboardService extends BaseApiService {
  static async getTotalRevenue(params?: RevenueFilterParams): Promise<TotalRevenue> {
    const errorMessage = 'Toplam ciro getirilemedi';
    try {
      let query = supabase.from('paid_jobs_revenue').select('paid_amount');

      if (params) {
        const targetDate = new Date(params.date);
        if (params.period === 'daily') {
          query = query.eq('payment_day_ts', params.date);
        } else if (params.period === 'weekly') {
          const dForIsoYear = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
          dForIsoYear.setUTCDate(dForIsoYear.getUTCDate() + 4 - (dForIsoYear.getUTCDay() || 7));
          const isoYear = dForIsoYear.getUTCFullYear();

          const weekString = await this.getWeekOfYear(targetDate);
          const week = parseInt(weekString, 10);
          
          if (isNaN(week)) {
            console.warn(`Geçersiz hafta hesaplandı: ${params.date}, hafta: ${weekString}`);
            await ErrorLogger.logError(new Error('Geçersiz hafta hesaplandı'), { date: params.date, calculatedWeek: weekString });
          }
          query = query.eq('payment_isoyear_num', isoYear).eq('payment_week_num', week);
        } else if (params.period === 'monthly') {
          const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).toISOString().split('T')[0];
          query = query.eq('payment_month_ts', firstDayOfMonth);
        } else if (params.period === 'yearly') {
          const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1).toISOString().split('T')[0];
          query = query.eq('payment_year_ts', firstDayOfYear);
        }
      }

      const { data, error } = await query;

      if (error) {
        const statusCode = typeof error.code === 'string' ? parseInt(error.code, 10) : error.code || 500;
        await ErrorLogger.logApiError(errorMessage, statusCode, error, { params });
        throw new HttpError(error.message || errorMessage, statusCode);
      }

      const revenueData = data as { paid_amount: number | null }[] | null;
      const total = revenueData?.reduce((acc, item) => acc + (item.paid_amount || 0), 0) || 0;
      return { total };

    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const errorToLog = error instanceof Error ? error : new Error(String(error));
      await ErrorLogger.logError(errorToLog, { params, originalErrorMessage: errorMessage }); 
      throw new HttpError(errorMessage, 500);
    }
  }

  private static async getWeekOfYear(date: Date): Promise<string> {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7).toString();
  }
} 