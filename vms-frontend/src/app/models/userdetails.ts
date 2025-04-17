export interface UserDetails {
    id: number;
    username: string;
    email: string;
    roles: string[];
    volunteerId?: number; // <-- Add this if your API returns it after login
    // Add other relevant fields
}