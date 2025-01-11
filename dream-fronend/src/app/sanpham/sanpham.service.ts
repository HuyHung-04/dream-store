import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SanphamService {
  private apiUrl = 'http://localhost:8080/api'; // URL backend

  constructor(private http: HttpClient) {}
  // Lấy danh sách sản phẩm từ backend
  // hàm sản phẩm
  getSanPham(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/san-pham/hien-thi'); 
  }
  // hàm thương hiệu
  getThuongHieu(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/thuong-hieu/hien-thi');
  }
  // hàm chất liệu
  getChatLieu(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/chat-lieu/hien-thi');
  }
  // hàm cổ áo
  getCoAo(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/co-ao/hien-thi');
  }
  // hàm xuất xứ
  getXuauXu(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/xuat-xu/hien-thi');
  }
}
