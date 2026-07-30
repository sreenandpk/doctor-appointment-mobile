export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
}
