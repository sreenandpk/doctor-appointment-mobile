import { patientApi } from '@/api/patient.api';
import { usePatientStore } from '@/stores/patient.store';

export const patientService = {
  searchDoctors: async (params?: any) => {
    const data = await patientApi.searchDoctors(params);
    usePatientStore.getState().setDoctors(data.data || []);
    return data;
  },

  loadAppointments: async (params?: any) => {
    const data = await patientApi.getAppointments(params);
    usePatientStore.getState().setAppointments(data.data || []);
    return data;
  },
};

export default patientService;
