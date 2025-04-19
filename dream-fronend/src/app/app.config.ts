import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';  
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),

    importProvidersFrom(
      CommonModule,
      BrowserAnimationsModule,
      RouterModule,
      MatSidenavModule,
      MatToolbarModule,
      MatButtonModule,
      MatIconModule,
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule 
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,  
      multi: true 
    }
  ]
};
