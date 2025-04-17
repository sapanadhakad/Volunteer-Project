import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { User } from './models/user.model'; // Assuming you have this model
import { environment } from '.././environments/environment'; // For API base URL

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Define the specific API endpoint for fetching the current user's profile
  private usersBaseUrl = `${environment.apiUrl}/users`; // More typical base
  private profileApiUrl = `${this.usersBaseUrl}/me`; // Uses the base URL

  // private profileApiUrl = `${environment.apiUrl}/users/me`; // Example endpoint

  constructor(private http: HttpClient) { }

  /**
   * Fetches the profile data for the currently authenticated user.
   * Assumes an HttpInterceptor is adding the Authorization: Bearer <token> header.
   */
  getUserProfile(): Observable<User> {
    return this.http.get<User>(this.profileApiUrl)
      .pipe(
        catchError(this.handleError) // Add basic error handling
      );
  }

  // Basic error handler (can be expanded)
  private handleError(error: any): Observable<never> {
    console.error('An error occurred in UserService:', error);
    // Could inspect error.status here (e.g., 401, 403, 500)
    // Re-throw the error so subscribers can handle it
    return throwError(() => new Error('Failed to fetch user profile; please try again later.'));
  }


  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersBaseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Delete a user by ID
  deleteUser(id: number): Observable<void> {
    // Using Observable<void> as typically delete operations don't return content
    return this.http.delete<void>(`${this.usersBaseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getUser(id: number): Observable<any> { // Or a more specific type if you parse manually
    return this.http.get(`http://localhost:8080/api/users/${id}`, { responseType: 'text' }) // <-- Change responseType
      .pipe(
        map(responseText => {
          console.warn('Received potentially invalid JSON:', responseText);
          try {
            // Attempt to parse it yourself, potentially cleaning it up first
            return JSON.parse(responseText);
          } catch (parseError) {
            console.error('Manual JSON parsing failed:', parseError);
            // Handle the fact that you received bad data
            throw new Error('Received invalid data from server.');
          }
        }),
        catchError(this.handleError) // Your existing error handler
      );
  }


  // Add other user-related methods here if needed (e.g., updateUserProfile)
}