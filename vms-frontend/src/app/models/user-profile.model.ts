export interface UserProfile {
  id: number; // User ID
  username: string;
  email: string;
  roles: string[];
  volunteerId?: number|null;// SPECIFIC ID of the associated Volunteer profile (if different from user id)
  // Add other fields like 'name' if available
}