// src/app/profile-edit/profile-edit.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import ReactiveFormsModule
import { Router, RouterModule } from '@angular/router';
import { Subscription, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import { AuthService } from '../auth.service'; // Adjust path as needed
import { UserService } from '../user.service'; // Adjust path as needed
import { VolunteerService } from '../volunteer.service'; // Adjust path as needed

import { User } from '../models/user.model'; // Adjust path as needed
import { VolunteerProfile } from '../models/volunteer-profile.model'; // Adjust path as needed
import { VolunteerDetails } from '../models/volunteer-details.model'; // Adjust path as needed

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  // *** IMPORTANT: Import ReactiveFormsModule and RouterModule here for standalone ***
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup; // Definite assignment
  isLoading = true;
  error: string | null = null;
  userId: number | null = null;

  private subscriptions: Subscription[] = []; // Array to hold subscriptions

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?.id ?? null; // Get logged-in user's ID

    if (!this.userId) {
      this.error = "Cannot load profile editor. User not logged in or ID not found.";
      this.isLoading = false;
      console.error(this.error);
      // Optional: Redirect to login
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForm();
    this.loadDataForEdit(this.userId);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initializeForm(): void {
    // Create the form structure
    this.profileForm = this.fb.group({
      // --- User fields ---
      // Only include fields the user should potentially edit here.
      // Name might be editable, Email usually isn't directly via profile edit.
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }], // Display only, disabled
      // username: [''], // Add if username is part of User and should be displayed/edited

      // --- Volunteer fields ---
      phoneNumber: [''], // Add Validators.pattern if needed
      availability: [''],
      skills: ['']
    });
  }

  loadDataForEdit(userId: number): void {
    this.isLoading = true;
    this.error = null;

    // Use forkJoin to fetch User and VolunteerProfile data in parallel
    const fetchData$ = forkJoin({
      user: this.userService.getUserById(userId).pipe(catchError(err => {
          console.error("Error fetching user:", err);
          // Don't fail forkJoin for user error if volunteer might still load? Or maybe fail all?
          // Let's rethrow to fail the forkJoin if user fails critically.
          return throwError(() => new Error(`Failed to load user data: ${err.message}`));
      })),
      volunteerProfile: this.volunteerService.getVolunteerProfile(userId).pipe(catchError(err => {
          // Treat 404 for volunteer profile as non-critical, just means it doesn't exist yet
          if (err.message?.includes('404')) { // Check based on your service's error handling
              console.log('Volunteer profile not found (404), okay for editing.');
              return of(null); // Return null if not found
          }
          // Rethrow other volunteer profile errors
          console.error("Error fetching volunteer profile:", err);
          return throwError(() => new Error(`Failed to load volunteer details: ${err.message}`));
      }))
    }).pipe(
      finalize(() => this.isLoading = false) // Ensure loading stops
    );

    const sub = fetchData$.subscribe({
      next: ({ user, volunteerProfile }) => {
        if (!user) {
            // Should have been caught by catchError, but double-check
            this.error = "User data could not be loaded.";
            return;
        }

        // Patch form with fetched data
        this.profileForm.patchValue({
          name: user.name,
          email: user.email,
          // username: user.username, // If using username

          // Patch volunteer details - patchValue handles nulls gracefully
          phoneNumber: volunteerProfile?.phoneNumber,
          availability: volunteerProfile?.availability,
          skills: volunteerProfile?.skills
        });

        console.log('Profile data loaded for editing.');

      },
      error: (err) => {
        // Error from forkJoin (likely from the rethrown errors)
        console.error('Error loading data for edit:', err);
        this.error = err.message || 'Failed to load profile data for editing.';
      }
    });
    this.subscriptions.push(sub); // Add subscription to the array for cleanup
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
       this.error = 'Please correct the errors in the form.';
       this.profileForm.markAllAsTouched(); // Show validation feedback
       return;
    }
    if (!this.userId) {
        this.error = 'Cannot save profile. User ID is missing.';
        return;
    }

    this.isLoading = true;
    this.error = null;

    // --- Prepare Data for Save ---
    // 1. Volunteer Details DTO
    const volunteerDetails: VolunteerDetails = {
      phoneNumber: this.profileForm.value.phoneNumber,
      availability: this.profileForm.value.availability,
      skills: this.profileForm.value.skills
    };

    // 2. *Optional*: User Update DTO (if editing user fields like name)
    // If you need to update user fields too, create the DTO and call UserService
    // const userUpdateData = { name: this.profileForm.value.name };
    // Consider how to handle combined updates (separate calls, single backend endpoint?)
    // For now, focusing on the primary goal: saving volunteer details.

    // --- Call Volunteer Service to Save ---
    const saveSub = this.volunteerService.saveVolunteerDetails(this.userId, volunteerDetails)
      .pipe(
        finalize(() => this.isLoading = false) // Ensure loading stops
      )
      .subscribe({
        next: (updatedProfile) => {
          console.log('Profile details saved successfully:', updatedProfile);
          // Consider using a more user-friendly notification (Snackbar/Toast)
          alert('Profile updated successfully!');
          this.router.navigate(['/profile']); // Navigate back to profile view
        },
        error: (err) => {
          console.error('Error saving profile details:', err);
          this.error = `Save failed: ${err.message || 'Unknown error occurred.'}`;
          // Optionally, inspect err.error for backend-specific messages
          // if (err.error?.message) this.error = `Save failed: ${err.error.message}`;
        }
      });

    this.subscriptions.push(saveSub); // Track subscription

    // *Optional*: Handle User update call here if needed
    // Chain it after volunteer save, or use forkJoin if they can happen in parallel
    // Example: Chaining user update after volunteer save succeeds
    /*
    const saveVolunteer$ = this.volunteerService.saveVolunteerDetails(...);
    const updateUser$ = this.userService.updateUser(this.userId, userUpdateData); // Assuming method exists

    saveVolunteer$.pipe(
        switchMap(savedVolunteer => {
             console.log('Volunteer details saved, now updating user...');
             return updateUser$; // Chain the user update call
        }),
        finalize(() => this.isLoading = false)
    ).subscribe({ // Single subscription handles both chained calls
        next: updatedUser => {
            console.log('User details also updated successfully');
            alert('Profile updated successfully!');
            this.router.navigate(['/profile']);
        },
        error: err => { // Handles errors from *either* saveVolunteer$ or updateUser$
             console.error('Error during profile update:', err);
             this.error = `Update failed: ${err.message || 'Unknown error'}`;
        }
    });
    */
  }

  onCancel(): void {
    this.router.navigate(['/profile']); // Go back without saving
  }

  // --- Template Helper Getters for Validation ---
  get name() { return this.profileForm.get('name'); }
  get email() { return this.profileForm.get('email'); }
  get phoneNumber() { return this.profileForm.get('phoneNumber'); }
  get availability() { return this.profileForm.get('availability'); }
  get skills() { return this.profileForm.get('skills'); }
  // Add more getters if you add more controls with validation
}