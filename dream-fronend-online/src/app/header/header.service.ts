import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private apiUrl = 'http://localhost:8080/api/gio-hang';
  // hiện modal thanh toán
  private modalThanhToanSubject = new BehaviorSubject<boolean>(false);
  modalThanhToan$ = this.modalThanhToanSubject.asObservable();
  
  private gioHangUpdated = new BehaviorSubject<boolean>(false);
  gioHangUpdated$ = this.gioHangUpdated.asObservable();

  constructor(private http: HttpClient) {}

  getGioHang(idKhachHang: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/hien-thi?idKhachHang=${idKhachHang}`);
  }

  addToCart(sanPham: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, sanPham);
  }

  deleteFromCart(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  updateSoLuong(id: number, soLuongMoi: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-soluong/${id}?soLuongMoi=${soLuongMoi}`, {});
  }
  searchSanPhamByName(name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/khach-hang/tim-kiem?ten=${name}`);
  }
  notifyGioHangUpdated() {
    this.gioHangUpdated.next(true);
  }
  // hiện modal thanh toán
  openModalThanhToan() {
    this.modalThanhToanSubject.next(true);
  }

  closeModalThanhToan() {
    this.modalThanhToanSubject.next(false);
  }
  
}
