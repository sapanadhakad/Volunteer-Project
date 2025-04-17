// src/app/models/volunteer-summary.model.ts (or similar)
export interface VolunteerSummary {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string; // Optional fields based on backend
    skills?: string;
    availability?: string;
}