// src/app/app.routes.ts (or equivalent)
import { Routes } from '@angular/router';
// ... other imports ...
import { EventListComponent } from './event-list/event-list.component';     // Import Event components
import { EventFormComponent } from './event-form/event-form.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VolunteerListComponent } from './volunteer-list/volunteer-list.component';
import { VolunteerFormComponent } from './volunteer-form/volunteer-form.component';
import { VolunteerDetailComponent } from './volunteer-detail/volunteer-detail.component';
import { authGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { adminGuard } from './admin.guard';
import { organizerOrAdminGuard } from './organizer-or-admin-guard.service';
import { EventAccessGuard } from './event-access-guard.service';
import { ManageeventComponent } from './manageevent/manageevent.component';
import {  ManageRegisterEventComponent } from './component/manage-register-event/manage-register-event.component';

export const routes: Routes = [
  // ... Login, Register ...
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // --- Volunteer CRUD Routes ---
  { path: 'volunteers', component: VolunteerListComponent, canActivate: [authGuard,organizerOrAdminGuard] },//adminguard
  { path: 'volunteers/new', component: VolunteerFormComponent, canActivate: [authGuard,adminGuard,organizerOrAdminGuard] }, // Specific before :id
  { path: 'volunteers/:id/edit', component: VolunteerFormComponent, canActivate: [authGuard,adminGuard,organizerOrAdminGuard] }, // Specific before :id
  { path: 'volunteers/:id', component: VolunteerDetailComponent, canActivate: [authGuard] }, // General :id

  // --- Event CRUD Routes ---
  { path: 'events', component: EventListComponent, canActivate: [authGuard] },
  { path: 'events/new', component: EventFormComponent, canActivate: [authGuard,organizerOrAdminGuard] }, // Specific before :id
  { path: 'events/:id/edit', component: EventFormComponent, canActivate: [authGuard,EventAccessGuard,organizerOrAdminGuard] }, // Specific before :id
  { path: 'events/:id', component: EventDetailComponent, canActivate: [authGuard] }, // General :id



{ path:'manage-organized-events',component: ManageeventComponent, canActivate: [authGuard] ,data: {
  roles: ['ROLE_ORGANIZER']// Only allow ORGANIZER role
}}, 

{
    path: 'manage-registered-events/:volunteerId', // Or whatever your path is
    component: ManageRegisterEventComponent,      // Use the correct component name here too
    // canActivate: [AuthGuard] // Add guards if needed
  },




// {
//   path: 'manage-registered-events', // New specific path
//   component: ManageRegisteredEventsComponent, // New component for volunteers
//   canActivate: [authGuard],
//   data: { roles: ['ROLE_VOLUNTEER'] } // ONLY Volunteer
// },





  // --- Profile Routes ---
  { path: 'profile/edit', component: ProfileEditComponent, canActivate: [authGuard] }, // <<< Specific 'edit' path FIRST
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }, // Path without parameter
  { path: 'profile/:id', component: ProfileComponent, canActivate: [authGuard] }, // <<< General path with :id LAST for profile

  // --- Home & Redirects ---
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default redirect
  // { path: '**', component: NotFoundComponent } // Optional 404 - Should be absolutely last

];