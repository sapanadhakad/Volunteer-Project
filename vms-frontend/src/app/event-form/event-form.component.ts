import { Component, OnInit, inject } from '@angular/core'; // Import inject for potentially cleaner service injection
import { CommonModule, formatDate } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';
import { AuthService } from '../auth.service'; // Adjust path as needed

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm!: FormGroup;
  isEditMode = false;
  eventId: number | null = null;
  isLoading = false;
  error: string | null = null;
  pageTitle = 'Create Event';
  canEdit = false; // Flag to control edit permissions based on role

  // Using constructor injection
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService // Inject AuthService
  ) { }

  // Alternative using inject() if preferred (requires Angular 14+)
  // private fb = inject(FormBuilder);
  // private eventService = inject(EventService);
  // private router = inject(Router);
  // private route = inject(ActivatedRoute);
  // private authService = inject(AuthService);


  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        // --- Role Check for Editing ---
        if (!this.authService.hasAnyRole(['admin', 'organizer'])) {
            console.warn('User does not have permission to edit events.');
            this.error = "You do not have permission to edit this event.";
            this.pageTitle = 'View Event (Read-Only)'; // Or redirect
            // Option 1: Redirect away
            // this.router.navigate(['/unauthorized']); // Or back to event list
            // return; // Stop further processing if redirecting

            // Option 2: Show form as read-only (disable form)
            this.isEditMode = true; // Still technically "edit mode" contextually
            this.eventId = +idParam;
            this.loadEventData(true); // Pass flag to disable form after loading
            this.canEdit = false;

        } else {
            // User has permission, proceed with edit mode setup
            this.isEditMode = true;
            this.eventId = +idParam;
            this.pageTitle = 'Edit Event';
            this.canEdit = true; // User has permission
            this.loadEventData();
        }
        // --- End Role Check ---

      } else {
        // Create mode - check if user has permission to create (if needed)
        // For now, assume creation is allowed or handled elsewhere
        this.isEditMode = false;
        this.pageTitle = 'Create Event';
        this.canEdit = true; // Allow editing fields when creating
      }
    });
  }

  initializeForm(): void {
    this.eventForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      location: ['', [Validators.maxLength(255)]],
      startDateTime: ['', [Validators.required]],
      endDateTime: ['', [Validators.required]],
      slotsAvailable: [null, [Validators.min(0)]]
    });
  }

  loadEventData(disableForm: boolean = false): void { // Added optional flag
    if (!this.eventId) return;

    this.isLoading = true;
    this.error = null; // Clear previous errors
    this.eventService.getEventById(this.eventId).subscribe({
      next: (event) => {
        const formattedEvent = {
          ...event,
          startDateTime: this.formatDateForInput(event.startDateTime),
          endDateTime: this.formatDateForInput(event.endDateTime)
        };
        this.eventForm.patchValue(formattedEvent);
        this.isLoading = false;

        // --- Disable form if user lacks permissions ---
        if (disableForm || !this.canEdit) {
             this.eventForm.disable(); // Disable all controls
             this.pageTitle = 'View Event Details'; // Adjust title if read-only
             this.error = "You do not have permission to edit this event."; // Optional message
        }
      },
      error: (err) => {
        this.handleError(err, 'load');
        // Potentially disable form on load error too, or redirect
        this.eventForm.disable();
      }
    });
  }

  private formatDateForInput(date: string | Date): string {
     try {
       return formatDate(date, 'yyyy-MM-ddTHH:mm', 'en-US');
     } catch (e) {
       console.error("Error formatting date for input:", e);
       if (typeof date === 'string' && date.includes('T')) {
            return date.substring(0, 16);
       }
       return '';
     }
  }

  onSubmit(): void {
    this.error = null;

    // Prevent submission if form is invalid OR if user shouldn't be editing
    if (this.eventForm.invalid || (this.isEditMode && !this.canEdit)) {
       if (this.isEditMode && !this.canEdit) {
           this.error = "You do not have permission to save changes.";
       } else {
           this.eventForm.markAllAsTouched(); // Mark fields as touched if invalid
       }
      return;
    }

     // --- Role Check Safeguard (mostly for update) ---
     if (this.isEditMode && !this.authService.hasAnyRole(['admin', 'organizer'])) {
        this.error = "Permission denied. Cannot save changes.";
        this.isLoading = false; // Ensure loading indicator is turned off
        return;
     }
     // --- End Role Check ---


    const start = this.eventForm.value.startDateTime;
    const end = this.eventForm.value.endDateTime;
    if (start && end && new Date(end) <= new Date(start)) {
       this.error = 'End date/time must be after the start date/time.';
       return;
    }

    this.isLoading = true;
    const formData = { ...this.eventForm.value };


    if (this.isEditMode && this.eventId) {
      // We already checked canEdit earlier, but double-check ID just in case
      this.eventService.updateEvent(this.eventId, { ...formData, id: this.eventId }).subscribe({
        next: (res) => {
          this.isLoading = false;
          // Consider navigating to the event detail view instead of potentially back to the editable form
          this.router.navigate(['/events', this.eventId]);
          // Or show a success message
        },
        error: (err) => this.handleError(err, 'update')
      });
    } else {
      // Assume create permission check happened in ngOnInit or is not needed here
      this.eventService.createEvent(formData).subscribe({
        next: (newEvent) => {
          this.isLoading = false;
          this.router.navigate(['/events', newEvent.id]);
        },
        error: (err) => this.handleError(err, 'create')
      });
    }
  }

  private handleError(err: any, action: string): void {
    console.error(`Error during event ${action}:`, err);
    // Check for specific permission errors if the backend provides them
    if (err.status === 403) {
        this.error = `Permission denied to ${action} event.`;
    } else {
        this.error = `Failed to ${action} event. ${err.error?.message || err.message || 'Please try again.'}`;
    }
    this.isLoading = false;
  }

  // Helper getter for template binding
  get f() { return this.eventForm.controls; }
  public cancel(): void {
    this.router.navigate(['/events']);
  }

}