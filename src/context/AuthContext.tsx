import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as AppUser, LoginRequest } from '../types/auth';
import { clearCacheOnUserChange } from '../utils/cacheUtils';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null; // Session state'i eklendi
  isAuthenticated: boolean;
  isLoading: boolean; // İlk oturum yüklemesi için
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta true
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ? (currentSession.user as unknown as AppUser) : null);
      setIsLoading(false);
    }).catch((_err) => {
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        const previousUserId = user?.id;
        const newUserId = newSession?.user?.id;
        
        setSession(newSession);
        setUser(newSession?.user ? (newSession.user as unknown as AppUser) : null);
        
        // Kullanıcı değiştiğinde cache'i temizle
        if (previousUserId !== newUserId) {
          clearCacheOnUserChange(queryClient);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true); 
    setError(null);
    try {
      // LoginRequest tipinin { email: string, password: string } içerdiği varsayılıyor.
      // Eğer src/types/auth.ts dosyasındaki tanım farklıysa, burası veya tip tanımı güncellenmeli.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email, // Bu satır LoginRequest.email erişimine neden oluyor
        password: credentials.password,
      });
      if (signInError) {
        throw signInError;
      }
    } catch (error: any) {
      setError(error.message || 'Giriş başarısız');
      throw error; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      // Çıkış yapmadan önce cache'i temizle
      clearCacheOnUserChange(queryClient);
      
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }
    } catch (error: any) {
      setError(error.message || 'Çıkış yapılırken hata oluştu');
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session, 
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 