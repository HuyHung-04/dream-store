import { Injectable } from '@angular/core';
import { HttpClient,HttpParams  } from '@angular/common/http';
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

  // Phương thức hủy hóa đơn sử dụng RequestParam
  huyHoaDon(maHoaDon: string, ghiChu: string): Observable<any> {
    const params = new HttpParams()
      .set('maHoaDon', maHoaDon)
      .set('ghiChu', ghiChu);

    return this.http.post<any>(`${this.apiUrl}/huy`, null, { params });
  }
}
