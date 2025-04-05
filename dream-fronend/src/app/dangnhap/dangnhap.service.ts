import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DangnhapService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  // Phương thức đăng nhập
  login(taiKhoan: string, matKhau: string): Observable<any> {
    const loginData = {
      username: taiKhoan,
      password: matKhau
    };

    // Gửi yêu cầu POST đến API backend với JSON data
    return this.http.post<any>(`${this.apiUrl}/login`, loginData, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }
}
