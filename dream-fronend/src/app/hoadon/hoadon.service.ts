import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface HoaDonSearchRequest {
  maHoaDon?: string | null;
  tenKhachHang?: string | null;
  ngayTaoFrom?: Date | null;
  ngayTaoTo?: Date | null;
  listTrangThai?: number[];
  page?: number;
  pageSize?: number;
}

export interface HoaDonCRUDRequest {
  tenKhachHang?: string;
  // Thêm các trường khác cho create/update
}

export interface HoaDonPageResponse {
  content: HoaDonResponse[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface HoaDonResponse {
  id: number;
  maHoaDon: string;
  tenKhachHang: string;
  tenNhanVien?: string;
  tenVoucher?: string;
  ngayTao: string;
  ngaySua: string;
  trangThai: number;
}

@Injectable({
  providedIn: 'root'
})
export class HoaDonService {
  private readonly apiUrl = 'http://localhost:8080/api/hoa-don';

  constructor(private http: HttpClient) { }

  getHoaDons(request: HoaDonSearchRequest): Observable<HoaDonPageResponse> {
    const cleanedRequest = this.cleanRequest({
      ...request,
      ngayTaoFrom: this.formatDate(request.ngayTaoFrom),
      ngayTaoTo: this.formatDate(request.ngayTaoTo)
    });

    return this.http.post<HoaDonPageResponse>(`${this.apiUrl}/all`, cleanedRequest);
  }

  createHoaDon(request: HoaDonCRUDRequest): Observable<HoaDonResponse> {
    return this.http.post<HoaDonResponse>(
      `${this.apiUrl}/create`,
      this.cleanRequest(request)
    );
  }

  updateHoaDon(id: number, request: HoaDonCRUDRequest): Observable<HoaDonResponse> {
    return this.http.put<HoaDonResponse>(
      `${this.apiUrl}/${id}/update`,
      this.cleanRequest(request)
    );
  }

  // Hủy hóa đơn
  cancelHoaDon(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/huy-don/${id}`, {});
  }

  // Xóa các giá trị null/undefined khỏi request
  private cleanRequest(obj: any): any {
    return Object.entries(obj)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
  }

  // Format date sang ISO string
  private formatDate(date: Date | null | undefined): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // yyyy-MM-dd
  }
}
