import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core'; // Added ChangeDetectionStrategy, ChangeDetectorRef
import { Router } from '@angular/router';
import { EventService } from '../event.service'; // Adjust path
import { AuthService } from '../auth.service'; // Adjust path
import { RegistrationService } from '../registration.service'; // Adjust path
import { Event } from '../models/event.model'; // Adjust path
import { Subject, Subscription, Observable, combineLatest, of, pipe } from 'rxjs';
import { takeUntil, catchError, tap, map, startWith, finalize } from 'rxjs/operators'; // Added finalize
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-list',
  standalone: true, // Assuming this is now a standalone component based on imports array
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css'],
  // Optional: Add OnPush for performance, requires manual change detection in some cases
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy {
  allEvents: Event[] = [];
  filteredEvents: Event[] = [];
  isLoading = false;
  error: string | null = null;
  deleteError: string | null = null;
  searchTerm: string = '';

  // --- New properties for registration ---
  userRegisteredEventIds = new Set<number>();
  isFetchingRegistrations = false;
  registrationStatus: string | null = null;
  registrationError: boolean = false;
  registeringEventId: number | null = null;

  // Observable for auth state and management roles
  isAuthenticated$: Observable<boolean>;
  canManageEvents$!: Observable<boolean>;

  private destroy$ = new Subject<void>();
  private registrationSub: Subscription | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private registrationService: RegistrationService,
    private router: Router,
    // Inject ChangeDetectorRef if using OnPush
    // private cdRef: ChangeDetectorRef
  ) {
    this.isAuthenticated$ = this.authService.isLoggedIn$; // <-- Use isLoggedIn$ here    this.canManageEvents$ = combineLatest([
      this.canManageEvents$ = combineLatest([
 
    this.authService.isAdmin$,
      this.authService.isOrganizer$
  ]).pipe(
      map(([isAdmin, isOrganizer]) => isAdmin || isOrganizer),
      startWith(false)
    );
  }

  ngOnInit(): void {
    this.loadEvents();
    this.isAuthenticated$.pipe(
        takeUntil(this.destroy$)
    ).subscribe(isAuth => {
        if (isAuth) {
            this.loadUserRegistrations();
        } else {
            this.userRegisteredEventIds.clear();
            // this.cdRef.markForCheck(); // If using OnPush
        }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.registrationSub?.unsubscribe();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;
    this.deleteError = null;
    this.eventService.getEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (events) => {
          // *** V IMPORTANT: PARSE DATES HERE ***
          this.allEvents = events.map(event => this.parseEventDates(event));
          // *************************************
          this.filterEvents();
          this.isLoading = false;
          // this.cdRef.markForCheck(); // If using OnPush
        },
        error: (err) => {
          console.error('Error loading events:', err);
          this.error = 'Failed to load events. Please try again.';
          this.isLoading = false;
          // this.cdRef.markForCheck(); // If using OnPush
        }
      });
  }

  // --- START: DATE PARSING HELPER FUNCTIONS ---
  private parseCustomDateString(dateString: any): Date | null {
     // Handle cases where it might already be a Date or null/undefined
    if (!dateString || dateString instanceof Date) {
       return dateString instanceof Date ? dateString : null;
    }

    if (typeof dateString !== 'string') {
        console.warn(`Expected string for date parsing, got:`, dateString);
        return null; // Or try new Date(dateString) if other formats might exist
    }

    // Try parsing as ISO string first (more standard)
    const isoDate = new Date(dateString);
    if (!isNaN(isoDate.getTime()) && dateString.includes('-')) { // Basic check for ISO-like format
      return isoDate;
    }

    // Try parsing the custom "YYYY,M,D,H,m" format
    if (dateString.includes(',')) {
        const parts = dateString.split(',').map(part => parseInt(part.trim(), 10));
        if (parts.length >= 5 && parts.every(part => !isNaN(part))) {
            const year = parts[0];
            const monthIndex = parts[1] - 1; // JS months are 0-indexed
            const day = parts[2];
            const hour = parts[3];
            const minute = parts[4];
            const customDate = new Date(year, monthIndex, day, hour, minute);
             if (!isNaN(customDate.getTime())) {
                return customDate;
             }
        }
    }

    console.warn(`Could not parse date string into a valid Date: ${dateString}`);
    return null; // Return null if all parsing attempts fail
  }

  private parseEventDates(event: any): Event {
    // Create a copy to avoid modifying the original object from the service cache
    const processedEvent = { ...event };

    // Parse start and end dates
    processedEvent.startDateTime = this.parseCustomDateString(event.startDateTime);
    processedEvent.endDateTime = this.parseCustomDateString(event.endDateTime);

    // If parsing failed, startDateTime/endDateTime will be null.
    // The DatePipe handles null gracefully (outputs empty string).
    // You might want different handling (e.g., show 'Invalid Date').

    // Ensure the return type matches your Event interface/model
    // This assumes your Event model expects 'Date | null' for these properties.
    // If it expects 'string', this will cause a type error.
    // Adjust your Event model or use 'as Event' (less type-safe).
    return processedEvent as Event;
  }
  // --- END: DATE PARSING HELPER FUNCTIONS ---


  loadUserRegistrations(): void {
    this.isFetchingRegistrations = true;
    this.registrationService.getUserRegisteredEventIds()
      .pipe(
          takeUntil(this.destroy$),
          catchError(err => {
              console.error("Failed to load user registrations:", err);
              return of(new Set<number>()); // Return empty set on error
          }),
          finalize(() => { // Ensure flag is reset
              this.isFetchingRegistrations = false;
              // this.cdRef.markForCheck(); // If using OnPush
          })
      )
      .subscribe(eventIdsSet => {
        this.userRegisteredEventIds = eventIdsSet;
        console.log('User registered event IDs:', this.userRegisteredEventIds);
         // this.cdRef.markForCheck(); // If using OnPush
      });
  }

  filterEvents(): void {
    const lowerSearchTerm = this.searchTerm.toLowerCase();
    if (!lowerSearchTerm) {
      this.filteredEvents = [...this.allEvents];
    } else {
      this.filteredEvents = this.allEvents.filter(event =>
        event.name.toLowerCase().includes(lowerSearchTerm) ||
        (event.location && event.location.toLowerCase().includes(lowerSearchTerm))
      );
    }
     // this.cdRef.markForCheck(); // If using OnPush
  }

  deleteEvent(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete the event "${name}"?`)) {
        this.deleteError = null;
        this.isLoading = true;
        // this.cdRef.markForCheck(); // If using OnPush
        this.eventService.deleteEvent(id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => { // Ensure loading state is reset
                this.isLoading = false;
                // this.cdRef.markForCheck(); // If using OnPush
            })
            )
          .subscribe({
            next: () => {
              console.log(`Event ${id} deleted`);
              this.allEvents = this.allEvents.filter(e => e.id !== id);
              this.filterEvents();
            },
            error: (err) => {
              console.error(`Error deleting event ${id}:`, err);
              this.deleteError = err.error?.message || `Failed to delete event "${name}". Please try again.`;
            }
          });
      }
  }

  isRegistered(eventId: number): boolean {
    return this.userRegisteredEventIds.has(eventId);
  }

  hasAvailableSlots(event: Event): boolean {
    // 1. Check if startDateTime exists and is a valid Date object
    if (!event.startDateTime || !(event.startDateTime instanceof Date)) {
        // If it's null, undefined, or still a string (parsing failed or skipped)
        // Log a warning for debugging if needed
        if (event.startDateTime) { // Only log if it exists but isn't a Date
             console.warn(`Event ${event.id} has an invalid startDateTime (not a Date object):`, event.startDateTime);
        }
        return false; // Cannot register if start date is not a valid Date
    }

    // 2. Now that we know event.startDateTime is a Date, check if it's in the past
    if (event.startDateTime.getTime() < Date.now()) {
        return false; // Cannot register for past events
    }

    // 3. Proceed with the slot availability check
    if (event.slotsAvailable === null || event.slotsAvailable === undefined) {
        return true; // Unlimited slots
    }
    // Simple check: slots > 0
    // More robust: return event.slotsAvailable > (event.registeredCount || 0);
    return event.slotsAvailable > 0;
  }
  isRegistering(eventId: number): boolean {
      return this.registeringEventId === eventId;
  }

  registerForEvent(eventId: number): void {
    this.clearRegistrationStatus();
    this.registeringEventId = eventId;
    // this.cdRef.markForCheck(); // If using OnPush

    this.registrationSub?.unsubscribe();

    this.registrationSub = this.registrationService.registerForEvent(eventId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { // Use finalize to reset loading state on complete/error/unsubscribe
            this.registeringEventId = null;
            // this.cdRef.markForCheck(); // If using OnPush
        }),
        catchError(err => {
          console.error(`Error registering for event ${eventId}:`, err);
          let errorMessage = 'Registration failed. Please try again.';
          if (err.status === 409) { // Conflict
            errorMessage = err.error?.message || 'Cannot register (already registered or no slots).';
          } else if (err.status === 400 && err.error?.message?.includes('past')) { // Specific backend message check
            errorMessage = err.error.message;
          } else if (err.status === 401 || err.status === 403) {
            errorMessage = 'Authentication required to register.';
          }
          this.showRegistrationStatus(errorMessage, true);
          return of(null); // Prevent error propagation to 'next' block
        })
      )
      .subscribe(response => {
        if (response !== null) { // Ensure success
            console.log(`Successfully registered for event ${eventId}`, response);
            this.showRegistrationStatus('Successfully registered!', false);
            this.userRegisteredEventIds.add(eventId); // Update local state

            // Optional: Update event slots locally
            const eventIndex = this.allEvents.findIndex(e => e.id === eventId);
            if (eventIndex > -1 && this.allEvents[eventIndex].slotsAvailable !== null && this.allEvents[eventIndex].slotsAvailable !== undefined) {
                // Ensure slotsAvailable is treated as a number before decrementing
                const currentSlots = Number(this.allEvents[eventIndex].slotsAvailable);
                if (!isNaN(currentSlots)) {
                   this.allEvents[eventIndex].slotsAvailable = Math.max(0, currentSlots - 1); // Decrement, don't go below 0
                }
            }
            this.filterEvents(); // Refresh filtered list
            // this.cdRef.markForCheck(); // If using OnPush
        }
      });
  }

  showRegistrationStatus(message: string, isError: boolean): void {
      this.registrationStatus = message;
      this.registrationError = isError;
      // this.cdRef.markForCheck(); // If using OnPush
      // Optional: auto-clear the message after a few seconds
      setTimeout(() => this.clearRegistrationStatus(), 5000);
  }

  clearRegistrationStatus(): void {
    if (this.registrationStatus) { // Only clear if there is a status
      this.registrationStatus = null;
      this.registrationError = false;
      // this.cdRef.markForCheck(); // If using OnPush
    }
  }
}