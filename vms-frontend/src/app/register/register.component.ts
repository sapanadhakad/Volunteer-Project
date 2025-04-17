import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Reactive Forms
import { Router, RouterLink } from '@angular/router'; // Import Router and RouterLink
import { AuthService } from '../auth.service';
import { RegisterRequest } from '../models/register-request.model'; // Import the model

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Add ReactiveFormsModule
    RouterLink // Add RouterLink for the "Login here" link
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();

     // Optional: If user is already logged in, redirect away from register page
     if (this.authService.isUserLoggedIn()) {
        this.router.navigate(['/volunteers']); // Or home page
     }
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
  
      // --- THIS LINE IS CRUCIAL ---
      // Ensure the key here is exactly 'roleName'
      roleName: ['', Validators.required],
      // ---------------------------
  
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(100)]]
    });
  }
  // Helper getter for easy access in template
  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.error = null; // Clear previous messages
    this.successMessage = null;
    this.registerForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    if (this.registerForm.invalid) {
      const firstInvalidControl = Object.keys(this.f).find(field => this.f[field].invalid);
      console.log(`Form invalid. First invalid control: ${firstInvalidControl}`);
      this.registerForm.markAllAsTouched(); // Show validation errors on all fields
      return;
    }

    this.isLoading = true;
    const registerData: RegisterRequest = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: (responseMessage) => {
        this.isLoading = false;
        this.successMessage = responseMessage || "Registration successful! Please login."; // Display success
        console.log('Registration successful', responseMessage);
        this.registerForm.reset(); // Clear the form
        // Optionally redirect after a delay or keep the user here to see the message
        // setTimeout(() => this.router.navigate(['/login']), 3000); // Example redirect after 3s
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Registration failed', err);
        // Try to extract a meaningful error message from the backend response
        if (err.error && typeof err.error === 'string') {
            this.error = err.error; // Handle plain text error response
        } else if (err.error?.message) {
            this.error = `Registration failed: ${err.error.message}`; // Handle JSON error response with message
        } else if (err.status === 400) { // Common status for validation errors / already exists
             this.error = 'Registration failed. Username or email might already be taken. Please check your input.';
        } else if (err.status === 409) { // Conflict - Often used for existing user
          this.error = 'Registration failed. Username or email already exists.';
     }else {
            this.error = `Registration failed: ${err.statusText || 'An unexpected error occurred.'}`; // Fallback
        }
      }
    });
  }
}