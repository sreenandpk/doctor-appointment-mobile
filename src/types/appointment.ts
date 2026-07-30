import { DoctorProfile } from './doctor';
import { PatientProfile } from './patient';

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  slotId: string;
  appointmentDate: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  doctor?: DoctorProfile;
  patient?: PatientProfile;
}
