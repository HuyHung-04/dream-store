import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {
  private apiUrl = 'http://localhost:8080/api'; // URL backend
  
  constructor(private http: HttpClient) {}
  // Lấy danh sách sản phẩm từ backend
  // hàm sản phẩm
  getVoucher(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/voucher/hien-thi?page=${page}&size=${size}`);
  }
  addVoucher(voucher: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/voucher/add`, voucher).pipe(
    );
  }
  getVoucherDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/voucher/${id}`);
  }
  updateVoucher(voucher: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/voucher/update`, voucher);
  }
  locTrangThai(trangThai:number,page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/voucher/loc-trang-thai?trangThai=${trangThai}&page=${page}&size=${size}`);
  }
  checkVoucherUsed(voucherId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/voucher/voucher/${voucherId}/check-used`);
  }
  searchVoucherByTen(ten: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('ten', ten)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/voucher/search`, { params });
  }
  
}
