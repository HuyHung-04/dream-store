import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopSanPhamResponse {
  tenSanPham: string;  // Tên sản phẩm
  tongSoLuong: number; // Tổng số lượng bán được
}

export interface ThongKeHomNayResponse {
  soHoaDon: number;         // Số hóa đơn trong ngày hôm nay
  tongDoanhThu: number;     // Tổng doanh thu trong ngày hôm nay
  soKhachHang: number;      // Số khách hàng trong ngày hôm nay
}
export interface ThongKeResponse {
  soHoaDon: number;
  tongDoanhThu: number;
  soKhachHang: number;
}

export interface ThongKeThangResponse {
  thang: number; // Có thể là tháng hoặc năm, tùy vào API trả về
  tongDoanhThu: number;
}
export interface ThongKeThangNayResponse {
  ngay: number; // Có thể là tháng hoặc năm, tùy vào API trả về
  tongDoanhThu: number;
}
export interface ThongKeRequest {
  startDate: string | null;
  endDate: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ThongKeService {
  private apiUrl = 'http://localhost:8080/api/thong-ke';

  constructor(private http: HttpClient) {}

  // Lấy dữ liệu thống kê tổng quan
  thongKeTongQuan(type: string): Observable<ThongKeResponse> {
    return this.http.get<ThongKeResponse>(`${this.apiUrl}/${type}`);
  }

// Lấy dữ liệu thống kê doanh thu từng tháng trong năm được chọn
thongKeTungThangNam(year: number): Observable<ThongKeThangResponse[]> {
  return this.http.get<ThongKeThangResponse[]>(`${this.apiUrl}/nam-nay/thang`, {
    params: { year: year.toString() }
  });
}

  // Lấy dữ liệu thống kê doanh thu theo từng năm
  thongKeTungNam(): Observable<ThongKeThangResponse[]> {
    return this.http.get<ThongKeThangResponse[]>(`${this.apiUrl}/tat-ca/nam`);
  }

  thongKeTungNgayTrongThang(month: number, year: number): Observable<ThongKeThangNayResponse[]> {
    return this.http.get<ThongKeThangNayResponse[]>(
      `${this.apiUrl}/thang-nay/ngay?month=${month}&year=${year}`
    );
  }
  
  // Lấy dữ liệu thống kê doanh thu ngày hôm nay
  thongKeHomNay(): Observable<ThongKeHomNayResponse> {
    return this.http.get<ThongKeHomNayResponse>(`${this.apiUrl}/hom-nay`);
  }

   // Lấy top sản phẩm bán chạy trong ngày hôm nay
   topSanPhamHomNay(page: number, size: number): Observable<TopSanPhamResponse[]> {
    return this.http.get<TopSanPhamResponse[]>(`${this.apiUrl}/hom-nay/top-san-pham?page=${page}&size=${size}`);
  }

  // Lấy top sản phẩm bán chạy theo tháng và năm truyền vào
topSanPhamTheoThangVaNam(thang: number, nam: number, page: number, size: number): Observable<TopSanPhamResponse[]> {
  return this.http.get<TopSanPhamResponse[]>(
    `${this.apiUrl}/top-san-pham?thang=${thang}&nam=${nam}&page=${page}&size=${size}`
  );
}

  // Lấy top sản phẩm bán chạy theo năm được chọn
topSanPhamTheoNam(nam: number, page: number, size: number): Observable<TopSanPhamResponse[]> {
  return this.http.get<TopSanPhamResponse[]>(
    `${this.apiUrl}/top-san-pham-nam?nam=${nam}&page=${page}&size=${size}`
  );
}


  // Lấy top sản phẩm bán chạy tất cả thời gian
  topSanPhamTatCa(page: number, size: number): Observable<TopSanPhamResponse[]> {
    return this.http.get<TopSanPhamResponse[]>(`${this.apiUrl}/tat-ca/top-san-pham?page=${page}&size=${size}`);
  }

   // Phương thức để gọi API lấy tổng quan theo tháng và năm
   getThongKeTongQuan(month: number, year: number): Observable<ThongKeResponse> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<ThongKeResponse>(`${this.apiUrl}/thongke/tongquan`, { params });
  }



  // Trong thongke.service.ts
  thongKeTheoKhoangThoiGian(
    startDate: string | null, 
    endDate: string | null
    ): Observable<ThongKeResponse> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });
  
    let params = new HttpParams();
    if (startDate) {
      params = params.append('startDate', startDate); // Format: yyyy-MM-dd
    }
    if (endDate) {
      params = params.append('endDate', endDate); // Format: yyyy-MM-dd
    }
  
    return this.http.get<ThongKeResponse>(
      `${this.apiUrl}/khoang-thoi-gian`,
      { params, headers }
    );
    }
  
  
    // Thêm phương thức mới
    topSanPhamTheoKhoangNgay(
      startDate: string | null,
      endDate: string | null,
      page: number,
      size: number
    ): Observable<TopSanPhamResponse[]> {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      });
  
      let params = new HttpParams()
        .append('page', page.toString())
        .append('size', size.toString());
  
      if (startDate) {
        params = params.append('startDate', startDate);
      }
      if (endDate) {
        params = params.append('endDate', endDate);
      }
  
      return this.http.get<TopSanPhamResponse[]>(
        `${this.apiUrl}/khoang-ngay/top-san-pham`,
        { params, headers }
      );
    }
}
