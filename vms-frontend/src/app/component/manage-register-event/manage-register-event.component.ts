import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VolunteerService } from '../../volunteer.service';
import { TokenStorageService } from '../../services/token-storage.service'; // Corrected path
import { RegisteredEvent } from '../../models/registerevent';
import { AuthUser } from '../../models/authuser'; // Assuming you have this model

@Component({
  selector: 'app-manage-register-event',
  templateUrl: './manage-register-event.component.html',
  styleUrls: ['./manage-register-event.component.css']
})
export class ManageRegisterEventComponent implements OnInit {

  registeredEvents: RegisteredEvent[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  // currentVolunteerId: number | null = null; // Maybe not needed if fetched from token user

  constructor(
    private volunteerService: VolunteerService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    // Get the ID expected from the route
    const expectedVolunteerIdParam = this.route.snapshot.paramMap.get('volunteerId'); // Use snapshot for simplicity here if only needed once

    // Get the logged-in user from storage
    const loggedInUser = this.tokenStorageService.getUser();

    if (!loggedInUser) {
      this.errorMessage = "Not logged in.";
      console.error("Manage Events: User not found in token storage.");
      this.isLoading = false;
      // Optional: redirect to login
      // this.router.navigate(['/login']);
      return;
    }

    // *** CRUCIAL ASSUMPTION ***:
    // Your AuthUser model stored by TokenStorageService MUST contain
    // the relevant 'volunteerRecordId' (or equivalent field name).
    // Adjust 'volunteerRecordId' property name if it's different in your AuthUser model.
    const actualVolunteerId = loggedInUser.id; // EXAMPLE PROPERTY NAME

    if (!actualVolunteerId) {
        this.errorMessage = "Volunteer information not found for the logged-in user.";
        console.error("Manage Events: volunteerRecordId missing in stored user data:", loggedInUser);
        this.isLoading = false;
        return;
    }


    if (!expectedVolunteerIdParam) {
      // If the route is just '/manage-registered-events' (no ID param)
      // We can rely *solely* on the logged-in user's ID
       console.log(`Manage Events: No ID in route, using logged-in user's volunteer ID: ${actualVolunteerId}`);
       this.loadEvents(actualVolunteerId);

    } else {
      // If the route DOES have an ID param '/manage-registered-events/123'
      const expectedVolunteerId = +expectedVolunteerIdParam;

      // Security Check: Compare ID from route with ID from token storage
      if (expectedVolunteerId === actualVolunteerId) {
        console.log(`Manage Events: Route ID matches logged-in user's volunteer ID: ${actualVolunteerId}`);
        this.loadEvents(actualVolunteerId);
      } else {
        this.errorMessage = "Access Denied: You cannot view events for this Volunteer ID.";
        console.error(`Manage Events: Route ID (${expectedVolunteerId}) mismatch with logged-in volunteer ID (${actualVolunteerId}).`);
        this.isLoading = false;
        // Optional: redirect to their own events page or home
        // this.router.navigate(['/manage-registered-events', actualVolunteerId]);
      }
    }
  }

  loadEvents(volunteerId: number): void {
    // ... (rest of your loadEvents logic remains the same)
     if (!volunteerId) { // This check might become redundant with checks in ngOnInit
         console.error("loadEvents called without a valid volunteerId");
         this.errorMessage = "Invalid Volunteer ID provided.";
         this.isLoading = false;
         return;
     }

     this.isLoading = true;
     this.errorMessage = null;
     console.log(`Component: Requesting events for volunteer ID: ${volunteerId}`);

     // IMPORTANT: Ensure your VolunteerService.getMyRegisteredEvents
     // ALSO relies on the backend validating the token and ensuring the
     // requested volunteerId matches the token user. Don't pass an ID
     // if your backend uses a /me/ endpoint.
     this.volunteerService.getMyRegisteredEvents(volunteerId)
       .subscribe({
         next: (events) => { /* ... */ },
         error: (err) => { /* ... */ }
       });
  }

  // ... (viewEventDetails and unregisterFromEvent methods) ...
  // For unregisterFromEvent, you might want to re-verify the actualVolunteerId
  // from token storage rather than relying on a potentially outdated class property.
   unregisterFromEvent(eventId: number): void {
       const loggedInUser = this.tokenStorageService.getUser();
       const actualVolunteerId = loggedInUser?.id;
       

       if (!actualVolunteerId) {
           this.errorMessage = "Cannot unregister event: Volunteer ID is unknown.";
           console.error("Cannot unregister, could not get volunteer ID from token storage.");
           return;
       }
       if (!eventId) { /* ... */ }
       if (!confirm('Are you sure?')) { return; }

       console.log(`TODO: Implement unregister logic for volunteer ${actualVolunteerId} from event ID: ${eventId}`);
       // Call service: this.volunteerService.unregister(actualVolunteerId, eventId)...
   }
}