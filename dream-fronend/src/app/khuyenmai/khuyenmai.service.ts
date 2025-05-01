import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
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
  chiTietKhuyenMai(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/khuyenmai/${id}`);
  }
  updateKhuyenMai(khuyenmai: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/khuyenmai/update`, khuyenmai);
  }

  searchKhuyenMaiByTenAndTrangThai(trangThai: number,ten: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
    .set('trangThai', trangThai)
      .set('ten', ten)
      .set('page', page.toString())
      .set('size', size.toString());
  
    return this.http.get<any>(`${this.apiUrl}/khuyenmai/search`, { params });
  }
 
  getSanPham(khuyenMaiId: number, tenSanPham?: string): Observable<SanPhamChiTietDto[]> {
    let url = `${this.apiUrl}/khuyenmai/${khuyenMaiId}/select-products`;
    if (tenSanPham) {
        url += `?tenSanPham=${encodeURIComponent(tenSanPham)}`;
    }
    return this.http.get<SanPhamChiTietDto[]>(url);
}

  saveSanPhamWithKhuyenMai(khuyenMaiId: number, productIds: number[]): Observable<string> {
    return this.http.post(`${this.apiUrl}/khuyenmai/${khuyenMaiId}/update-products`, productIds, {
      responseType: 'text', // Expect a plain text response
    });
  }
 
}
