import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HoadonService {

  private apiUrl = 'http://localhost:8080/api/dia-chi-khach-hang'; // Chỉ trỏ đến đường dẫn cơ bản
  private apiUrlTinhThanh = 'https://online-gateway.ghn.vn/shiip/public-api/master-data'; // API tỉnh thành
  private apiHoaDon = 'http://localhost:8080/api/hoa-don-online';
  private ghnToken = '83fc5ffa-009a-11f0-8431-a60a80081d29';
  private phuongThuc = 'http://localhost:8080/api/phuong-thuc-thanh-toan/payment-methods';
  private ghtkToken = '1DESBs0s4MRO5AjNEhe47wZvX98OHZ0TSIg6gOg';
  private clientSource = 'S22879257';
  private vnPay = 'http://localhost:8080/vnpay';
  private newOrderCount = 0;
  private newOrderSubject = new BehaviorSubject<number>(this.newOrderCount);
  newOrderCount$ = this.newOrderSubject.asObservable();

  increaseOrderCount() {
    this.newOrderCount++;
    this.newOrderSubject.next(this.newOrderCount);
  }

  resetOrderCount() {
    this.newOrderCount = 0;
    this.newOrderSubject.next(this.newOrderCount);
  }
  constructor(private http: HttpClient) {
  }

  private getGhnHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Token': this.ghnToken,

    });
  }
  private getGhtkHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Token': this.ghtkToken,
      'X-Client-Source': this.clientSource,
    });
  }


  // Phương thức gọi API tạo thanh toán từ Spring Boot
  createThanhToanVnpay(amount: number): Observable<any> {
    const url = `${this.vnPay}/createPay`;  // Gọi API Spring Boot

    return this.http.get<any>(url, {
      params: new HttpParams().set('amount', amount.toString())  // Truyền amount qua query params
    });
  }

  // Phương thức gọi API lấy địa chỉ khách hàng theo idKhachHang
  getDiaChiKhachHang(idKhachHang: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hien-thi/${idKhachHang}`);  // Kết hợp apiUrl với idKhachHang
  }

  // Lấy danh sách tỉnh/thành từ GHN API
  getTinhThanh(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlTinhThanh}/province`, {
      headers: this.getGhnHeaders()
    });
  }

  // Phương thức lấy danh sách phương thức thanh toán
  getPhuongThucThanhToan(): Observable<any> {
    return this.http.get<any>(`${this.phuongThuc}`);
  }

  // Lấy danh sách quận/huyện theo province_id từ GHN API
  getQuanHuyen(provinceId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlTinhThanh}/district`, {
      headers: this.getGhnHeaders(),
      params: { province_id: provinceId.toString() }
    });
  }

  // Lấy danh sách phường/xã theo district_id từ GHN API
  getPhuongXa(districtId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlTinhThanh}/ward`, {
      headers: this.getGhnHeaders(),
      params: { district_id: districtId.toString() }
    });
  }

  // Thêm phương thức gọi API thêm mới địa chỉ khách hàng
  addDiaChiKhachHang(diaChi: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, diaChi);
  }

  //  Gọi API để cập nhật thông tin địa chỉ khách hàng
  updateDiaChiKhachHang(diaChi: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, diaChi);
  }
  // Phương thức gọi API lấy chi tiết địa chỉ khách hàng theo ID
  getDiaChiDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  //  Gọi API để xóa địa chỉ khách hàng theo ID
  deleteDiaChiKhachHang(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id}`);
  }

  // Phương thức gọi API lấy chi tiết giỏ hàng sau thanh toán
  getChiTietGioHangSauThanhToan(idKhachHang: number): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDon}/gio-hang-hoa-don/${idKhachHang}`);
  }

  // // Gọi API tính tổng tiền cho giỏ hàng của khách hàng
  // getTamTinh(idKhachHang: number): Observable<number> {
  //   return this.http.get<number>(`${this.apiHoaDon}/tinh-tong-tien?idKhachHang=${idKhachHang}`);
  // }

  // Gọi API để lấy danh sách voucher hợp lệ theo ID khách hàng
  getVouchers(tongTien: number): Observable<any> {
    return this.http.get<any>(`${this.apiHoaDon}/vouchers/${tongTien}`);
  }

  // // Phương thức gọi API để tính tổng tiền thanh toán sau khi áp dụng voucher
  // getTongTienThanhToan(idKhachHang: number, idVoucher: number, shippingFee: number | null): Observable<number> {
  //   let params = new HttpParams()
  //     .set('idKhachHang', idKhachHang.toString())  // ✅ Đúng: Đảm bảo gửi trong URL
  //     .set('voucherId', idVoucher.toString())
  //     .set('shippingFee', (shippingFee ?? 0).toString());

  //   return this.http.post<number>(
  //     `${this.apiHoaDon}/tong-tien-thanh-toan`,
  //     {},
  //     { params }
  //   );
  // }

  //phương thức tính tiền ship
  tinhTienShip(
    pickProvince: string,
    pickDistrict: string,
    province: string,
    district: string,
    weight: number,
    deliverOption: string
  ): Observable<any> {
    const url = `/services/shipment/fee`;
    const body = {
      pick_province: pickProvince,
      pick_district: pickDistrict,
      province: province,
      district: district,
      weight: weight,
      deliver_option: deliverOption
    }
    return this.http.post<any>(url, body, {
      headers: this.getGhtkHeaders()
    });
  }


  createHoaDonFull(data: any): Observable<any> {
    const url = `${this.apiHoaDon}/create`;
    return this.http.post<any>(url, data); // Gửi JSON body
  }
  
}
