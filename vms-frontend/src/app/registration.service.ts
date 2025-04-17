// src/app/registration.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environments/environment'; // Optional: for API base URL

@Injectable({
  providedIn: 'root' // Service available application-wide
})
export class RegistrationService {

  // Define the base URL for registration-related endpoints
  // Option 1: Use environment variable
  private apiUrl = `${environment.apiUrl}/registrations`; // e.g., http://localhost:8080/api/registrations

  // Option 2: Hardcode (less flexible)
  // private apiUrl = 'http://localhost:8080/api/registrations';

  constructor(private http: HttpClient) {}

  /**
   * Registers the currently authenticated user for a specific event.
   * Assumes an AuthInterceptor adds the necessary Authorization header.
   * Backend endpoint: POST /api/registrations
   * Backend expected body: { "eventId": number }
   * Backend response: Could be the created registration object, or just status 201.
   * @param eventId The ID of the event to register for.
   * @returns Observable<any> - Emits the response body (e.g., created registration) or null on error.
   */
  registerForEvent(eventId: number): Observable<any> {
    const body = { eventId: eventId };
    console.log(`RegistrationService: Attempting to register for event ${eventId}`);
    return this.http.post<any>(this.apiUrl, body).pipe(
      map(response => {
        console.log(`RegistrationService: Successfully registered for event ${eventId}`, response);
        return response; // Return the backend response (might be registration details)
      }),
      catchError(this.handleError<any>(`registerForEvent eventId=${eventId}`))
    );
  }

  /**
   * Fetches a Set of event IDs for which the currently authenticated user is registered.
   * Assumes an AuthInterceptor adds the necessary Authorization header.
   * Backend endpoint: GET /api/registrations/myevents/ids
   * Backend response: An array of numbers (event IDs), e.g., [1, 5, 12]
   * @returns Observable<Set<number>> - Emits a Set containing the event IDs. Emits empty Set on error.
   */
  getUserRegisteredEventIds(): Observable<Set<number>> {
    const url = `${this.apiUrl}/myevents/ids`; // Construct the specific URL
    console.log(`RegistrationService: Fetching registered event IDs from ${url}`);
    return this.http.get<number[]>(url).pipe(
      map(eventIdsArray => {
        console.log(`RegistrationService: Received event ID array:`, eventIdsArray);
        // Convert the array of numbers into a Set for efficient lookup
        return new Set(eventIdsArray);
      }),
      catchError(this.handleError<Set<number>>('getUserRegisteredEventIds', new Set<number>())) // Return empty Set on error
    );
  }

  /**
   * Basic error handling for HTTP requests.
   * @param operation - Name of the operation that failed.
   * @param result - Optional value to return as the observable result.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);

      // TODO: Send the error to remote logging infrastructure if needed

      // Let the app keep running by returning a safe result (e.g., empty set/array, default object).
      // The component calling this service should check for this and potentially display a user-friendly error.
      // For critical errors, you might want to re-throw or navigate to an error page.
      return of(result as T); // Return the safe result so the app doesn't crash
      // Or rethrow a more specific error:
      // return throwError(() => new Error(`Error during ${operation}: ${error.statusText || 'Unknown error'}`));
    };
  }
}