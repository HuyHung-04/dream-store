import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DonhangService {
  // URL của API (có thể thay đổi nếu bạn muốn)
  private apiUrl = 'http://localhost:8080/api/hoa-don/filter';
  private apiHoaDonOnline = 'http://localhost:8080/api/hoa-don-online';
  constructor(private http: HttpClient) { }

  // Phương thức gọi API để lấy hóa đơn theo các tiêu chí lọc
  getHoaDonsByTrangThaiAndNguoiNhanAndMa(trangThai: number, tenNguoiNhan: string, sdtNguoiNhan: string, maHoaDon: string, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('trangThai', trangThai.toString()) // Lọc theo trạng thái
      .set('tenNguoiNhan', tenNguoiNhan) // Lọc theo tên người nhận
      .set('sdtNguoiNhan', sdtNguoiNhan) // Lọc theo số điện thoại người nhận
      .set('maHoaDon', maHoaDon) // Lọc theo mã hóa đơn
      .set('page', page.toString()) // Số trang
      .set('size', size.toString()); // Số bản ghi mỗi trang

    return this.http.get<any>(this.apiUrl, { params });
  }

  capNhatTrangThai(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiHoaDonOnline}/${id}/tang-trang-thai`, null);
  }

  // Phương thức lấy chi tiết hóa đơn theo mã hóa đơn
  getChiTietHoaDon(maHoaDon: string): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDonOnline}/chi-tiet/${maHoaDon}`);
  }

  getHoaDonByMa(ma: string): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDonOnline}/find-by-ma/${ma}`);
  }

  // Phương thức hủy hóa đơn sử dụng RequestParam
  huyHoaDon(maHoaDon: string, ghiChu: string): Observable<any> {
    const params = new HttpParams()
      .set('maHoaDon', maHoaDon)
      .set('ghiChu', ghiChu);

    return this.http.post<any>(`${this.apiHoaDonOnline}/huy`, null, { params });
  }
}
