import api from './axios';

export const patientApi = {
  searchDoctors: async (params?: any) => {
    const response = await api.get('/patient/doctors', { params });
    return response.data;
  },
  getDoctorDetails: async (id: string) => {
    const response = await api.get(`/patient/doctors/${id}`);
    return response.data;
  },
  bookAppointment: async (bookingData: any) => {
    const response = await api.post('/patient/appointments', bookingData);
    return response.data;
  },
  getAppointments: async (params?: any) => {
    const response = await api.get('/patient/appointments', { params });
    return response.data;
  },
  getAppointmentById: async (id: string) => {
    const response = await api.get(`/patient/appointments/${id}`);
    return response.data;
  },
};
export default patientApi;
