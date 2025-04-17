import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '.././auth.service';
import { UserService } from '.././user.service'; // Assuming you created this
import { User } from '.././models/user.model'; // Import the User model
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone:true,
  imports:[CommonModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Or .scss, etc.
})
export class HomeComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  userData: User | null = null;
  errorMessage: string | null = null;
  private userSub: Subscription | null = null;

  // Inject AuthService, UserService, and Router
  // Make authService public so it can be easily accessed in the template
  constructor(
    public authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if logged in when the component initializes
    if (this.authService.isUserLoggedIn()) {
      this.fetchUserProfile();
    }
    // No need for an else block here, the template handles the !isLoggedIn case
  }

  fetchUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userData = null; // Clear previous data if refetching

    this.userSub = this.userService.getUserProfile().subscribe({
      next: (user) => {
        this.userData = user;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        // Handle specific errors (e.g., 401 Unauthorized might mean token expired)
        if (err.status === 401 || err.status === 403) {
           this.errorMessage = 'Your session may have expired. Please log out and log back in.';
           // Optionally force logout
           // this.authService.logout();
           // this.router.navigate(['/login']);
        } else {
           this.errorMessage = 'Could not load your profile data. Please try again later.';
        }
        this.isLoading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.userData = null; // Clear user data on logout
    this.router.navigate(['/login']); // Navigate to login page after logout
  }

  // Best practice: Unsubscribe to prevent memory leaks when component is destroyed
  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }
}