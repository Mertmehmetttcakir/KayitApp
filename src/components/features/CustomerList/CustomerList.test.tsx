import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { CustomerList } from './CustomerList';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Ahmet Yılmaz',
            email: 'ahmet@example.com',
            phone: '5551234567',
            vehicles: [],
            status: 'active',
            lastAppointment: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        error: null
      })
    }))
  }))
}));

describe('CustomerList', () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerList />
      </QueryClientProvider>
    );
  });

  it('renders customer list title', () => {
    expect(screen.getByText('Müşteri Listesi')).toBeInTheDocument();
  });

  it('displays customer information', async () => {
    // Wait for the customer data to load
    const customerName = await screen.findByText('Ahmet Yılmaz');
    expect(customerName).toBeInTheDocument();

    // Check for other customer details
    expect(screen.getByText('5551234567')).toBeInTheDocument();
    expect(screen.getByText('ahmet@example.com')).toBeInTheDocument();
  });

  it('shows action buttons for each customer', async () => {
    const detailButtons = await screen.findAllByText('Detaylar');
    const deleteButtons = await screen.findAllByText('Sil');

    expect(detailButtons).toHaveLength(1);
    expect(deleteButtons).toHaveLength(1);
  });
}); 