export interface LoginRequest {
    usernameOrEmail: string;
    password?: string; // Make optional if sometimes handled differently
  }
  