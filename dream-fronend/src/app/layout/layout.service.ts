import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LayoutService {
 private apiUrl = 'http://localhost:8080/api/hoa-don/hien-thi-ban-hang'; // API endpoint
private baseUrl = 'http://localhost:8080/api/hoa-don';
  constructor(private http: HttpClient) { }

// Phương thức gọi API để lấy danh sách nhân viên ngoại trừ nhân viên có id đã truyền vào
  getAllNhanVienExcept(excludeId: number): Observable<any[]> {
    const params = new HttpParams().set('excludeId', excludeId.toString());
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // Lấy danh sách hóa đơn có trạng thái = 6 theo id nhân viên
  getHoaDonByNhanVienId(nhanVienId: number): Observable<any[]> {
    const url = `${this.baseUrl}/nhanvien/${nhanVienId}`;
    return this.http.get<any[]>(url);
  }

  deleteHoaDonChuaThanhToan(idNhanVien: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/delete-hoadon-nhanvien/${idNhanVien}`);
}

// Gọi API để bàn giao hóa đơn chưa thanh toán sang nhân viên khác
banGiaoHoaDonChoNhanVienMoi(idNhanVienCu: number, idNhanVienMoi: number): Observable<any> {
  const url = `${this.baseUrl}/assign?from=${idNhanVienCu}&to=${idNhanVienMoi}`;
  return this.http.put(url, null);
}

}
