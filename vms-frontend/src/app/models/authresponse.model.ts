import { User } from "./user.model";

interface AuthResponse {
    token: string;
    user: User; // Or fetch user separately after getting token
  }