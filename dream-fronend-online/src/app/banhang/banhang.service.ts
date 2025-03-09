import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BanhangService {
  private apiUrl = 'http://localhost:8080/api/ban-hang-online'; // Địa chỉ API backend
  private searchQuery = new BehaviorSubject<string>('');
  private searchResults = new BehaviorSubject<any[]>([]);

  searchQuery$ = this.searchQuery.asObservable();
  searchResults$ = this.searchResults.asObservable();
  constructor(private http: HttpClient) {}

  getSanPhamOnline(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hien-thi?page=${page}&size=${size}`);
  }
  
  setSearchQuery(query: string) {
    this.searchQuery.next(query);
  }

   // ✅ Tìm kiếm sản phẩm theo tên có phân trang
   timKiemSanPham(ten: string, page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search?name=${encodeURIComponent(ten)}&page=${page}&size=${size}`);
  }
  setSearchResults(results: any) {
    // Truy xuất mảng content từ đối tượng trả về, đảm bảo truyền mảng vào BehaviorSubject
    if (results && results.content) {
      this.searchResults.next(results.content);  // Chỉ truyền mảng `content`
    } else {
      this.searchResults.next([]);  // Nếu không có `content`, trả về mảng rỗng
    }
  }
  
}
