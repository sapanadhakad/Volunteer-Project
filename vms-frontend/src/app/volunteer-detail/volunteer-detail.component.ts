import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // Import RouterLink
import { VolunteerService } from '../volunteer.service';
import { Volunteer } from '../models/volunteer.model';

@Component({
  selector: 'app-volunteer-detail',
  standalone: true,
  imports: [CommonModule, RouterLink], // Import RouterLink
  templateUrl: './volunteer-detail.component.html',
  styleUrls: ['./volunteer-detail.component.css']
})
export class VolunteerDetailComponent implements OnInit {
  volunteer: Volunteer | null = null; // Allow null initially
  isLoading = false;
  error: string | null = null;
  volunteerId!: number; // Assert non-null with '!' after checking in ngOnInit

  constructor(
    private route: ActivatedRoute,
    private volunteerService: VolunteerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const idParam = this.route.snapshot.paramMap.get('id'); // Get ID from route

    if (!idParam) {
      this.error = "Volunteer ID not found in route.";
      this.isLoading = false;
      console.error(this.error);
      // Optionally navigate away
      // this.router.navigate(['/volunteers']);
      return;
    }

    this.volunteerId = +idParam; // Convert to number

    this.volunteerService.getVolunteerById(this.volunteerId).subscribe({
      next: (data) => {
        this.volunteer = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading volunteer details:", err);
        this.error = `Failed to load volunteer details. ${err.error?.message || err.message || 'Not found or server error.'}`;
        this.isLoading = false;
      }
    });
  }

  deleteVolunteer(): void {
    if (!this.volunteerId) return;

    // Simple browser confirmation
    const confirmation = window.confirm(`Are you sure you want to delete volunteer "${this.volunteer?.name || 'this volunteer'}"?`);

    if (confirmation) {
      this.isLoading = true; // Indicate processing
      this.error = null;
      this.volunteerService.deleteVolunteer(this.volunteerId).subscribe({
        next: () => {
          console.log("Volunteer deleted successfully");
          this.isLoading = false;
          // Add success message/toast notification later
          this.router.navigate(['/volunteers']); // Navigate back to the list
        },
        error: (err) => {
          console.error("Error deleting volunteer:", err);
          this.error = `Failed to delete volunteer. ${err.error?.message || err.message || 'Please try again.'}`;
          this.isLoading = false;
        }
      });
    }
  }
}