import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/auth';
import { api } from './api';

// Demo kullanıcılar
const DEMO_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin Kullanıcı',
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['manage_customers', 'manage_appointments', 'manage_technicians', 'manage_services', 'view_reports', 'manage_users']
  },
  {
    id: '2',
    username: 'teknisyen',
    name: 'Teknisyen Kullanıcı',
    email: 'teknisyen@example.com',
    role: 'technician',
    permissions: ['manage_appointments']
  },
  {
    id: '3',
    username: 'user',
    name: 'Normal Kullanıcı',
    email: 'user@example.com',
    role: 'user',
    permissions: []
  }
];

// Demo kullanıcı şifreleri (gerçek bir uygulamada asla bu şekilde saklamayın)
const DEMO_PASSWORDS: Record<string, string> = {
  'admin': 'admin123',
  'teknisyen': 'teknisyen123',
  'user': 'user123'
};

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // API bağlantısı olmadığı için mock login işlemi
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { username, password } = credentials;
        
        // Demo kullanıcıyı kontrol et
        const user = DEMO_USERS.find(u => u.username === username);
        
        if (!user || DEMO_PASSWORDS[username] !== password) {
          reject(new Error('Kullanıcı adı veya şifre hatalı'));
          return;
        }
        
        // Token oluştur (gerçek bir uygulamada JWT kullanılmalıdır)
        const token = `mock-token-${user.id}-${Date.now()}`;
        const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;
        
        // Token ve kullanıcı bilgilerini kaydet
        this.setTokens(token, refreshToken);
        this.setUser(user);
        
        // Başarılı yanıt döndür
        resolve({
          user,
          token,
          refreshToken,
          expiresAt: Date.now() + 3600000 // 1 saat sonra
        });
      }, 500); // 500ms gecikme ile yanıt
    });
  }

  async register(userData: RegisterRequest): Promise<User> {
    // API bağlantısı olmadığı için mock register işlemi
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Kullanıcı adının benzersiz olup olmadığını kontrol et
        if (DEMO_USERS.some(u => u.username === userData.username)) {
          reject(new Error('Bu kullanıcı adı zaten kullanılıyor'));
          return;
        }
        
        // Yeni kullanıcı oluştur
        const newUser: User = {
          id: `${DEMO_USERS.length + 1}`,
          username: userData.username,
          name: userData.name,
          email: userData.email,
          role: userData.role as 'user' | 'admin' | 'technician' || 'user',
          permissions: []
        };
        
        // Demo kullanıcılar listesine ekle (gerçek bir uygulamada veritabanına kaydedilir)
        DEMO_USERS.push(newUser);
        
        // Demo şifreler listesine ekle (gerçek bir uygulamada hash'lenerek saklanır)
        DEMO_PASSWORDS[userData.username] = userData.password;
        
        // Başarılı yanıt döndür
        resolve(newUser);
      }, 700); // 700ms gecikme ile yanıt
    });
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      this.clearAuth();
    }
  }

  async getProfile(): Promise<User> {
    // API bağlantısı olmadığı için mock profil bilgisi getirme
    return new Promise((resolve, reject) => {
      const user = this.getUser();
      
      if (!user) {
        reject(new Error('Kullanıcı bulunamadı'));
        return;
      }
      
      resolve(user);
    });
  }

  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        this.clearAuth();
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }
}

export const authService = new AuthService(); 