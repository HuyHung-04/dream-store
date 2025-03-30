import { Injectable } from '@angular/core';
import { HttpClient,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class LichsudonhangService {
  private apiUrl = 'http://localhost:8080/api/hoa-don-online';
  constructor(private http: HttpClient) { }

  getHoaDonChiTiet(idKhachHang: number, trangThai: number): Observable<any> {
    // Cấu hình tham số truy vấn
    let params = new HttpParams().set('idKhachHang', idKhachHang.toString());
    if (trangThai !== 0) {
      params = params.set('trangThai', trangThai.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/hoa-don/${idKhachHang}`, { params });
  }
}
