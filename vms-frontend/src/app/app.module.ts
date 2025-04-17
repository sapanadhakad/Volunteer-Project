// src/app/app.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router'; // Import Router
import { AuthService } from './auth.service'; // Import AuthService
import { Observable } from 'rxjs'; // Import Observable

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
export class AppComponent {
  title = 'vms-frontend-ng';
  isLoggedIn$: Observable<boolean>; // Observable for reactive updates in template

  // Expose isLoggedIn directly for simpler conditional logic in template
  get isLoggedIn(): boolean {
    return this.authService.isUserLoggedIn();
  }


  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$; // Assign observable
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login after logout
  }
}