import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HoaDonResponse {
  id: number;
  idKhachHang: number;
  idNhanVien: number;
  idPhuongThucThanhToan: number;
  idVoucher: number;
  tenKhachHang: string;
  tenNhanVien: string;
  tenVoucher: string;
  giaTriGiam: number;
  hinhThucGiam: boolean;
  tenPhuongThucThanhToan: string;
  maHoaDon: string;
  tenNguoiNhan: string;
  sdtNguoiNhan: string;
  diaChiNhanHang: string;
  hinhThucThanhToan: string;
  phiVanChuyen: number;
  tongTienTruocVoucher: number;
  tongTienThanhToan: number;
  ngayNhanDuKien: string;  // Đã format "yyyy-MM-dd"
  ngayTao: string;
  ngaySua: string;
  trangThai: number;
  ghiChu: string;
  totalRecords?: number;
}

export interface HoaDonSearchRequest {
  maHoaDon: string;
  tenKhachHang: string;
  tenNhanVien: string;
  ngayTaoFrom: string | null;
  ngayTaoTo: string | null;
  listTrangThai: number | null;
  pageSize: number;
  page:number;
}


@Injectable({
  providedIn: 'root'
})
export class HoaDonService {
  private readonly apiUrl = 'http://localhost:8889/api/hoa-don';

  constructor(private http: HttpClient) { }

  getHoaDons(request: HoaDonSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/all`, request);
  }


}
