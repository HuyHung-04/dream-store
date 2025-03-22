import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class NhanVienService {
  private apiUrl = 'http://localhost:8080/api'; // URL backend
  constructor(private http: HttpClient) {}
  // 🟢 Nhân viên API
  // Lấy danh sách nhân viên có phân trang
  getNhanVien(page: number, size: number, trangThai?: number): Observable<any> {
    let url = `${this.apiUrl}/nhan-vien/hien-thi?page=${page}&size=${size}`;
  
    if (trangThai !== undefined && trangThai !== null && trangThai !== 2) { 
      url = `${this.apiUrl}/nhan-vien/trang-thai/${trangThai}?page=${page}&size=${size}`;
    }    
  
    console.log("Fetching data from:", url); // Debug URL
  
    return this.http.get<any>(url).pipe(
      map(response => {
        response.content.forEach((nhanVien: any) => {
          if (nhanVien.anh) {
            nhanVien.anh = `${this.apiUrl}/nhan-vien/image/${nhanVien.anh}`;
          }
        });
        return response;
      })
    );
  }
  // Thêm nhân viên mà không có ảnh
  addNhanVien(nhanVien: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/nhan-vien/add`, nhanVien); // Thêm /nhan-vien/ vào URL
  }

  // Thêm ảnh cho nhân viên
  addImageForNhanVien(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // Gửi yêu cầu POST đến API để cập nhật ảnh
    return this.http.post<any>(`${this.apiUrl}/nhan-vien/add-image/${id}`, formData); // Đảm bảo API chính xác
  }

  // Lấy chi tiết nhân viên theo ID
  getNhanVienDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/nhan-vien/${id}`);
  }

  // Cập nhật thông tin nhân viên
  updateNhanVien(nhanVien: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/nhan-vien/update`, nhanVien);
  }

  // 🔎 Tìm kiếm nhân viên theo tên
  searchNhanVienByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nhan-vien/search?ten=${name}`);
  }
  // 🟢 Vai trò API

  // Lấy danh sách tất cả vai trò
  getVaiTros(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vai-tro/hien-thi`);
  }
  // ✅ Thêm vai trò
  addVaiTro(vaiTro: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vai-tro/add`, vaiTro);
  }

  // ✅ Cập nhật vai trò
  updateVaiTro(vaiTro: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vai-tro/update`, vaiTro);
  }

  // 🖼 API lấy ảnh nhân viên
  getNhanVienImage(filename: string): string {
  return `${this.apiUrl}/nhan-vien/image/${filename}`;
  }
}