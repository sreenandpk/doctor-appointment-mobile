import { UserRole } from '@/constants';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
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
