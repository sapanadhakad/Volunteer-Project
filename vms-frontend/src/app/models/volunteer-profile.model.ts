export interface VolunteerProfile {
    volunteerRecordId: number;
    userId: number;
    name: string;
    email: string;
    phoneNumber: string | null;
    availability: string | null;
    skills: string | null;
  }