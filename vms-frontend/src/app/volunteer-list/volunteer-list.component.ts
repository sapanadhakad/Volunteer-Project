import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Volunteer } from '../models/volunteer.model';
import { VolunteerService } from '../volunteer.service';
import { Router, RouterLink } from '@angular/router'; // Import Router and RouterLink

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add RouterLink
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit {

  volunteers: Volunteer[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  deleteError: string | null = null; // Specific error for delete actions

  constructor(
    private volunteerService: VolunteerService,
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    console.log('VolunteerListComponent: Initializing and loading volunteers');
    this.loadVolunteers();
  }

  loadVolunteers(): void {
    this.isLoading = true;
    this.error = null;
    this.deleteError = null; // Clear delete error on reload
    this.volunteers = [];

    this.volunteerService.getVolunteers().subscribe({
        next: (data: Volunteer[]) => {
            console.log('VolunteerListComponent: Received volunteer data', data);
            this.volunteers = data;
            this.isLoading = false;
        },
        error: (err) => {
            console.error('VolunteerListComponent: Error fetching volunteers', err);
            if (err.status === 500) {
                this.error = 'Access denied for volunteer.';
                setTimeout(() => {
                  this.router.navigate(['/home']); // Redirect to home page after a short delay
              }, 2000);
            } else {
                this.error = `Failed to load volunteers. Status: ${err.status}. Please check the backend.`;
            }
            this.isLoading = false;
        },
        complete: () => {
            console.log('VolunteerListComponent: Volunteer fetch operation complete.');
        }
    });
}


  // Method to handle deletion directly from the list
  deleteVolunteer(id: number, name: string): void {
     this.deleteError = null; // Clear previous delete errors
    // Simple browser confirmation
    const confirmation = window.confirm(`Are you sure you want to delete volunteer "${name}" (ID: ${id})?`);

    if (confirmation) {
       // Optionally show a loading state specifically for this row
      this.volunteerService.deleteVolunteer(id).subscribe({
        next: () => {
          console.log(`Volunteer ${id} deleted successfully`);
          // Refresh the list by removing the item locally or reloading
          // Option 1: Filter locally (faster UI update)
          this.volunteers = this.volunteers.filter(v => v.id !== id);
          // Option 2: Reload from backend (ensures data consistency)
          // this.loadVolunteers();
        },
        error: (err) => {
          console.error(`Error deleting volunteer ${id}:`, err);
          this.deleteError = `Failed to delete volunteer ${id}. ${err.error?.message || err.message || 'Please try again.'}`;
           // Optionally re-enable delete button or show error near the row
        }
      });
    }
  }
}