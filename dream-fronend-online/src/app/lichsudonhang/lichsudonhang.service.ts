import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class LichsudonhangService {
  private apiUrl = 'http://localhost:8080/api/hoa-don-online';
  constructor(private http: HttpClient) { }

  getHoaDonChiTiet(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hoa-don-chi-tiet`);  // Send GET request
  }
}
