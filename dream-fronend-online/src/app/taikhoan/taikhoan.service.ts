import { Injectable } from '@angular/core';
 import { HttpClient, HttpHeaders, HttpParams  } from '@angular/common/http';
 import { Observable } from 'rxjs';
 
 @Injectable({
   providedIn: 'root'
 })
 export class TaiKhoanService {
     private apiUrl = 'http://localhost:8080/api'; // URL backend
     
     constructor(private http: HttpClient) {}
     // Lấy danh sách sản phẩm từ backend
     // hàm sản phẩm
     updateKhachHang(khachhang: any): Observable<any> {
       return this.http.post<any>(`${this.apiUrl}/khach-hang/update`, khachhang);
     }
     
   }