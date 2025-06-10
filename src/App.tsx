import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ErrorInfo } from 'react';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { CacheDebugButton } from './components/common/CacheDebugButton';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { MainLayout } from './components/layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { CompanySettingsPage } from './pages/admin/CompanySettingsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import AppointmentCalendar from './pages/appointments/AppointmentCalendar';
import { AuthCallback } from './pages/auth/AuthCallback';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { UpdatePasswordPage } from './pages/auth/UpdatePasswordPage';
import { CustomerDetailsPage } from './pages/customers/CustomerDetailsPage';
import CustomerList from './pages/customers/CustomerList';
import { Dashboard } from './pages/Dashboard';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { theme } from './theme';

// React Query client oluştur
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 dakika
    },
  },
});

// Hata Sınırı Bileşeni
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Yakalanan Hata:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1>Bir Hata Oluştu</h1>
          <p>Üzgünüz, beklenmedik bir hata meydana geldi.</p>
          <pre style={{color: 'red', marginTop: '20px'}}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Debug component ekle
const RouteDebugger: React.FC = () => {
  const location = useLocation();
  React.useEffect(() => {
    console.log('Current Path:', location.pathname);
    console.log('Current Search:', location.search);
    console.log('Current Hash:', location.hash);
  }, [location]);
  return null;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
              <Router>
                <RouteDebugger />
                <CacheDebugButton />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/customers" element={<CustomerList />} />
                    <Route path="/customers/:id" element={<CustomerDetailsPage />} />
                      <Route path="/appointments" element={<AppointmentCalendar />} />
                      <Route path="/appointments/:id" element={<div>Randevu Detay</div>} />
                      <Route path="/vehicles" element={<div>Araçlar</div>} />
                      <Route path="/technicians" element={<div>Teknisyenler</div>} />
                      <Route path="/services" element={<div>Servis Geçmişi</div>} />
                      <Route path="/reports" element={<ReportsPage />} />
                    </Route>
                  </Route>
                  
                  {/* Admin only routes */}
                  <Route element={<ProtectedRoute requiredPermission="manage_users" />}>
                    <Route element={<MainLayout />}>
                      <Route path="/admin/users" element={<UserManagementPage />} />
                      <Route path="/admin/company" element={<CompanySettingsPage />} />
                      <Route path="/admin/settings" element={<SystemSettingsPage />} />
                    </Route>
                  </Route>
                  
                  {/* Default redirects */}
                  <Route path="*" element={<div>Sayfa Bulunamadı</div>} />
                </Routes>
              </Router>
          </AuthProvider>
        </QueryClientProvider>
      </ChakraProvider>
    </ErrorBoundary>
  );
}; 