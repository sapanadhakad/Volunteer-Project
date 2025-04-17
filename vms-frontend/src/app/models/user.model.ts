// Example: src/app/models/user.model.ts

export interface User {
    id: number;
    email: string;
  
    // REMOVE or comment out these lines:
    // firstName: string;
    // lastName: string;
  
    // ADD this line to match the backend DTO:
    name: string;
    username?:string;
  
    role: string;
    // Add any other fields that match your UserProfileDto
  }