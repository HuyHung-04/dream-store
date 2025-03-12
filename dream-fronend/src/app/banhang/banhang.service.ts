import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BanhangService {

  private apiUrl = 'http://localhost:8889/api/san-pham-chi-tiet/ban-hang';
  private apiUrlHD = 'http://localhost:8889/api/hoa-don-chi-tiet';
  private apiUrlKH = 'http://localhost:8889/api/khach-hang';
  private apiUrlTaoHoaDon = 'http://localhost:8889/api/hoa-don';
  private apiUrlNhanVien = 'http://localhost:8889/api';

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
  createKhachHang(khachHang: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, khachHang);
  }
  getDanhSachKhachHang(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlKH}/hien-thi?page=${page}&size=${size}`);
  }

  createHoaDon(request: any): Observable<any> {
    return this.http.post(this.apiUrlTaoHoaDon + '/create', request);
  }

  getDanhSachNhanVien(): Observable<any> {
    const page = 0;
    const size = 1000;

    return this.http.get<any>(`${this.apiUrlNhanVien}/nhan-vien/hien-thi?page=${page}&size=${size}`).pipe(
      map(response => {
        response.content.forEach((nhanVien: any) => {
          if (nhanVien.anh) {
            nhanVien.anh = `${this.apiUrl}/nhan-vien/image/${nhanVien.anh}`;
          }
        });
        return response.content; // Trả về mảng nhân viên
      })
    );
  }


}
