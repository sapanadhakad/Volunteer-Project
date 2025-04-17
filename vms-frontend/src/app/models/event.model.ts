import { VolunteerSummary } from "./voluntersummary";

export interface Event {
    id: number;
    name: string;
    description?: string;
    location?: string;
    startDateTime: string | Date; // Use string or Date
    endDateTime: string | Date;   // Use string or Date
    slotsAvailable?: number;
    // assignedVolunteerIds?: number[]; // If needed
    // assignedVolunteerName?: string[]; 
    assignedVolunteers?: VolunteerSummary[];
    organizerId?: number; // Make optional if sometimes not present
    organizerName?: string;
    
}