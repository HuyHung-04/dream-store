import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BanhangService {

  private apiUrl = 'http://localhost:8080/api/san-pham-chi-tiet/ban-hang';
  private apiUrlHD = 'http://localhost:8080/api/hoa-don-chi-tiet';
  private apiUrlKH = 'http://localhost:8080/api/khach-hang';
  private apiUrlTaoHoaDon = 'http://localhost:8080/api/hoa-don';

  constructor(private http: HttpClient) { }

  getSanPham(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addSanPhamToHoaDon(hoaDonId: number, sanPhamChiTietId: number, soLuong: number): Observable<any> {
    return this.http.post(`${this.apiUrlHD}/${hoaDonId}/add/${sanPhamChiTietId}?soLuong=${soLuong}`, {});
  }
  
  getKhachHangBySdt(soDienThoai: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlKH}/tim-khach-hang?soDienThoai=${soDienThoai}`);
  }
  
  createHoaDon(request: any): Observable<any> {
    return this.http.post(this.apiUrlTaoHoaDon + '/create', request);
  }
  
}
