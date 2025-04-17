// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
// Import User model and UserService
import { User } from '../models/user.model'; // Updated import
import { UserService } from '../user.service'; // Updated import
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { VolunteerProfile } from '../models/volunteer-profile.model';
import { VolunteerService } from '../volunteer.service';
// Keep VolunteerService ONLY if you intend to fetch supplementary volunteer details
// import { VolunteerService } from '../volunteer.service';
// import { Volunteer } from '../models/volunteer.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Change volunteer property to user
  user: User | null = null;
  //volunteer: Volunteer | null = null; // Keep ONLY if fetching both
  volunteerProfile: VolunteerProfile | null = null; // Use the combined profile DTO
  isLoading: boolean = false;
  error: string | null = null;
  // Rename volunteerId to userId for clarity
  userId!: number;
  isOwnProfile: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService, // Inject UserService
    private volunteerService: VolunteerService, // Keep ONLY if fetching both
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.error = null;
    this.user = null; // Reset user on init
    this.volunteerProfile = null; // Reset volunteer profile

    const idParam = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.getCurrentUser(); // Assumes currentUser has 'id'
    let potentialId: number | null = null; // Use a different variable name initially

    console.log('Route param "id":', idParam); // Debugging
    console.log('Current user from AuthService:', currentUser); // Debugging

    if (idParam) {
        // *** CORRECTED: Use parseInt and isNaN check ***
        const parsedId = parseInt(idParam, 10); // Use parseInt for explicit base-10 parsing
        if (!isNaN(parsedId)) { // Check if parsing was successful
            potentialId = parsedId;
            this.isOwnProfile = !!currentUser && currentUser.id === potentialId;
            console.log(`User ID from route: ${potentialId}. Is own profile: ${this.isOwnProfile}`);
        } else {
            // Invalid ID in URL parameter
            this.error = `Invalid user ID '${idParam}' found in URL. Cannot load profile.`;
            console.error(this.error);
            this.isLoading = false;
            return; // Stop processing
        }
    } else if (currentUser?.id && typeof currentUser.id === 'number' && !isNaN(currentUser.id)) {
        // *** CORRECTED: Use ID from logged-in user, ensuring it's a valid number ***
        potentialId = currentUser.id;
        this.isOwnProfile = true;
        console.log(`User ID from logged-in user: ${potentialId}.`);
    } else {
        // Cannot determine ID from route or logged-in user
        this.error = "Could not determine user profile to load. Please log in or provide a valid ID in the URL.";
        console.error(this.error);
        this.isLoading = false;
        // Optional: Redirect to login if not logged in
        if (!this.authService.isUserLoggedIn()) { // Assuming you have such a method
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
        }
        return; // Stop processing
    }

    // Now we are sure potentialId is a valid number OR we returned early
    if (potentialId !== null) { // This check is now meaningful
        this.userId = potentialId; // Assign the validated ID
        console.log(`Proceeding to load profile data for userId: ${this.userId}`); // Debugging
        // *** REMOVED REDUNDANT CALL *** : Call only the main loading function
        // this.loadUserDetails(this.userId);
        this.loadProfileData(this.userId); // Call the consolidated load method
    } else {
       // This case should ideally not be reached due to earlier returns, but as a fallback:
       this.error = "Failed to determine a valid user ID after checks.";
       console.error(this.error);
       this.isLoading = false;
    }
  }

  // New method to load User details
  loadUserDetails(id: number): void {
    // isLoading is already true from ngOnInit
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        if (data) {
          this.user = data;
          console.log('User details loaded:', this.user);
        } else {
          // This might happen if the API returns 200 OK with null/empty body
          this.error = `User details not found for ID: ${id}.`;
          console.warn(this.error);
        }
        this.isLoading = false; // Set loading false on success
        // *** Optional: Trigger supplementary volunteer data load here if needed ***
        // this.loadVolunteerDetailsIfApplicable(id);
      },
      error: (err: any) => { // Can strongly type err later if needed
        console.error(`Error loading user details for ID ${id}:`, err);
        // Check if it's a known error structure (like HttpErrorResponse)
        if (err instanceof HttpErrorResponse) {
            if(err.status === 404) {
                this.error = `User with ID ${id} not found.`;
            } else {
                this.error = `Failed to load user details. Status: ${err.status}. ${err.message || 'Server error.'}`;
            }
        } else {
             this.error = `Failed to load user details. ${err.message || 'An unknown error occurred.'}`;
        }
        this.isLoading = false; // Set loading false on error
      }
    });
  }

  /*
  // *** Optional: Method to load supplementary Volunteer details ***
  // Make sure VolunteerService is injected and Volunteer model imported if using this
  loadVolunteerDetailsIfApplicable(id: number): void {
    this.volunteerService.getVolunteerById(id).subscribe({
        next: (volunteerData) => {
            if (volunteerData) {
                this.volunteer = volunteerData;
                console.log('Supplementary volunteer details loaded:', this.volunteer);
                // Potentially merge data or just keep separate properties
            } else {
                console.log(`No supplementary volunteer details found for user ID ${id}.`);
                this.volunteer = null; // Ensure it's null if not found
            }
            // Note: Don't set isLoading = false here, let loadUserDetails handle the primary loading state
        },
        error: (err: HttpErrorResponse) => {
            if (err.status !== 404) { // Don't treat 404 as a critical error for supplementary data
              console.error(`Error loading supplementary volunteer details for ID ${id}:`, err);
              // Maybe set a minor, non-blocking error message?
              // this.error = (this.error ? this.error + ' ' : '') + 'Could not load volunteer specifics.';
            } else {
                 console.log(`No supplementary volunteer details found for user ID ${id} (404).`);
                 this.volunteer = null; // Ensure it's null on 404
            }
        }
    });
  }
  */
  loadProfileData(id: number): void {
    this.isLoading = true;
    this.error = null;
    this.user = null;
    this.volunteerProfile = null;
    if (isNaN(id) || id === null || id === undefined) {
      console.error("loadProfileData called with invalid ID:", id, ". Aborting.");
      this.error = "Cannot load profile data due to invalid User ID.";
      this.isLoading = false;
      return;
   }
   this.isLoading = true;
    // 1. Fetch User Details first (or potentially fetch both in parallel)
    this.userService.getUserById(id).subscribe({
      next: (userData) => {
        if (!userData) {
           this.error = `User with ID ${id} not found.`;
           this.isLoading = false;
           console.warn(this.error);
           return; // Stop if user not found
        }
        this.user = userData;
        console.log('User details loaded:', this.user);

        // 2. If User found, fetch Volunteer Profile details
        this.volunteerService.getVolunteerProfile(id).subscribe({
           next: (volunteerData) => {
               this.volunteerProfile = volunteerData; // Can be null if no profile exists yet
               if(volunteerData) {
                   console.log('Volunteer profile loaded:', this.volunteerProfile);
               } else {
                   console.log('No volunteer profile found for this user yet.');
               }
               this.isLoading = false; // Loading complete
           },
           error: (volErr) => {
               // Handle errors fetching volunteer profile specifically (non-404)
               console.error(`Error loading volunteer profile for User ID ${id}:`, volErr);
               this.error = (this.error ? this.error + ' ' : '') + `Could not load volunteer details. ${volErr.message || ''}`;
               this.isLoading = false; // Still finish loading
           }
        });
      },
      error: (userErr: any) => {
        // ... (existing user loading error handling) ...
        this.isLoading = false;
      }
    });
  }
  // Renamed and updated delete method to delete the USER
  deleteUser(): void {
    if (isNaN(this.userId) || this.userId === null || this.userId === undefined) {
      console.error("loadProfileData called with invalid ID:", this.userId, ". Aborting.");
      this.error = "Cannot load profile data due to invalid User ID.";
      this.isLoading = false;
      return;
   }
   this.isLoading = true;
    if (!this.userId) {
      console.error("Cannot delete, user ID is missing.");
      this.error = "Cannot delete, user ID is missing.";
      return;
    }

    // Use user's name for confirmation
    const userName = this.user?.name || `user with ID ${this.userId}`;
    const confirmation = window.confirm(`ARE YOU SURE you want to delete the user account for ${userName}? This action cannot be undone.`);

    if (confirmation) {
      this.isLoading = true;
      this.error = null;
      // Call UserService's delete method
      this.userService.deleteUser(this.userId).subscribe({
        next: () => {
          console.log(`User with ID ${this.userId} deleted successfully`);
          this.isLoading = false;
          // If deleting own profile, log out
          if (this.isOwnProfile) {
            this.authService.logout(); // Ensure logout clears user data and redirects appropriately
            this.router.navigate(['/login']); // Or homepage
          } else {
            // If an admin deleted someone else, navigate away (e.g., to a user list)
            this.router.navigate(['/admin/users']); // Adjust navigation target as needed
          }
        },
        error: (err) => {
          console.error(`Error deleting user with ID ${this.userId}:`, err);
          this.error = `Failed to delete user. ${err.error?.message || err.message || 'Please try again.'}`;
          this.isLoading = false;
        }
      });
    }
  }
}