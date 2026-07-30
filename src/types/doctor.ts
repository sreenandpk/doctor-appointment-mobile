export interface DoctorProfile {
  id: string;
  userId: string;
  fullName: string;
  specialization: string;
  qualification: string;
  experienceYears: number;
  consultationFee: string;
  nextAvailableDate?: string;
}

export interface AvailabilitySlot {
  id: string;
  doctorId: string;
  availableDate: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}
