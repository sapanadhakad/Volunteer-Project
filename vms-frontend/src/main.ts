// src/main.ts (Example of modern standalone bootstrapping)
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Import app configuration
import { AppComponent } from './app/app.component'; // Import the root component

bootstrapApplication(AppComponent, appConfig) // Bootstraps the standalone AppComponent
  .catch((err) => console.error(err));