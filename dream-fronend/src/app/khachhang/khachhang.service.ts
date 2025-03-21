import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  searchKhachHangByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/khach-hang/search?ten=${name}`);
  }
  getKhachHangByTrangThai(trangThai:number,page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khach-hang/loc-trang-thai?trangThai=${trangThai}&page=${page}&size=${size}`);
  }
  getKhachHangByEmail(email: String): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/khach-hang/detail?email=${email}`);
  }
}