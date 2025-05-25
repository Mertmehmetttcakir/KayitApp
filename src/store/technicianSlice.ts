import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { Technician } from '../types/technician';

interface TechnicianState {
  technicians: Record<string, Technician>;
  loading: boolean;
  error: string | null;
  availableTechnicians: string[];
}

const initialState: TechnicianState = {
  technicians: {},
  loading: false,
  error: null,
  availableTechnicians: [],
};

const technicianSlice = createSlice({
  name: 'technician',
  initialState,
  reducers: {
    setTechnicians: (state: TechnicianState, action: PayloadAction<Record<string, Technician>>) => {
      state.technicians = action.payload;
      state.loading = false;
      state.error = null;
      // Müsait teknisyenleri güncelle
      state.availableTechnicians = Object.keys(action.payload)
        .filter(id => action.payload[id].isAvailable)
        .map(id => id);
    },
    addTechnician: (state: TechnicianState, action: PayloadAction<Technician>) => {
      state.technicians[action.payload.id] = action.payload;
      if (action.payload.isAvailable) {
        state.availableTechnicians.push(action.payload.id);
      }
    },
    updateTechnician: (state: TechnicianState, action: PayloadAction<Technician>) => {
      state.technicians[action.payload.id] = action.payload;
      // Müsait teknisyenler listesini güncelle
      state.availableTechnicians = Object.keys(state.technicians)
        .filter(id => state.technicians[id].isAvailable)
        .map(id => id);
    },
    deleteTechnician: (state: TechnicianState, action: PayloadAction<string>) => {
      delete state.technicians[action.payload];
      state.availableTechnicians = state.availableTechnicians
        .filter((id: string) => id !== action.payload);
    },
    setLoading: (state: TechnicianState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: TechnicianState, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setTechnicians,
  addTechnician,
  updateTechnician,
  deleteTechnician,
  setLoading,
  setError,
} = technicianSlice.actions;

export default technicianSlice.reducer; 