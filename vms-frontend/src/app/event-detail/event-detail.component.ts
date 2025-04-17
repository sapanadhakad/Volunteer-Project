import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventService } from '../event.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add DatePipe
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  isLoading = false;
  error: string | null = null;
  eventId!: number;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.handleError("Event ID not found in route.");
      return;
    }

    this.eventId = +idParam;
    this.eventService.getEventById(this.eventId).subscribe({
      next: (data) => {
        this.event = data;
        this.isLoading = false;
      },
      error: (err) => this.handleError(`Failed to load event details. ${err.error?.message || err.message}`, err)
    });
  }

  deleteEvent(): void {
    if (!this.eventId || !this.event) return;

    if (window.confirm(`Are you sure you want to delete event "${this.event.name}"?`)) {
      this.isLoading = true; // Indicate processing
      this.error = null;
      this.eventService.deleteEvent(this.eventId).subscribe({
        next: () => {
          console.log("Event deleted successfully");
          this.isLoading = false;
          this.router.navigate(['/events']);
        },
        error: (err) => this.handleError(`Failed to delete event. ${err.error?.message || err.message}`, err)
      });
    }
  }

  private handleError(message: string, errorObj?: any): void {
     console.error(message, errorObj || '');
     this.error = message;
     this.isLoading = false;
  }
}