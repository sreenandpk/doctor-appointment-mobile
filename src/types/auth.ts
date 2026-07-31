import { UserRole } from '@/constants';
import { DoctorProfile } from './doctor';
import { PatientProfile } from './patient';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  PatientProfile?: PatientProfile;
  DoctorProfile?: DoctorProfile;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
}
