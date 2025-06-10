import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { UserRole } from './useUserRole';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Tüm kullanıcıları getir
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });

  // Kullanıcı rolünü güncelle
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  // Kullanıcı durumunu güncelle
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'inactive' | 'suspended' }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ status })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Kullanıcı sil
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Önce user_profiles tablosundan sil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      // Sonra auth.users tablosundan sil (admin API gerekli)
      // Bu işlem için Supabase Admin API kullanılmalı
      // Şimdilik sadece profile siliyoruz
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUserRole: (userId: string, newRole: UserRole) => 
      updateUserRoleMutation.mutate({ userId, newRole }),
    updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => 
      updateUserStatusMutation.mutate({ userId, status }),
    deleteUser: (userId: string) => deleteUserMutation.mutate(userId),
    isUpdatingRole: updateUserRoleMutation.isPending,
    isUpdatingStatus: updateUserStatusMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}; 