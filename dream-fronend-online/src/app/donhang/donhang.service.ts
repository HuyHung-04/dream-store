import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DonhangService {
  private apiUrl = 'http://localhost:8080/api/hoa-don-online';
  constructor(private http: HttpClient) { }

   // Phương thức lấy chi tiết hóa đơn theo mã hóa đơn
   getChiTietHoaDon(maHoaDon: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/chi-tiet/${maHoaDon}`);
  }
}
