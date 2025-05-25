import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { Login } from '../../components/auth/Login';
import { AuthProvider } from '../../context/AuthContext';

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('shows validation errors for empty fields', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-posta gerekli/i)).toBeInTheDocument();
      expect(screen.getByText(/şifre gerekli/i)).toBeInTheDocument();
    });
  });
}); 