import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboardService';
import { RevenueFilterParams, TotalRevenue } from '../types/dashboard';

const DASHBOARD_QUERY_KEY_PREFIX = 'dashboard';

export const useTotalRevenue = (
  params?: RevenueFilterParams,
  options?: Omit<
    UseQueryOptions<
      TotalRevenue,
      Error,
      TotalRevenue,
      (string | RevenueFilterParams | undefined)[]
    >,
    'queryKey' | 'queryFn' | 'initialData'
  >
) => {
  // queryKey'i dinamik hale getiriyoruz ki params değiştiğinde yeni sorgu yapılsın.
  const queryKey = params 
    ? [DASHBOARD_QUERY_KEY_PREFIX, 'totalRevenue', params.period, params.date] 
    : [DASHBOARD_QUERY_KEY_PREFIX, 'totalRevenue', 'all'];

  return useQuery<
    TotalRevenue,
    Error,
    TotalRevenue,
    (string | RevenueFilterParams | undefined)[]
  >({
    queryKey: queryKey as any, // TypeScript'in burada biraz yardıma ihtiyacı olabilir
    queryFn: () => DashboardService.getTotalRevenue(params),
    staleTime: 0, // Cache'i hemen stale yap
    refetchOnMount: true, // Mount olduğunda yeniden fetch et
    ...options,
  });
}; 