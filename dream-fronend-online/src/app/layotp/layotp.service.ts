import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayOtpService {
    private apiUrl = 'http://localhost:8080/api'; // URL backend
    
    constructor(private http: HttpClient) {}
    // Lấy danh sách sản phẩm từ backend
    // hàm sản phẩm
    sendEmail(email: string): Observable<any> {
      const params = new HttpParams()
      .set('email', email)
      ; 
      return this.http.post<any>(`${this.apiUrl}/khach-hang/send`, params);
    }
    
    getKhachHangByEmail(email: string): Observable<any[]> {
      return this.http.get<any[]>(`${this.apiUrl}/khach-hang/detail?email=${email}`);
    }
    updateKhachHang(khachhang: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/khach-hang/update`, khachhang);
    }
    compareOtp(email: string, otp: string): Observable<any> {
      const body = { email: email, otp: otp }; // Định dạng đúng của JSON body
      return this.http.post<any>(`${this.apiUrl}/khach-hang/compare`, body);
    }
    deleteOtp(email: string): Observable<any> {
      const params = new HttpParams()
      .set('email', email)
      ; 
      return this.http.post<any>(`${this.apiUrl}/khach-hang/deleteotp`,params);
    }
  }