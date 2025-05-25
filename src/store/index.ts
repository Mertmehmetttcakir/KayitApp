import { configureStore } from '@reduxjs/toolkit';
import appointmentReducer from './appointmentSlice';
import customerReducer from './customerSlice';
import financialReducer from './financialSlice';
import technicianReducer from './technicianSlice';

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    appointment: appointmentReducer,
    financial: financialReducer,
    technician: technicianReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 