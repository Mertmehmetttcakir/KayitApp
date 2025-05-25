import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { CustomerService } from '../services/customerService';
import { Customer, CustomerFilters, CustomerFormData } from '../types/customer';

export const useCustomers = (filters: CustomerFilters) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => CustomerService.getCustomers(),
  });

  const { mutate: createCustomer, isPending: isCreating } = useMutation({
    mutationFn: (customer: CustomerFormData) => CustomerService.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Müşteri oluşturuldu',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Müşteri oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: updateCustomer, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      CustomerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Müşteri güncellendi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Müşteri güncellenemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: deleteCustomer, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => CustomerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Müşteri silindi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Müşteri silinemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting,
  };
};

const CUSTOMERS_QUERY_KEY_PREFIX = 'customers';

export const useCustomerById = (
  customerId: string | undefined,
  options?: Omit<UseQueryOptions<Customer, Error, Customer, (string | undefined)[]>, 'queryKey' | 'queryFn' | 'initialData'>
) => {
  return useQuery<Customer, Error, Customer, (string | undefined)[]>(
    {
      queryKey: [CUSTOMERS_QUERY_KEY_PREFIX, 'detail', customerId],
      queryFn: () => {
        if (!customerId) return Promise.reject(new Error('Müşteri ID gerekli'));
        return CustomerService.getCustomerById(customerId);
      },
      enabled: !!customerId,
      ...options,
    }
  );
}; 