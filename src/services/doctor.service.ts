import { doctorApi } from '@/api/doctor.api';
import { useDoctorStore } from '@/stores/doctor.store';

export const doctorService = {
  loadSlots: async () => {
    const data = await doctorApi.getSlots();
    useDoctorStore.getState().setSlots(data.data || []);
    return data;
  },

  loadAppointments: async (params?: any) => {
    const data = await doctorApi.getAppointments(params);
    useDoctorStore.getState().setAppointments(data.data || []);
    return data;
  },
};

export default doctorService;
