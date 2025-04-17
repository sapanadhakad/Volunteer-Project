// src/app/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from './models/event.model'; // Import the Event model
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`; // Base URL for events

  constructor(private http: HttpClient) { }

  getEvents(): Observable<Event[]> {
    console.log('EventService: Fetching events from', this.apiUrl);
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: number): Observable<Event> {
    const url = `${this.apiUrl}/${id}`;
    console.log('EventService: Fetching event by ID from', url);
    return this.http.get<Event>(url);
  }

  // Use Omit<Event, 'id'> for creation type safety
  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    console.log('EventService: Creating event at', this.apiUrl);
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    const url = `${this.apiUrl}/${id}`;
    console.log('EventService: Updating event at', url);
    return this.http.put<Event>(url, event);
  }

  deleteEvent(id: number): Observable<void> { // Expecting 204 No Content
    const url = `${this.apiUrl}/${id}`;
    console.log('EventService: Deleting event at', url);
    return this.http.delete<void>(url);
  }

  // --- Optional: Methods for volunteer assignment ---
  /*
  assignVolunteer(eventId: number, volunteerId: number): Observable<Event> {
    const url = `${environment.apiUrl}/events/${eventId}/assign/${volunteerId}`;
    console.log(`EventService: Assigning volunteer ${volunteerId} to event ${eventId}`);
    return this.http.post<Event>(url, {}); // POST request, likely no body needed
  }

  unassignVolunteer(eventId: number, volunteerId: number): Observable<Event> {
     const url = `${environment.apiUrl}/events/${eventId}/unassign/${volunteerId}`;
     console.log(`EventService: Unassigning volunteer ${volunteerId} from event ${eventId}`);
     return this.http.delete<Event>(url); // DELETE request
  }
  */
  getMyOrganizedEvents(): Observable<Event[]> {
    const url = `${environment.apiUrl}/my-organized`; // Match backend endpoint
    console.log('EventService: Fetching my organized events from', url);
    return this.http.get<Event[]>(url);
    // Add pagination params if needed: getMyOrganizedEvents(page: number, size: number ...): Observable<Page<Event>>
}
}