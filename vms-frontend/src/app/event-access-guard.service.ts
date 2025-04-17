import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, take, tap } from 'rxjs/operators';

import { AuthService } from './auth.service'; // Adjust path if needed
import { EventService } from './event.service'; // Adjust path if needed
import { UserProfile } from './models/user-profile.model'; // Your UserProfile model
import { Event } from './models/event.model'; // Your Event model

@Injectable({
  providedIn: 'root'
})
export class EventAccessGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // --- 1. Get Event ID from Route ---
    const eventIdParam = route.paramMap.get('id');
    if (!eventIdParam) {
      console.error('EventAccessGuard: Event ID missing in route parameters.');
      return this.router.parseUrl('/events'); // Redirect to a safe default page
    }

    const eventId = +eventIdParam;
    if (isNaN(eventId)) {
       console.error('EventAccessGuard: Invalid Event ID format in route parameters.');
       return this.router.parseUrl('/events');
    }

    // --- 2. Get Current User from AuthService Observable ---
    return this.authService.currentUser$.pipe( // *** Use currentUser$ from your AuthService ***
      take(1), // Ensure we only take the current value and complete
      switchMap((currentUser: UserProfile | null) => {

        // --- 3. Check if User is Logged In ---
        if (!currentUser) {
          console.log('EventAccessGuard: No user logged in. Redirecting to login.');
          // Store the attempted URL for redirection after login (optional, implement in AuthService if needed)
          // this.authService.redirectUrl = state.url;
          return of(this.router.parseUrl('/login')); // Use 'of' to return Observable<UrlTree>
        }

        // Log the user being checked
        console.log(`EventAccessGuard: Checking access for User '${currentUser.username}' (ID: ${currentUser.id}, Roles: ${currentUser.roles}) to event ${eventId}.`);

        // --- 4. Check if User is Admin ---
        // Use the roles array from the UserProfile object
        if (currentUser.roles?.includes('ROLE_ADMIN')) {
          console.log(`EventAccessGuard: User '${currentUser.username}' is Admin. Access granted.`);
          return of(true); // Admins always have access
        }

        // --- 5. If Not Admin, Check if User is the Organizer of *this* Event ---
        console.log(`EventAccessGuard: User '${currentUser.username}' is not Admin. Checking if they are the organizer of event ${eventId}.`);
        return this.eventService.getEventById(eventId).pipe(
          map((event: Event) => {
            // *** CRITICAL: Compare event organizer with current user's identifier ***

            // >>> Option A: If event.organizer stores the USERNAME <<<
            const isOrganizer = event.organizerName === currentUser.username;
            if (isOrganizer) {
                 console.log(`EventAccessGuard: User '${currentUser.username}' IS the organizer (Username Match). Access granted.`);
                 return true;
            }

            /*
            // >>> Option B: If event.organizer stores the USER ID <<<
            const isOrganizerById = event.organizerId === currentUser.id; // Assumes Event has organizerId and UserProfile has id
            if (isOrganizerById) {
                 console.log(`EventAccessGuard: User ID ${currentUser.id} IS the organizer (ID Match). Access granted.`);
                 return true;
            }
            */

            // If none of the above checks passed:
            console.warn(`EventAccessGuard: User '${currentUser.username}' is NOT the organizer of event ${eventId} (Event Organizer: '${event.organizerName}'). Access denied.`);
             // Redirect to a "forbidden" page or back to event details/list
            return this.router.parseUrl(`/events/${eventId}`); // Redirect back to view? Or '/unauthorized'
            // return false; // Alternative: just deny access without redirect
          }),
          catchError((error) => {
            console.error(`EventAccessGuard: Error fetching event ${eventId} for organizer check:`, error);
            // Handle cases like event not found (404), server error (5xx)
            if (error.status === 404) {
                // Event doesn't exist, maybe redirect to list or a 404 page
                 return of(this.router.parseUrl('/events?error=event_not_found'));
            }
            // For other errors, maybe a general error page or back to list
            return of(this.router.parseUrl('/events?error=event_check_failed'));
          })
        );
      }),
      catchError((error) => {
         // Handle potential errors during the initial currentUser$ emission (unlikely but possible)
         console.error('EventAccessGuard: Error accessing authentication state:', error);
         // this.authService.redirectUrl = state.url; // Store intended URL
         return of(this.router.parseUrl('/login')); // Redirect to login on auth state error
      })
    );
  }
}