// src/app/organizer-or-admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, map, tap } from 'rxjs';

export const organizerOrAdminGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Combine isAdmin$ and isOrganizer$ observables
  return authService.currentUser$.pipe(
    map(user => {
      const roles = user?.roles ?? []; // Get roles or empty array if user/roles is null
      const isAllowed = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_ORGANIZER');
      console.log(`OrganizerOrAdminGuard: Checking access for ${state.url}. User roles: ${roles.join(', ')}. Allowed: ${isAllowed}`);
      return isAllowed;
    }),
    tap(isAllowed => {
      if (!isAllowed) {
        console.log(`OrganizerOrAdminGuard: Access denied for path ${state.url}. User lacks required role (Admin or Organizer). Redirecting to home.`);
        // Redirect to a default page like home if the user is logged in but lacks the role
        router.navigate(['/']); // Or navigate to an 'access-denied' page
      }
    }),
    map(isAllowed => isAllowed || router.createUrlTree(['/'])) // Return true if allowed, otherwise return UrlTree for redirection
  );
};