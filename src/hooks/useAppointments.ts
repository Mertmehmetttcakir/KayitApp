import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppointmentService } from '../services/appointmentService';
import { Appointment, AppointmentCreate, AppointmentFilters } from '../types/appointment';

export const useAppointments = (filters?: AppointmentFilters) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', filters],
    queryFn: () => AppointmentService.getAppointments(),
  });

  const { mutate: createAppointment, isPending: isCreating } = useMutation({
    mutationFn: (data: AppointmentCreate) => AppointmentService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Randevu oluşturuldu',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Randevu oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: createRecurringAppointments, isPending: isCreatingRecurring } = useMutation({
    mutationFn: (data: AppointmentCreate) => AppointmentService.createRecurringAppointments(data),
    onSuccess: (data: Appointment[]) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: `${data.length} tekrarlayan randevu oluşturuldu`,
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Tekrarlayan randevular oluşturulamadı',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: updateAppointment, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AppointmentCreate> }) =>
      AppointmentService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Randevu güncellendi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Randevu güncellenemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  const { mutate: deleteAppointment, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => AppointmentService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Randevu silindi',
        status: 'success',
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: 'Randevu silinemedi',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    },
  });

  return {
    appointments,
    isLoading,
    createAppointment,
    createRecurringAppointments,
    updateAppointment,
    deleteAppointment,
    isCreating,
    isCreatingRecurring,
    isUpdating,
    isDeleting,
  };
}; 