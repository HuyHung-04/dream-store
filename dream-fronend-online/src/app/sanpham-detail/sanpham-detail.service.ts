import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SanphamDetailService {
  private apiUrl = 'http://localhost:8080/api/ban-hang-online';
  private apiSize = 'http://localhost:8080/api/size/hien-thi';
  private apiMauSac = 'http://localhost:8080/api/mau-sac/hien-thi';
  private apiDiaChi = 'http://localhost:8080/api/dia-chi-khach-hang';
  // private modalState = new BehaviorSubject<boolean>(false);
  // modalState$ = this.modalState.asObservable();

  // toggleModal() {
  //   this.modalState.next(!this.modalState.value);
  // }
 

  constructor(private http: HttpClient) {}

  getSanPhamById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hien-thi-spct/${id}`);
  }

  getSizes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiSize);
  }

  getMauSac(): Observable<any[]> {
    return this.http.get<any[]>(this.apiMauSac);
  }

  getThongTinKhachHang(idKhachHang: number): Observable<any> {
    return this.http.get<any>(`${this.apiDiaChi}/hien-thi/${idKhachHang}`);
  }

  getGioHangChiTietById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/gio-hang/${id}`);
  }
}
