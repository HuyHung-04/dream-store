import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NhanvienService {
  private apiUrl = 'http://localhost:8080/api/nhanvien'; // URL backend

  constructor(private http: HttpClient) {}

  // Lấy danh sách nhân viên
  getAllNhanVien(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Lấy thông tin chi tiết nhân viên theo ID
  getNhanVienById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
