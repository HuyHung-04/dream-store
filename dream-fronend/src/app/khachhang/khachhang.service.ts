import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KhachHangService {
  private apiUrl = 'http://localhost:8080/api'; // URL backend
  
  constructor(private http: HttpClient) {}
  // Lấy danh sách sản phẩm từ backend
  // hàm sản phẩm
  getKhachHang(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khach-hang/hien-thi?page=${page}&size=${size}`);
  }
  addKhachHang(khachhang: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/khach-hang/add`, khachhang).pipe(
    );
  }
  getKhachHangDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khach-hang/${id}`);
  }
  updateKhachHang(khachhang: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/khach-hang/update`, khachhang);
  }
  searchKhachHangByTen(ten: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('ten', ten)
      .set('page', page.toString())
      .set('size', size.toString());
  
    return this.http.get<any>(`${this.apiUrl}/khach-hang/search`, { params });
  }
  
  getKhachHangByTrangThai(trangThai:number,page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khach-hang/loc-trang-thai?trangThai=${trangThai}&page=${page}&size=${size}`);
  }
  getKhachHangByEmail(email: String): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/khach-hang/detail?email=${email}`);
  }
}