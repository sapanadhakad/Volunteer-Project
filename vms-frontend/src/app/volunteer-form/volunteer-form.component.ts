import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VolunteerService } from '../volunteer.service';
import { Volunteer } from '../models/volunteer.model';

@Component({
  selector: 'app-volunteer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Need ReactiveFormsModule
  templateUrl: './volunteer-form.component.html',
  styleUrls: ['./volunteer-form.component.css']
})
export class VolunteerFormComponent implements OnInit {
  volunteerForm!: FormGroup;
  isEditMode = false;
  volunteerId: number | null = null;
  isLoading = false;
  error: string | null = null;
  pageTitle = 'Create Volunteer'; // Dynamic title

  constructor(
    private fb: FormBuilder,
    private volunteerService: VolunteerService,
    private router: Router,
    private route: ActivatedRoute // To get route parameters (like ID)
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    // Check for ID in route parameters to determine edit mode
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.volunteerId = +idParam; // Convert string ID to number
        this.pageTitle = 'Edit Volunteer';
        this.loadVolunteerData();
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Create Volunteer';
      }
    });
  }

  initializeForm(): void {
    // Define the form structure and validators
    this.volunteerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.maxLength(20)]], // Optional field
      skills: [''], // Optional field
      availability: [''] // Optional field
      // Add other fields from your Volunteer model if needed
    });
  }

  loadVolunteerData(): void {
    if (!this.volunteerId) return; // Should not happen if isEditMode is true

    this.isLoading = true;
    this.volunteerService.getVolunteerById(this.volunteerId).subscribe({
      next: (volunteer) => {
        // Use patchValue to populate form (handles missing fields gracefully)
        this.volunteerForm.patchValue(volunteer);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading volunteer data:", err);
        this.error = "Failed to load volunteer data for editing.";
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    this.error = null;
    if (this.volunteerForm.invalid) {
      this.volunteerForm.markAllAsTouched(); // Trigger validation messages
      return;
    }

    this.isLoading = true;
    const formData = this.volunteerForm.value;

    if (this.isEditMode && this.volunteerId) {
      // --- UPDATE ---
      this.volunteerService.updateVolunteer(this.volunteerId, { ...formData, id: this.volunteerId }).subscribe({
        next: (updatedVolunteer) => {
          console.log("Volunteer updated successfully:", updatedVolunteer);
          this.isLoading = false;
          // Navigate back to detail view or list view
          this.router.navigate(['/volunteers', this.volunteerId]); // Or '/volunteers'
          // Add success message/toast notification later
        },
        error: (err) => this.handleError(err, 'update')
      });
    } else {
      // --- CREATE ---
      this.volunteerService.createVolunteer(formData).subscribe({
        next: (newVolunteer) => {
          console.log("Volunteer created successfully:", newVolunteer);
          this.isLoading = false;
          // Navigate to the new volunteer's detail page or the list
          this.router.navigate(['/volunteers', newVolunteer.id]); // Or '/volunteers'
          // Add success message/toast notification later
        },
        error: (err) => this.handleError(err, 'create')
      });
    }
  }

  private handleError(err: any, action: string): void {
     console.error(`Error during volunteer ${action}:`, err);
     this.error = `Failed to ${action} volunteer. ${err.error?.message || err.message || 'Please try again.'}`;
     this.isLoading = false;
  }

  // Helper getter for easier access in the template
  get f() { return this.volunteerForm.controls; }
}