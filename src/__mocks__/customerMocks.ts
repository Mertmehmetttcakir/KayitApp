import { Customer } from '../types/customer';

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '5551234567',
    vehicles: [],
    status: 'active',
    lastAppointment: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]; 