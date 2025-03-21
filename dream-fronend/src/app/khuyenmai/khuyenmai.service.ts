import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface SanPhamChiTietDto {
  id: number;
  ma: string;
  sanPhamTen: string;
  mauSacTen: string;
  sizeTen: string;
  gia: number;
  soLuong: number;
  selected: boolean;
  disabled: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class KhuyenmaiService {
  private apiUrl = 'http://localhost:8080/api'; // URL backend
  
  constructor(private http: HttpClient) {}
  // Lấy danh sách sản phẩm từ backend
  // hàm sản phẩm
  getKhuyenMai(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khuyenmai/hien-thi?page=${page}&size=${size}`);
  }
  addKhuyenMai(khuyenmai: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/khuyenmai/add`, khuyenmai).pipe(
    );
  }
  getKhuyenMaiDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khuyenmai/${id}`);
  }
  updateKhuyenMai(khuyenmai: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/khuyenmai/update`, khuyenmai);
  }
  searchKhuyenMaiByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/khuyenmai/search?ten=${name}`);
  }
 
  getAvailableProducts(khuyenMaiId: number, tenSanPham?: string): Observable<SanPhamChiTietDto[]> {
    let url = `${this.apiUrl}/khuyenmai/${khuyenMaiId}/select-products`;
    if (tenSanPham) {
        url += `?tenSanPham=${encodeURIComponent(tenSanPham)}`;
    }
    return this.http.get<SanPhamChiTietDto[]>(url);
}

  updateKhuyenMaiProducts(khuyenMaiId: number, productIds: number[]): Observable<string> {
    return this.http.post(`${this.apiUrl}/khuyenmai/${khuyenMaiId}/update-products`, productIds, {
      responseType: 'text', // Expect a plain text response
    });
  }
  getKhhuyenMaiByTrangThai(trangThai:number,page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khuyenmai/loc-trang-thai?trangThai=${trangThai}&page=${page}&size=${size}`);
  }
}
