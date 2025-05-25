import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Appointment } from '../types';

interface AppointmentState {
  appointments: Record<string, Appointment>;
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentState = {
  appointments: {},
  loading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action: PayloadAction<Record<string, Appointment>>) => {
      state.appointments = action.payload;
      state.loading = false;
      state.error = null;
    },
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments[action.payload.id] = action.payload;
    },
    updateAppointment: (state, action: PayloadAction<Appointment>) => {
      state.appointments[action.payload.id] = action.payload;
    },
    deleteAppointment: (state, action: PayloadAction<string>) => {
      delete state.appointments[action.payload];
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
  setAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  setLoading,
  setError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer; 