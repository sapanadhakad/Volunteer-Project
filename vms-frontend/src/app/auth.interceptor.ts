// src/app/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse // Import HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError operator
import { AuthService } from './auth.service';
import { Router } from '@angular/router'; // Import Router

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router // Inject Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      // Clone the request and add the authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('AuthInterceptor: Added Authorization header.');
    } else {
        console.log('AuthInterceptor: No token found, sending request without Authorization header.');
    }


    // Pass the cloned request to the next handler
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) { // Unauthorized
          console.error('AuthInterceptor: Received 401 Unauthorized response.');
          this.authService.logout(); // Clear token and update status
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url }}); // Redirect to login
          // Optionally display a message to the user
        }
        // Re-throw the error to be handled by the calling service/component if needed
        return throwError(() => error);
      })
    );
  }
}