import { useToast } from '@chakra-ui/react';
import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { VehicleService } from '../services/vehicleService';
import { Vehicle, VehicleCreate, VehicleUpdate } from '../types/vehicle';

const VEHICLES_QUERY_KEY_PREFIX = 'vehicles';

// Belirli bir müşteriye ait araçları getirmek için hook
export const useCustomerVehicles = (
  customerId: string | undefined,
  options?: Omit<UseQueryOptions<Vehicle[], Error, Vehicle[], (string | undefined)[]>, 'queryKey' | 'queryFn' | 'initialData'>
) => {
  return useQuery<Vehicle[], Error, Vehicle[], (string | undefined)[]>({
    queryKey: [VEHICLES_QUERY_KEY_PREFIX, customerId],
    queryFn: () => {
      if (!customerId) return Promise.resolve([]);
      return VehicleService.getVehiclesByCustomerId(customerId);
    },
    enabled: !!customerId,
    ...options,
  });
};

// Yeni araç oluşturmak için mutation hook
export const useCreateVehicle = (
  options?: Omit<UseMutationOptions<Vehicle, Error, VehicleCreate>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<Vehicle, Error, VehicleCreate>({
    mutationFn: (vehicleData: VehicleCreate) => VehicleService.createVehicle(vehicleData),
    onSuccess: (newVehicle: Vehicle, variables: VehicleCreate, context: unknown) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_QUERY_KEY_PREFIX, variables.customer_id] });
      toast({
        title: 'Araç Oluşturuldu',
        description: `${newVehicle.plate} plakalı araç başarıyla eklendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      options?.onSuccess?.(newVehicle, variables, context);
    },
    onError: (error: Error, variables: VehicleCreate, context: unknown) => {
      toast({
        title: 'Araç Oluşturma Hatası',
        description: error.message || 'Araç oluşturulurken bir hata oluştu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Araç güncellemek için mutation hook
export const useUpdateVehicle = (
  options?: Omit<UseMutationOptions<Vehicle, Error, { id: string; data: VehicleUpdate }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<Vehicle, Error, { id: string; data: VehicleUpdate }>({
    mutationFn: ({ id, data }: { id: string; data: VehicleUpdate }) => VehicleService.updateVehicle(id, data),
    onSuccess: (updatedVehicle: Vehicle, variables: { id: string; data: VehicleUpdate }, context: unknown) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_QUERY_KEY_PREFIX, updatedVehicle.customer_id] });
      toast({
        title: 'Araç Güncellendi',
        description: `${updatedVehicle.plate} plakalı araç başarıyla güncellendi.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      options?.onSuccess?.(updatedVehicle, variables, context);
    },
    onError: (error: Error, variables: { id: string; data: VehicleUpdate }, context: unknown) => {
      toast({
        title: 'Araç Güncelleme Hatası',
        description: error.message || 'Araç güncellenirken bir hata oluştu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Araç silmek için mutation hook
export const useDeleteVehicle = (
  options?: Omit<UseMutationOptions<void, Error, { vehicleId: string; customerId: string }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<void, Error, { vehicleId: string; customerId: string }>({
    mutationFn: ({ vehicleId }: { vehicleId: string; customerId: string }) => VehicleService.deleteVehicle(vehicleId),
    onSuccess: (data: void, variables: { vehicleId: string; customerId: string }, context: unknown) => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_QUERY_KEY_PREFIX, variables.customerId] });
      toast({
        title: 'Araç Silindi',
        description: 'Araç başarıyla silindi.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (error: Error, variables: { vehicleId: string; customerId: string }, context: unknown) => {
      toast({
        title: 'Araç Silme Hatası',
        description: error.message || 'Araç silinirken bir hata oluştu.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

export const useVehicles = () => {
  const { data: vehicles, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => VehicleService.getAllVehicles(),
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 30 * 60 * 1000, // 30 dakika
  });

  return {
    vehicles,
    isLoading,
    error,
  };
}; 