import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

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
  ngayNhanDuKien: string;
  ngayTao: string;
  ngaySua: string;
  trangThai: number;
  ghiChu: string;
  totalRecords?: number;
}

export interface HoaDonChiTietSearchRequest {
  idHoaDon: number | null;
}

export interface HoaDonChiTietResponse {
  id: number;
  idHoaDon: number;
  maHoaDon: string;
  tenSanPham: string;
  tenKhachHang: string;
  tenNhanVien: string;
  maSanPhamChiTiet: string;
  maHoaDonChiTiet: string;
  tenMau: string;
  tenSize: string;
  soLuong: number;
  gia: number;
  ngaySua: string;
  ngayTao: string;
  ghiChu: string;
  totalRecords?: number;
}

export interface HoaDonSearchRequest {
  maHoaDon: string;
  tenKhachHang: string;
  tenNhanVien: string;
  ngayTaoFrom: string | null;
  ngayTaoTo: string | null;
  ngaySuaFrom: string | null;
  ngaySuaTo: string | null;
  sdtNguoiNhan: string;
  listTrangThai: number | null;
  pageSize: number;
  page: number;
}


@Injectable({
  providedIn: 'root'
})
export class HoaDonService {
  private readonly apiUrl = 'http://localhost:8889/api/hoa-don';
  private readonly apiUrlHDCT = 'http://localhost:8889/api/hoa-don-chi-tiet';

  constructor(private http: HttpClient) {
  }

  getHoaDons(request: HoaDonSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/all`, request);
  }
  getHDCT(request: HoaDonChiTietSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrlHDCT}/all`, request);
  }

  getHDCTByHD(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlHDCT}/${id}/all`);
  }

  updateHoaDon(invoiceId: number, request: any): Observable<any> {
    const url = `${this.apiUrl}/${invoiceId}/update`;
    return this.http.put<any>(url, request);
  }
}
