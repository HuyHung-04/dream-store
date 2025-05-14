import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BanhangService {

  private apiUrl = 'http://localhost:8080/api/san-pham-chi-tiet/ban-hang';
  private apiUrl1 = 'http://localhost:8080/api/san-pham-chi-tiet/check-ban-hang';
  private apiUrlHD = 'http://localhost:8080/api/hoa-don';
  private apiUrlKH = 'http://localhost:8080/api/khach-hang';
  private apiUrlNV = 'http://localhost:8080/api';
  private apiUrlHDCT = 'http://localhost:8080/api/hoa-don-chi-tiet';
  private apiUrlPTTT = 'http://localhost:8080/api/phuong-thuc-thanh-toan';
  private apiVoucher = 'http://localhost:8080/api/voucher';

  constructor(private http: HttpClient) { }

  getSanPham(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  getAllSanPham(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl1}?page=0&size=10000`);
  }

  getDanhSachHD(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrlHD}/all`, request);
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

  cancelHoaDon(id: number): Observable<any> {
    return this.http.post(`${this.apiUrlHD}/${id}/cancel`, { trangThai: 0 });
  }

  updateHoaDon(invoiceId: number, request: any): Observable<any> {
    const url = `${this.apiUrlHD}/${invoiceId}/update`;
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
    return this.http.post(this.apiUrlHD + '/create', request);
  }

getDanhSachNhanVien(excludeId: number | null): Observable<any> {
  let params = new HttpParams();
  if (excludeId !== null) {
    params = params.set('excludeId', excludeId.toString());
  }
  return this.http.get<any[]>(`${this.apiUrlNV}/hoa-don/hien-thi-ban-hang`, { params });
}

  getHoaDonById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlHD}/${id}`);
  }

  getPhuongThucById(idPhuongThucThanhToan: number) {

  }

  getDanhSachPTTT(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlPTTT}/payment-methods`);
  }

  getNhanVienById(idNhanVien: number) {
    if (!idNhanVien) {
      console.error("Lỗi: idNhanVien không hợp lệ!", idNhanVien);
      return;
    }
    return this.http.get<any>(`${this.apiUrlNV}/nhan-vien/${idNhanVien}`);
  }

  getKhachHangById(idKhachHang: number) {
    return this.http.get<any>(`${this.apiUrlKH}/${idKhachHang}`);
  }

  getDanhSachMau(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/mau-sac/hien-thi');
  }

  getDanhSachSize(): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/size/hien-thi');
  }

  locSanPham(params: HttpParams): Observable<any> {
    return this.http.get<any>('http://localhost:8080/api/san-pham-chi-tiet/loc-ban-hang', { params });
  }
  exportHoaDonPDF(hoaDonId: number): Observable<Blob> {
    const apiUrl = `${this.apiUrlHD}/${hoaDonId}/export-pdf`;
    return this.http.get(apiUrl, { responseType: 'blob' }); // Trả về file PDF dạng Blob
  }

  // Cập nhật số lượng tồn kho của sản phẩm
  updateSoLuongSanPham(idSanPham: number, soLuong: number, isIncrease: boolean): Observable<any> {
    const url = `http://localhost:8080/api/san-pham-chi-tiet/ban-hang/update-so-luong/${idSanPham}`;
    const params = {
      soLuong: soLuong.toString(),
      isIncrease: isIncrease.toString()
    };
    return this.http.put(url, null, { params: params });
  }
    // Gọi API để lấy danh sách voucher hợp lệ theo ID khách hàng
    getVouchers(tongTien: number): Observable<any> {
      return this.http.get<any>(`http://localhost:8080/api/hoa-don-online/vouchers/${tongTien}`);
    }
}
