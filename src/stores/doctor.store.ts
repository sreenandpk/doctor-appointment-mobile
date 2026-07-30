import { create } from 'zustand';

interface DoctorState {
  slots: any[];
  appointments: any[];
  setSlots: (slots: any[]) => void;
  setAppointments: (appointments: any[]) => void;
  reset: () => void;
}

export const useDoctorStore = create<DoctorState>(set => ({
  slots: [],
  appointments: [],
  setSlots: slots => set({ slots }),
  setAppointments: appointments => set({ appointments }),
  reset: () => set({ slots: [], appointments: [] }),
}));
