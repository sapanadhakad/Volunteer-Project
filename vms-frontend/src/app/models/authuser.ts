export interface AuthUser {
    id: number;
    username: string;
    email: string;
    roles: string[]; // Array of role names (e.g., ['ROLE_USER', 'ROLE_ADMIN'])
    // Add other relevant non-sensitive fields if needed
  }
  