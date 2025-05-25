import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer } from '../types/customer';

interface CustomerState {
  customers: Record<string, Customer>;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: {},
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Record<string, Customer>>) => {
      state.customers = action.payload;
      state.loading = false;
      state.error = null;
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers[action.payload.id] = action.payload;
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      state.customers[action.payload.id] = action.payload;
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      delete state.customers[action.payload];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setLoading,
  setError,
} = customerSlice.actions;

export default customerSlice.reducer; 