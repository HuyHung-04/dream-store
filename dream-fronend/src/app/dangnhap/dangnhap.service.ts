import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtService } from '../services/jwt.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DangnhapService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private jwtService: JwtService,
    private router: Router
  ) { }

  // Phương thức đăng nhập
  login(taiKhoan: string, matKhau: string): Observable<any> {
    const loginData = {
      username: taiKhoan,
      password: matKhau
    };

    // Gửi yêu cầu POST đến API backend với JSON data
    return this.http.post<any>(`${this.apiUrl}/login`, loginData);
  }

  // Phương thức đăng xuất
  logout(): void {
    this.jwtService.logout();
    this.router.navigate(['/dangnhap']);
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return this.jwtService.isTokenValid();
  }

  // Kiểm tra quyền truy cập
  hasRole(role: string): boolean {
    return this.jwtService.hasRole(role);
  }
}
