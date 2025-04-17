import { UserProfile } from "./user-profile.model";

export interface JwtAuthResponse {
    accessToken: string;
    tokenType?: string; // Optional if always 'Bearer'
    
  user: UserProfile;   // <-- Add this property to hold user details
  }