import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtService } from './jwt.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router
  ) {}

  // Đăng nhập
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.jwtService.saveToken(response.token);
          this.jwtService.saveUser(response.user);
        }
      })
    );
  }

  // Đăng ký
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Đăng xuất
  logout(): void {
    this.jwtService.logout();
    this.router.navigate(['/login']);
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return this.jwtService.isTokenValid();
  }

  // Lấy thông tin user hiện tại
  getCurrentUser(): any {
    return this.jwtService.getUser();
  }

  // Kiểm tra quyền truy cập
  hasRole(role: string): boolean {
    return this.jwtService.hasRole(role);
  }
}
