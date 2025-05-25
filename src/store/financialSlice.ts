import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FinancialRecord } from '../types';

interface FinancialState {
  records: Record<string, FinancialRecord>;
  loading: boolean;
  error: string | null;
  totalRevenue: number;
  pendingPayments: number;
}

const initialState: FinancialState = {
  records: {},
  loading: false,
  error: null,
  totalRevenue: 0,
  pendingPayments: 0,
};

const financialSlice = createSlice({
  name: 'financial',
  initialState,
  reducers: {
    setRecords: (state, action: PayloadAction<Record<string, FinancialRecord>>) => {
      state.records = action.payload;
      state.loading = false;
      state.error = null;
      state.totalRevenue = Object.values(action.payload)
        .filter(record => record.status === 'completed')
        .reduce((sum, record) => sum + record.amount, 0);
      state.pendingPayments = Object.values(action.payload)
        .filter(record => record.status === 'pending')
        .reduce((sum, record) => sum + record.amount, 0);
    },
    addRecord: (state, action: PayloadAction<FinancialRecord>) => {
      state.records[action.payload.id] = action.payload;
      if (action.payload.status === 'completed') {
        state.totalRevenue += action.payload.amount;
      } else if (action.payload.status === 'pending') {
        state.pendingPayments += action.payload.amount;
      }
    },
    updateRecord: (state, action: PayloadAction<FinancialRecord>) => {
      const oldRecord = state.records[action.payload.id];
      if (oldRecord) {
        if (oldRecord.status === 'completed') {
          state.totalRevenue -= oldRecord.amount;
        } else if (oldRecord.status === 'pending') {
          state.pendingPayments -= oldRecord.amount;
        }
      }
      state.records[action.payload.id] = action.payload;
      if (action.payload.status === 'completed') {
        state.totalRevenue += action.payload.amount;
      } else if (action.payload.status === 'pending') {
        state.pendingPayments += action.payload.amount;
      }
    },
    deleteRecord: (state, action: PayloadAction<string>) => {
      const record = state.records[action.payload];
      if (record) {
        if (record.status === 'completed') {
          state.totalRevenue -= record.amount;
        } else if (record.status === 'pending') {
          state.pendingPayments -= record.amount;
        }
        delete state.records[action.payload];
      }
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
  setRecords,
  addRecord,
  updateRecord,
  deleteRecord,
  setLoading,
  setError,
} = financialSlice.actions;

export default financialSlice.reducer; 