// src/app/admin.guard.ts - MORE ROBUST VERSION
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take, catchError, of } from 'rxjs'; // Import catchError, of

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
      take(1), // Important to prevent infinite loops if stream doesn't complete
      map(user => {
          // Explicitly check if user and roles exist and roles is an array
          const hasAdminRole =
              user != null && // Check if user is not null/undefined
              Array.isArray(user.roles) && // Check if roles is an array
              user.roles.includes('ROLE_ADMIN'); // Check for the role

          // Debugging: Log the user object itself
          console.log(`AdminGuard checking for path: ${state.url}. User object:`, user);
          console.log(`AdminGuard determined admin status: ${hasAdminRole}`);

          if (hasAdminRole) {
              return true; // Allow access
          } else {
              console.log(`AdminGuard: Access denied for path ${state.url}. User is not an admin or roles missing.`);
              router.navigate(['/home']); // Redirect non-admins
              return false; // Deny access
          }
      }),
      catchError((error) => {
          // Handle potential errors within the observable pipe itself
          console.error('AdminGuard: Error checking user roles:', error);
          router.navigate(['/login']); // Redirect to login on error
          return of(false); // Deny access if there was an error
      })
  );
};