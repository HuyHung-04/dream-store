import {Injectable} from '@angular/core';
import {HttpClient,HttpParams} from '@angular/common/http';
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
  phiVanChuyen: number;
  tongTienTruocVoucher: number;
  tongTienThanhToan: number;
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
  sdtNguoiNhan: string;
  listTrangThai: number | null;
  pageSize: number;
  page: number;
}


@Injectable({
  providedIn: 'root'
})
export class HoaDonService {
  private readonly apiUrl = 'http://localhost:8080/api/hoa-don';
  private readonly apiUrlHDCT = 'http://localhost:8080/api/hoa-don-chi-tiet';
  private apiHoaDonOnline = 'http://localhost:8080/api/hoa-don-online';
  constructor(private http: HttpClient) { }

  getHoaDons(request: HoaDonSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/all`, request);
  }
  getHDCT(request: HoaDonChiTietSearchRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrlHDCT}/all`, request);
  }

  getHDCTByHD(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlHDCT}/${id}/all`);
  }

  capNhatTrangThai(id: number): Observable<HoaDonResponse> {
    return this.http.post<any>(`${this.apiHoaDonOnline}/${id}/tang-trang-thai`, null);
  }

  // Phương thức lấy chi tiết hóa đơn theo mã hóa đơn
  getChiTietHoaDon(idHoaDon: number): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDonOnline}/chi-tiet/${idHoaDon}`);
  }

  getHoaDonByMa(idHoaDon: number): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDonOnline}/find-by-ma/${idHoaDon}`);
  }

  updateHoaDon(invoiceId: number, request: any): Observable<any> {
    const url = `${this.apiUrl}/${invoiceId}/update`;
    return this.http.put<any>(url, request);
  }

  
}
