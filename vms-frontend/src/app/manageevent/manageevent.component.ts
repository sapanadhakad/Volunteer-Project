// src/app/components/manageevent/manageevent.component.ts (continued)


// src/app/components/manageevent/manageevent.component.ts (or similar path)

import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service'; // You likely already have this
// import { TokenStorageService } from '../../_services/token-storage.service'; // <-- Adjust path as needed
import { VolunteerService } from '../volunteer.service'; // <-- Adjust path as needed
import { Event } from '../models/event.model'; // Assuming Event model path
import { TokenStorageService } from '../services/token-storage.service'; 
import { CommonModule } from '@angular/common';




















@Component({
  selector: 'app-manageevent',
  imports: [CommonModule], // Import CommonModule for ngIf, ngFor, etc.s
  templateUrl: './manageevent.component.html',
  styleUrls: ['./manageevent.component.css'] // or .scss
})
export class ManageeventComponent implements OnInit {

  userRelevantEvents: Event[] = []; // Use Event model or a summary DTO if defined
  isLoading = false;
  errorMessage: string | null = null;
  isOrganizer = false; // Optional: flag based on role

  // Inject ALL required services here
  constructor(
    private eventService: EventService,
    private tokenStorageService: TokenStorageService, // <-- INJECT TokenStorageService
    private volunteerService: VolunteerService    // <-- INJECT VolunteerService
    // private router: Router // Example: Inject Router if needed for navigation
  ) { }

  ngOnInit(): void {
    this.loadUserRelevantEvents();
  }

  loadUserRelevantEvents(): void {
    // Now you can safely use the injected services
    const user = this.tokenStorageService.getUser();
    if (!user || !user.roles) {
        this.errorMessage = "User data not available.";
        this.isOrganizer = false;
        return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.isOrganizer = user.roles.includes('ROLE_ORGANIZER'); // Check if user is an organizer

    if (this.isOrganizer) {
        console.log("User is Organizer, fetching organized events...");
        // Call the method from EventService to get events organized by this user
        this.eventService.getMyOrganizedEvents().subscribe({
            next: data => {
                // Assuming getMyOrganizedEvents returns Event[] or EventSummaryDto[]
                this.userRelevantEvents = data;
                this.isLoading = false;
                console.log("Organized events loaded:", this.userRelevantEvents);
            },
            error: err => {
                this.errorMessage = `Failed to load organized events: ${err.message || err.error?.error || 'Unknown error'}`;
                this.isLoading = false;
                console.error(err);
            }
        });
    // } else if (user.roles.includes('ROLE_VOLUNTEER')) {
        // If this component also handles volunteers, uncomment and use volunteerService
        // console.log("User is Volunteer, fetching registered events...");
        // Make sure VolunteerService has a method like getMyRegisteredEvents()
        // this.volunteerService.getMyRegisteredEvents().subscribe({ ... });
    } else {
        console.log("User is not an Organizer.");
        this.isLoading = false;
        this.userRelevantEvents = []; // Clear or set default state
        // Optionally set an informative message if needed
        // this.errorMessage = "You do not have permission to manage events.";
    }
  }

  // Add methods for managing events (delete, edit navigation, etc.)
  deleteEvent(eventId: number): void {
      if (!confirm('Are you sure you want to delete this event?')) {
          return;
      }
      this.isLoading = true; // Optional: show loading indicator
      this.eventService.deleteEvent(eventId).subscribe({
          next: () => {
              console.log(`Event ${eventId} deleted successfully.`);
              // Remove the event from the local list to update UI instantly
              this.userRelevantEvents = this.userRelevantEvents.filter(event => event.id !== eventId);
              this.isLoading = false;
          },
          error: err => {
              this.errorMessage = `Failed to delete event: ${err.message || err.error?.error || 'Unknown error'}`;
              this.isLoading = false;
              console.error(err);
              // Display error to user
          }
      });
  }

  editEvent(eventId: number): void {
      // Navigate to an edit event page/component
      // Example: this.router.navigate(['/events/edit', eventId]);
      console.log(`Navigate to edit page for event ID: ${eventId}`);
  }

  // ... other component logic ...
}