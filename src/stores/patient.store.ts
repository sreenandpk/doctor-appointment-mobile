import { create } from 'zustand';

interface PatientState {
  doctors: any[];
  appointments: any[];
  setDoctors: (doctors: any[]) => void;
  setAppointments: (appointments: any[]) => void;
  reset: () => void;
}

export const usePatientStore = create<PatientState>(set => ({
  doctors: [],
  appointments: [],
  setDoctors: doctors => set({ doctors }),
  setAppointments: appointments => set({ appointments }),
  reset: () => set({ doctors: [], appointments: [] }),
}));
