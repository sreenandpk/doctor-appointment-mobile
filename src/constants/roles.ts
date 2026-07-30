export const ROLES = {
  DOCTOR: 'DOCTOR' as const,
  PATIENT: 'PATIENT' as const,
};

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export default ROLES;
