import api from './axios';

export const doctorApi = {
  createSlot: async (slotData: any) => {
    const response = await api.post('/doctor/availability', slotData);
    return response.data;
  },
  getSlots: async () => {
    const response = await api.get('/doctor/availability');
    return response.data;
  },
  updateSlot: async (id: string, slotData: any) => {
    const response = await api.put(`/doctor/availability/${id}`, slotData);
    return response.data;
  },
  deleteSlot: async (id: string) => {
    const response = await api.delete(`/doctor/availability/${id}`);
    return response.data;
  },
  getAppointments: async (params?: any) => {
    const response = await api.get('/doctor/appointments', { params });
    return response.data;
  },
  getAppointmentById: async (id: string) => {
    const response = await api.get(`/doctor/appointments/${id}`);
    return response.data;
  },
};
export default doctorApi;
