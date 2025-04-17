// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, map, distinctUntilChanged, of, combineLatest, take } from 'rxjs';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

// Models
import { LoginRequest } from './models/login-request.model';
import { RegisterRequest } from './models/register-request.model';
import { JwtAuthResponse } from './models/jwt-auth-response.model';
import { UserProfile } from './models/user-profile.model';

// *** Ensure this interface matches your backend user details response ***
// *** It MUST include roles and volunteerId if applicable ***


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'authToken';
  private userKey = 'currentUser'; // Key for storing user data (UserProfile)

  // --- Primary State Observables ---
  private _isLoggedIn$ = new BehaviorSubject<boolean>(this.hasToken());
  private _currentUser$ = new BehaviorSubject<UserProfile | null>(this.getCurrentUserFromStorage());

  // --- Public Derived Observables ---
  public isLoggedIn$: Observable<boolean> = this._isLoggedIn$.asObservable().pipe(distinctUntilChanged());
  public currentUser$: Observable<UserProfile | null> = this._currentUser$.asObservable(); // Expose current user observable

  // Derived Roles Observable
  public currentUserRoles$: Observable<string[]> = this.currentUser$.pipe(
    map(user => user?.roles ?? []),
    // distinctUntilChanged() // Careful with array comparison, might emit often
  );

  // Derived Volunteer ID Observable
  public currentVolunteerId$: Observable<number | null> = this.currentUser$.pipe(
    map(user => user?.volunteerId ?? null), // <<<--- Get volunteerId from UserProfile
    distinctUntilChanged()
  );

  // Derived Role Checks
  public isAdmin$: Observable<boolean> = this.currentUserRoles$.pipe(
    map(roles => roles.includes('ROLE_ADMIN')),
    distinctUntilChanged()
  );
  public isOrganizer$: Observable<boolean> = this.currentUserRoles$.pipe(
    map(roles => roles.includes('ROLE_ORGANIZER')),
    distinctUntilChanged()
  );
  public isVolunteer$: Observable<boolean> = this.currentUserRoles$.pipe(
    map(roles => roles.includes('ROLE_VOLUNTEER')),
    distinctUntilChanged()
  );

  // Derived Username/Display Name Observable
  public currentUserName$: Observable<string | null> = this.currentUser$.pipe(
      map(user => user?.email ?? user?.username ?? null), // Adjust logic as needed
      distinctUntilChanged()
  );

  // --- Constructor ---
  constructor(private http: HttpClient, private router: Router) {
    console.log('AuthService Initialized. Logged In:', this._isLoggedIn$.value);
    console.log('AuthService Initialized. User:', this._currentUser$.value);
  }

  // --- Core Auth Methods ---
  login(loginData: LoginRequest): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.apiUrl}/login`, loginData) // Adjust endpoint if needed
      .pipe(
        tap(response => {
          // *** VALIDATE RESPONSE STRUCTURE ***
          if (response?.accessToken && response?.user && Array.isArray(response.user.roles)) {
            console.log('AuthService: Login Success. Response:', response);
            this.storeToken(response.accessToken);
            this.storeUserData(response.user); // Store complete UserProfile

            // *** UPDATE PRIMARY STATE ***
            this._currentUser$.next(response.user);
            this._isLoggedIn$.next(true);

            console.log('AuthService: State updated. User:', this._currentUser$.value);
            console.log('AuthService: State updated. LoggedIn:', this._isLoggedIn$.value);
          } else {
             console.error('AuthService Error: Invalid login response structure.', response);
             this.clearAuthDataAndUpdateState();
             throw new Error('Invalid login response from server.'); // Throw error to signal failure
          }
        }),
        catchError(error => {
            console.error('AuthService Error: Login HTTP request failed.', error);
            this.clearAuthDataAndUpdateState();
            let errorMessage = 'Login failed.';
            if (error.status === 401) errorMessage = 'Invalid username or password.';
            return throwError(() => new Error(errorMessage)); // Propagate error
        })
      );
  }

  register(registerData: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, registerData, { responseType: 'text'});
  }

  logout(): void {
    console.log('AuthService: Logging out.');
    this.clearAuthDataAndUpdateState();
    this.router.navigate(['/login']);
  }

  // --- Storage Methods ---
  private storeToken(token: string): void {
    try { localStorage.setItem(this.tokenKey, token); } catch (e) { console.error("Storage Error:", e); }
  }

  getToken(): string | null {
    try { return localStorage.getItem(this.tokenKey); } catch (e) { console.error("Storage Error:", e); return null; }
  }

  private storeUserData(user: UserProfile): void {
    try { localStorage.setItem(this.userKey, JSON.stringify(user)); } catch (e) { console.error("Storage Error:", e); }
  }

  getCurrentUserFromStorage(): UserProfile | null {
    try {
      const userJson = localStorage.getItem(this.userKey);
      if (userJson) {
          const user = JSON.parse(userJson) as UserProfile;
          // Basic validation
          if (user && typeof user === 'object' && user.id && Array.isArray(user.roles)) {
             // *** Log the volunteerId found in storage ***
             console.log("AuthService: User loaded from storage, volunteerId:", user.volunteerId);
             return user;
          } else {
             console.warn("AuthService: Invalid user data in storage. Clearing.");
             this.clearAuthData(); return null;
          }
      }
      return null;
    } catch (e) {
      console.error("Storage Error:", e); this.clearAuthData(); return null;
    }
  }

  // --- Helper Methods ---
  private hasToken(): boolean {
    return !!this.getToken();
  }

  private clearAuthDataAndUpdateState(): void {
      this.clearAuthData(); // Remove from storage first
      if (this._currentUser$.value !== null) this._currentUser$.next(null);
      if (this._isLoggedIn$.value !== false) this._isLoggedIn$.next(false);
      console.log('AuthService: Auth data cleared, state updated.');
  }

  private clearAuthData(): void {
      try {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
      } catch (e) { console.error("Storage Error:", e); }
  }

  // --- Synchronous Getters (Use Observables where possible) ---
  public isUserLoggedIn(): boolean {
    return this._isLoggedIn$.getValue();
  }

  public getCurrentUser(): UserProfile | null {
    return this._currentUser$.getValue();
  }
  // Inside AuthService class in auth.service.ts

/**
 * Returns the primary role synchronously based on the current BehaviorSubject value.
 * Use observables (e.g., currentUserRoles$) where possible for better reactivity.
 * Ensure role strings match exactly what's in the 'roles' array.
 */
public getCurrentUserRoleSync(): 'admin' | 'organizer' | 'volunteer' | null {
  const user = this._currentUser$.getValue(); // Get current value from BehaviorSubject

  if (!user?.roles?.length) { // Check if user or roles array is null/empty
    console.log("getCurrentUserRoleSync: No user or roles found.");
    return null;
  }

  // Check roles in order of priority (adjust if needed)
  if (user.roles.includes('ROLE_ADMIN')) {
    console.log("getCurrentUserRoleSync: Found ROLE_ADMIN.");
    return 'admin';
  }
  if (user.roles.includes('ROLE_ORGANIZER')) {
    console.log("getCurrentUserRoleSync: Found ROLE_ORGANIZER.");
    return 'organizer';
  }
  if (user.roles.includes('ROLE_VOLUNTEER')) {
    console.log("getCurrentUserRoleSync: Found ROLE_VOLUNTEER.");
    return 'volunteer';
  }

  console.warn(`getCurrentUserRoleSync: User roles (${user.roles.join(', ')}) do not match known primary roles.`);
  return null; // No known primary role found
}

// Make sure _currentUser$ BehaviorSubject is defined earlier in the class
// private _currentUser$ = new BehaviorSubject<UserProfile | null>(this.getCurrentUserFromStorage());


// Inside AuthService class in auth.service.ts
// ... other properties and methods ...

/**
 * Checks if the current user has AT LEAST ONE of the specified roles.
 * Returns an Observable<boolean>.
 * @param rolesToCheck An array of role strings (e.g., ['ROLE_ADMIN', 'ROLE_ORGANIZER'])
 */
public hasAnyRole(rolesToCheck: Array<string>): Observable<boolean> {
  if (!rolesToCheck || rolesToCheck.length === 0) {
  // Decide what to return if no roles are specified for checking
  // 'true' might mean "no specific role required"
  // 'false' might mean "if you don't ask for roles, you don't get access"
  return of(false); // Let's default to false if no roles are specified
  }

  // Use the currentUserRoles$ observable derived from _currentUser$
  return this.currentUserRoles$.pipe(
      map(currentUserRoles => {
          if (!currentUserRoles || currentUserRoles.length === 0) {
              return false; // No roles defined for the current user
          }
          // Check if any role in rolesToCheck exists in the user's current roles
          return rolesToCheck.some(roleToCheck => currentUserRoles.includes(roleToCheck));
      }),
      distinctUntilChanged() // Only emit if the boolean result changes
  );
}

// Ensure currentUserRoles$ is defined earlier, derived from _currentUser$
// public currentUserRoles$: Observable<string[]> = this.currentUser$.pipe(
//   map(user => user?.roles ?? []),
// );
}