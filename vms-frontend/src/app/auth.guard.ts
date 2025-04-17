// src/app/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { map, tap, combineLatest, Observable, take, of } from 'rxjs'; // <-- Make sure 'of' is imported

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Check for observable existence
  if (typeof authService.isAdmin$ === 'undefined' ||
      typeof authService.isOrganizer$ === 'undefined' ||
      typeof authService.isVolunteer$ === 'undefined') {
    console.error("AuthGuard Critical Error: AuthService is missing required role observables. Redirecting to home.");
    // FIX: Wrap the UrlTree in of()
    return of(router.createUrlTree(['/'])); // <--- Changed line
  }

  // Combine the latest values... (rest of the code remains the same)
  return combineLatest([
    authService.isAdmin$,
    authService.isOrganizer$,
    authService.isVolunteer$
  ]).pipe(
    take(1),
    map(([isAdmin, isOrganizer, isVolunteer]) => {
      // ... (rest of the mapping logic) ...
      const targetUrl = state.url;
      let allowAccess = false;
      let requiredRolesDesc = '';

      if (targetUrl.includes('/profile')) {
        requiredRolesDesc = 'Admin/Organizer/Volunteer';
        allowAccess = isAdmin || isOrganizer || isVolunteer;
      } else if (targetUrl.includes('/events')) { // *** ADD THIS CHECK FOR EVENTS ***
        requiredRolesDesc = 'Admin/Organizer/Volunteer';   // Events allow Volunteers too
        allowAccess = isAdmin || isOrganizer || isVolunteer; // Grant access if any of these roles

      }else {
        requiredRolesDesc = 'Admin/Organizer';
        allowAccess = isAdmin || isOrganizer;
      }

      const userRoleDesc = isVolunteer ? 'Volunteer' : (isAdmin ? 'Admin' : (isOrganizer ? 'Organizer' : 'Non-Admin/Org/Vol'));
      console.log(
        `AuthGuard: Checking access for ${targetUrl}. ` +
        `User Roles: (Admin: ${isAdmin}, Organizer: ${isOrganizer}, Volunteer: ${isVolunteer}). ` +
        `Required for this route: ${requiredRolesDesc}. Access Decision: ${allowAccess ? 'GRANTED' : 'DENIED'}`
      );

      if (allowAccess) {
        return true;
      } else {
        console.warn(`AuthGuard: Access DENIED to ${targetUrl}. User (${userRoleDesc}) lacks required roles (${requiredRolesDesc}).`);
        const redirectUrl = '/';
        console.log(`AuthGuard: Redirecting user to ${redirectUrl}.`);
        return router.createUrlTree([redirectUrl]);
      }
    }),
    // Optional: Tap for logging the final decision *before* it's returned by the guard
    tap(decision => {
      if (decision === true) {
        console.log(`AuthGuard: Final decision is GRANT access.`);
      } else if (decision instanceof UrlTree) {
        console.log(`AuthGuard: Final decision is REDIRECT to: ${decision.toString()}`);
      } else {
        console.warn(`AuthGuard: Unexpected final decision type: ${typeof decision}`);
      }
    })
  );
};