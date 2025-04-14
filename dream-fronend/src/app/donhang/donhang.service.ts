import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DonhangService {
  private apiUrl = 'http://localhost:8080/api/hoa-don/filter';
  private apiHoaDonOnline = 'http://localhost:8080/api/hoa-don-online';
  constructor(private http: HttpClient) { }

  // Phương thức gọi API để lấy hóa đơn theo các tiêu chí lọc
  getHoaDonsByTrangThaiAndNguoiNhanAndMa(trangThai: number, tenNguoiNhan: string, sdtNguoiNhan: string, maHoaDon: string): Observable<any> {
    let params = new HttpParams()
      .set('trangThai', trangThai.toString())
      .set('tenNguoiNhan', tenNguoiNhan)
      .set('sdtNguoiNhan', sdtNguoiNhan)
      .set('maHoaDon', maHoaDon)

    return this.http.get<any>(this.apiUrl, { params });
  }

  //phương thức cập nhật trạng thái cho đơn hàng
  capNhatTrangThai(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiHoaDonOnline}/${id}/tang-trang-thai`, null);
  }

  // Phương thức lấy chi tiết hóa đơn theo mã hóa đơn
  getHoaDonChiTiet(idHoaDon: number): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDonOnline}/chi-tiet/${idHoaDon}`);
  }

  //phương thức lấy hóa đơn theo mã
  getHoaDon(idHoaDon: number): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDonOnline}/find-by-ma/${idHoaDon}`);
  }

  // Phương thức hủy hóa đơn sử dụng RequestParam
  huyHoaDon(idHoaDon: number, ghiChu: string): Observable<any> {
    const params = new HttpParams()
      .set('idHoaDon', idHoaDon)
      .set('ghiChu', ghiChu);

    return this.http.post<any>(`${this.apiHoaDonOnline}/huy`, null, { params });
  }
}
