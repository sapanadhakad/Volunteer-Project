// src/app/app.component.ts
import { Component } from '@angular/core'; // Removed OnInit, OnDestroy
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Observable, tap } from 'rxjs'; // Keep Observable
import { AuthService} from './auth.service'; // Adjust path, import UserProfile
import { UserProfile } from './models/user-profile.model'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent { // Removed implements OnInit, OnDestroy
  title = 'vms-frontend-ng';
  currentYear: number = new Date().getFullYear();

  // --- Expose Observables directly from AuthService ---
  isLoggedIn$: Observable<boolean>;
  // isAdmin$: Observable<boolean>; // Keep if needed in template
  // isOrganizer$: Observable<boolean>; // Keep if needed in template
  userName$: Observable<string | null>;
  roles$: Observable<string[]>; // Observable for roles
  currentVolunteerId$: Observable<number | null>; // Observable for volunteer ID
  

  // Remove component state properties like isLoggedIn, roles, currentVolunteerId

  constructor(
    private authService: AuthService,
    private router: Router
    // Remove TokenStorageService if only used for the logic we deleted
  ) {
    // Assign observables from the service
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    // this.isAdmin$ = this.authService.isAdmin$;
    // this.isOrganizer$ = this.authService.isOrganizer$;
    this.userName$ = this.authService.currentUserName$;
    this.roles$ = this.authService.currentUserRoles$; // Get roles observable
    this.currentVolunteerId$ = this.authService.currentVolunteerId$; // Get volunteer ID observable
    
  }

  // Remove ngOnInit and ngOnDestroy methods

  logout(): void {
    this.authService.logout();
    // No need to manually clear state here, AuthService handles it
    // Router navigate is handled within authService.logout() now
  }
}