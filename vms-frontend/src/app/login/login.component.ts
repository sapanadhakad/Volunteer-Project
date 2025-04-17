// src/app/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Reactive Forms modules
import { Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router'; // Import Router & ActivatedRoute
import { AuthService } from '../auth.service';
import { LoginRequest } from '../models/login-request.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Import ReactiveFormsModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Use definite assignment assertion (!)
  isLoading = false;
  error: string | null = null;
  private returnUrl: string = '/profile'; 
  // Default redirect URL
  //private returnprofile:string = '/profil'

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute // Inject ActivatedRoute to get returnUrl
  ) {}

 























  
// space
  ngOnInit(): void {
    // Get returnUrl from query parameters or default to '/'
    if (this.authService.isUserLoggedIn()) {
      this.redirectBasedOnRole(); 
      // this.router.navigate([this.returnUrl]); // Redirect to home
      return; // Exit ngOnInit early if already logged in
    }
    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/volunteers'; // Redirect to volunteers list

    this.loginForm = this.fb.group({
      // Define form controls and validators
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
   
     // If already logged in, redirect away from login page
    if (this.authService.isUserLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  // Getter for easy access to form controls in the template (optional)
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.error = null; // Clear previous errors
    if (this.loginForm.invalid) {
      console.log('Login form is invalid');
      // Mark all fields as touched to display errors
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const loginData: LoginRequest = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login successful', response);


        
        const userRole = this.authService.getCurrentUserRoleSync(); // Or however you get it now
    console.log('User role detected:', userRole);
    if (userRole === 'volunteer') { // Use your actual role check
      console.log('Redirecting volunteer to profile');
      this.router.navigate(['/profile']); // Navigate AFTER state update should be done
    } else {
      // ... other redirects
    }
        // Redirect to the returnUrl or a default page
        this.redirectBasedOnRole();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        // this.error = `Login failed: ${err.error?.message || err.message || 'Please check credentials and try again.'}`;
         // Check if err.error exists and has a message property
        if (err.error && typeof err.error === 'string') {
            this.error = `Login failed: ${err.error}`; // Handle plain text error response
        } else if (err.error?.message) {
            this.error = `Login failed: ${err.error.message}`; // Handle JSON error response with message
        } else {
            this.error = `Login failed: ${err.statusText }. Please check credentials and try again.`; // Fallback
        }
      }
    });
  }
  private redirectBasedOnRole(): void {
    // *** CRITICAL: Ensure AuthService provides this method ***
    const userRole = this.authService.getCurrentUserRoleSync(); // Assuming this method exists

    console.log('User role detected:', userRole);

    if (userRole === 'organizer') { // Use the exact role string returned by your backend/AuthService
      console.log('Redirecting organizer to home page');
      this.router.navigateByUrl('/'); // Redirect organizers to the home page
    } else if (userRole === 'volunteer') {
      console.log('Redirecting volunteer to profile');
      this.router.navigateByUrl('/profile'); // Redirect volunteers to the profile page
    } else {
      // Fallback redirect if role is unknown or not set
      console.warn('Unknown or missing user role, redirecting to home page.');
      this.router.navigateByUrl('/');
    }
  }
}
