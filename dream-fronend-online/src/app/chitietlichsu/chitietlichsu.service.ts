import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChitietlichsuService {

  
  private apiUrl = 'http://localhost:8080/api/hoa-don-online';  // Update this if needed to match your backend URL

  constructor(private http: HttpClient) { }

  
  getHoaDonByMa(ma: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/find-by-ma/${ma}`);
  }

}
