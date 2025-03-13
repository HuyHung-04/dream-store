import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HoadonService {

  private apiUrl = 'http://localhost:8080/api/dia-chi-khach-hang'; // Chỉ trỏ đến đường dẫn cơ bản
  private apiUrlTinhThanh = 'https://provinces.open-api.vn/api'; // API tỉnh thành
  private apiHoaDon ='http://localhost:8080/api/hoa-don-online';
  private apiship = 'http://localhost:8080/api/shipping';
  constructor(private http: HttpClient) { }

  // Phương thức gọi API lấy địa chỉ khách hàng theo idKhachHang
  getDiaChiKhachHang(idKhachHang: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hien-thi/${idKhachHang}`);  // Kết hợp apiUrl với idKhachHang
  }

  getTinhThanh(): Observable<any> {
    return this.http.get(`${this.apiUrlTinhThanh}/p`); // Lấy danh sách tỉnh thành
  }

  getQuanHuyen(maTinh: number): Observable<any> {
    return this.http.get(`${this.apiUrlTinhThanh}/p/${maTinh}?depth=2`); // Lấy quận huyện
  }

  getPhuongXa(maHuyen: number): Observable<any> {
    return this.http.get(`${this.apiUrlTinhThanh}/d/${maHuyen}?depth=2`); // Lấy phường xã
  }

   // Thêm phương thức gọi API thêm mới địa chỉ khách hàng
   addDiaChiKhachHang(diaChi: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, diaChi);
  }

   // ✅ Tìm ID địa chỉ dựa vào số điện thoại người nhận
   getIdBySdtNguoiNhan(sdtNguoiNhan: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/id-by-sdt?sdtNguoiNhan=${sdtNguoiNhan}`);
  }

  // ✅ Gọi API để cập nhật thông tin địa chỉ khách hàng
  updateDiaChiKhachHang( diaChi: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, diaChi);
  }
// Phương thức gọi API lấy chi tiết địa chỉ khách hàng theo ID
getDiaChiDetail(id: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}

 // ✅ Gọi API để xóa địa chỉ khách hàng theo ID
 deleteDiaChiKhachHang(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
}
 
// Phương thức gọi API lấy chi tiết giỏ hàng sau thanh toán
getChiTietGioHangSauThanhToan(idKhachHang: number): Observable<any> {
  return this.http.get<any>(`${this.apiHoaDon}/gio-hang-hoa-don/${idKhachHang}`);
}

// Gọi API tính tổng tiền cho giỏ hàng của khách hàng
getTotalPrice(idKhachHang: number): Observable<number> {
  return this.http.get<number>(`${this.apiHoaDon}/tinh-tong-tien?idKhachHang=${idKhachHang}`);
}
getVoucherIdAndTen(): Observable<any> {
  return this.http.get<any>(`${this.apiHoaDon}/vouchers`);
}

 
 // Phương thức gọi API để tính tổng tiền thanh toán sau khi áp dụng voucher
 calculateTotalWithVoucher(idKhachHang: number, idVoucher: number): Observable<number> {
  return this.http.post<number>(`${this.apiHoaDon}/tong-tien-thanh-toan?idKhachHang=${idKhachHang}&idVoucher=${idVoucher}`, {});
}

// Phương thức tính phí vận chuyển
calculateShippingCost(city: string, district: string, ward: string, latWarehouse: number, lonWarehouse: number): Observable<number> {
  return this.http.post<number>(`${this.apiship}/calculate`, {
    city,
    district,
    ward,
    latWarehouse,
    lonWarehouse
  });
}
}
