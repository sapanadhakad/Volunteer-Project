// src/app/models/volunteer.model.ts
export interface Volunteer {
    id: number; // Assuming ID is a number
    name: string;
    email: string;
    phoneNumber?: string; // Use '?' for optional fields
    skills?: string;
    availability?: string;
    // Add other fields from your DTO if necessary
  }