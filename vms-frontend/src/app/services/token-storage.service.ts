// src/app/_services/token-storage.service.ts  (Adjust path as needed)

import { Injectable } from '@angular/core';
import { AuthUser } from '../models/authuser'; 
// Define keys for sessionStorage items
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

// Optional: Define a basic structure for the user object you store
// Align this with the user data you receive from your backend login response

@Injectable({
  providedIn: 'root' // Makes the service a singleton available app-wide
})
export class TokenStorageService {

  constructor() { }

  /**
   * Clears all authentication data from session storage.
   * Typically called on logout.
   */
  public signOut(): void {
    window.sessionStorage.clear();
    // If using localStorage, use window.localStorage.clear();
    console.log('TokenStorageService: Cleared session storage.');
  }

  /**
   * Saves the authentication token to session storage.
   * @param token The authentication token string received from the backend.
   */
  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY); // Remove old token first
    window.sessionStorage.setItem(TOKEN_KEY, token);
    // console.log('TokenStorageService: Token saved.'); // Optional logging
  }

  /**
   * Retrieves the authentication token from session storage.
   * @returns The token string or null if not found.
   */
  public getToken(): string | null {
    return window.sessionStorage.getItem(TOKEN_KEY);
  }

  /**
   * Saves the user information object to session storage.
   * The object should be serializable (no complex classes or functions).
   * @param user The user data object received from the backend.
   */
  public saveUser(user: AuthUser): void {
    window.sessionStorage.removeItem(USER_KEY); // Remove old user data first
    try {
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      // console.log('TokenStorageService: User data saved.'); // Optional logging
    } catch (e) {
      console.error('Error saving user to sessionStorage:', e);
    }
  }

  /**
   * Retrieves the user information object from session storage.
   * @returns The parsed user object (matching AuthUser interface) or null if not found or parsing fails.
   */
  public getUser(): AuthUser | null {
    const userJson = window.sessionStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as AuthUser;
      } catch (e) {
        console.error('Error parsing user from sessionStorage:', e);
        // Optionally clear corrupted data
        // window.sessionStorage.removeItem(USER_KEY);
        return null;
      }
    }
    return null;
  }

  /**
   * Checks if a user is currently logged in (i.e., if a token exists).
   * Note: This doesn't validate the token's expiry, only its presence.
   * @returns True if a token is found in storage, false otherwise.
   */
  public isLoggedIn(): boolean {
    return !!this.getToken(); // Converts string|null to boolean
  }
}

// --- Notes ---
// 1. sessionStorage vs. localStorage:
//    - sessionStorage: Cleared when the browser tab/window is closed. Generally more secure for tokens.
//    - localStorage: Persists even after the browser is closed. Use for "Remember Me", but requires careful handling of token expiration and potentially using refresh tokens. Change `sessionStorage` to `localStorage` everywhere if needed.
//
// 2. Security: Never store highly sensitive information (like raw passwords) in browser storage. Tokens should have a reasonable expiration time enforced by the backend.
//
// 3. User Object: The `AuthUser` interface should match the structure of the user data your login endpoint returns (excluding sensitive info like password hashes).
//
// 4. Integration:
//    - Call `saveToken()` and `saveUser()` in your login component upon successful login.
//    - Call `getToken()` in your HTTP interceptor to add the `Authorization: Bearer <token>` header to outgoing API requests.
//    - Call `getUser()` in components to display user info or check roles.
//    - Call `signOut()` in your logout logic.