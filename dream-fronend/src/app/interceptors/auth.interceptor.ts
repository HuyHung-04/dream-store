// src/app/interceptors/auth.interceptor.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtService } from '../services/jwt.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private jwtService: JwtService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Thêm platform injection
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token: string | null = null;

    // Chỉ truy cập localStorage khi chạy trên browser
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('access_token');
      // Hoặc tốt hơn nên dùng service: token = this.jwtService.getToken();
    }

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // if (error.status === 401) {
        //   // Xử lý logout an toàn cho SSR
        //   if (isPlatformBrowser(this.platformId)) {
        //     this.jwtService.logout();
        //     this.router.navigate(['/login']);
        //   }
        // }
        return throwError(() => error);
      })
    );
  }
}