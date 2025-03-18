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
  private apiUrlHDCT = 'http://localhost:8889/api/hoa-don-chi-tiet';
  private apiUrlPhuongThucThanhToan = 'http://localhost:8889/api/';
  private apiVoucher = 'http://localhost:8889/api/voucher';

  constructor(private http: HttpClient) { }

  getSanPham(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  addSanPhamToHoaDon(hoaDonId: number, sanPhamChiTietId: number, soLuong: number): Observable<any> {
    return this.http.post(`${this.apiUrlHDCT}/${hoaDonId}/add/${sanPhamChiTietId}?soLuong=${soLuong}`, {});
  }

  updateHoaDonChiTiet(id: number, soLuong: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrlHDCT}/${id}/update`, null, {
      params: { soLuong: soLuong.toString() }
    });
  }
  deleteHoaDonChiTiet(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrlHDCT}/${id}/remove`);
  }
  searchHDCT(searchRequest: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrlHDCT}/all`, searchRequest);
  }
  getVoucher(): Observable<any> {
    const page = 0;
    const size = 1000;
    const url = `${this.apiVoucher}/hien-thi?page=${page}&size=${size}`;
    return this.http.get<any>(url).pipe(
      map(response => response.content)
    );
  }
  getDetailVoucher(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiVoucher}/${id}`);
  }

  updateHoaDon(invoiceId: number, request: any): Observable<any> {
    const url = `${this.apiUrlTaoHoaDon}/${invoiceId}/update`;
    return this.http.put<any>(url, request);
  }

  getKhachHangBySdt(soDienThoai: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrlKH}/tim-khach-hang?soDienThoai=${soDienThoai}`);
  }
  createKhachHang(khachHang: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlKH}/add`, khachHang);
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
        return response.content;
      })
    );
  }

  getHoaDonById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlTaoHoaDon}/${id}`);
  }

  getPhuongThucById(idPhuongThucThanhToan: number) {

  }
  getNhanVienById(idNhanVien: number) {
    if (!idNhanVien) {
      console.error("Lỗi: idNhanVien không hợp lệ!", idNhanVien);
      return;
    }
    return this.http.get<any>(`${this.apiUrlNhanVien}/nhan-vien/${idNhanVien}`);
  }

  getKhachHangById(idKhachHang: number) {
    return this.http.get<any>(`${this.apiUrlKH}/${idKhachHang}`);
  }
}
