// src/app/_guards/role.guard.ts

import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router, // Import Router for redirection
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
// import { TokenStorageService } from '../../_services/token-storage.service'; // Adjust path as needed
import { TokenStorageService } from '../services/token-storage.service'; 

@Injectable({
  providedIn: 'root'
})
export class roleGuard  { // Removed 'implements CanActivate' as it's implicitly handled by the method signature in standalone APIs or used explicitly in older versions/module-based guards. Keep 'implements CanActivate' if using older Angular or module-based guards.

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Get the expected roles from the route data
    // We expect roles to be passed in the route data like: { data: { roles: ['ADMIN', 'MODERATOR'] } }
    const expectedRoles = route.data?.['roles'] as Array<string>; // Use optional chaining and type assertion

    // If no roles are defined for the route, block access by default for safety
    if (!expectedRoles || expectedRoles.length === 0) {
      console.warn('RoleGuard: No expected roles defined for route:', state.url);
      // Redirect to a 'forbidden' page or home page
      return this.router.createUrlTree(['/forbidden']); // Or '/home' or '/login'
    }

    // 2. Get the current user's data from storage
    const currentUser = this.tokenStorageService.getUser();

    // If user data is not available (should ideally be caught by AuthGuard first, but good to check)
    if (!currentUser) {
      console.warn('RoleGuard: User not found in storage. Redirecting to login.');
       // Redirect to login page, passing the attempted URL as a query parameter
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // 3. Get the user's actual roles
    const userRoles = currentUser.roles;

    if (!userRoles || userRoles.length === 0) {
        console.warn('RoleGuard: User has no roles assigned.');
        return this.router.createUrlTree(['/forbidden']); // Or home
    }

    // 4. Check if the user has at least one of the expected roles
    // The .some() method returns true if at least one element in the array passes the test
    const hasRequiredRole = expectedRoles.some(role => userRoles.includes(role));

    if (hasRequiredRole) {
      // User has the required role, allow access
      return true;
    } else {
      // User does not have the required role, block access and redirect
      console.warn(`RoleGuard: Access denied. User roles (${userRoles.join(', ')}) do not include required roles (${expectedRoles.join(', ')}) for route:`, state.url);
      return this.router.createUrlTree(['/forbidden']); // Redirect to a generic forbidden/access denied page
    }
  }
}