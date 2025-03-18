import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class HoadonService {

  private apiUrl = 'http://localhost:8080/api/dia-chi-khach-hang'; // Chỉ trỏ đến đường dẫn cơ bản
  private apiUrlTinhThanh = 'https://online-gateway.ghn.vn/shiip/public-api/master-data'; // API tỉnh thành
  private apiHoaDon ='http://localhost:8080/api/hoa-don-online';
  private apiship = 'http://localhost:8080/api/shipping';
  private ghnToken = '83fc5ffa-009a-11f0-8431-a60a80081d29';
  private phuongThuc = 'http://localhost:8080/api/phuong-thuc-thanh-toan/payment-methods';
  private shopId = 5686289;
  private hoaDonSubject = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient) {  
   }

   private getGhnHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Token': this.ghnToken,
     
    });
  }
  private getheader2(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Token': this.ghnToken,
     'shopId':this.shopId
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
   getPaymentMethods(): Observable<any> {
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
// Gọi API để lấy danh sách voucher hợp lệ theo ID khách hàng
getAvailableVouchers(idKhachHang: number): Observable<any> {
  return this.http.get<any>(`${this.apiHoaDon}/vouchers/${idKhachHang}`);
}
 
 // Phương thức gọi API để tính tổng tiền thanh toán sau khi áp dụng voucher
 calculateTotalWithVoucher(idKhachHang: number, idVoucher: number, shippingFee: number | null): Observable<number> {
  let params = new HttpParams()
    .set('idKhachHang', idKhachHang.toString())  // ✅ Đúng: Đảm bảo gửi trong URL
    .set('voucherId', idVoucher.toString())
    .set('shippingFee', (shippingFee ?? 0).toString());

  return this.http.post<number>(
    `${this.apiHoaDon}/tong-tien-thanh-toan`, 
    {},  // ✅ Body rỗng vì tất cả tham số đã ở trong `params`
    { params }
  );
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

  // Phương thức gọi API lấy thông tin gói dịch vụ GHN
  getAvailableServices(fromDistrictId: number, toDistrictId: number, shopId: number): Observable<any> {
    const url = `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services`;
    const params = {
      from_district: fromDistrictId.toString(),
      to_district: toDistrictId.toString(),
      shop_id: shopId.toString() 
    };

    return this.http.get<any>(url, {
      headers: this.getGhnHeaders(),
      params: params
    });
  }

  // Phương thức gọi API để tính cước phí vận chuyển GHN
  calculateShippingFee(
    serviceId: number,       // ID gói dịch vụ
    insuranceValue: number,  // Giá trị bảo hiểm
    coupon: string | null,   // Mã giảm giá
    fromDistrictId: number,  // Quận/Huyện xuất phát
    toDistrictId: number,    // Quận/Huyện đích đến
    toWardCode: string,      // Mã phường xã đích đến
    height: number,          // Chiều cao gói hàng (cm)
    length: number,          // Chiều dài gói hàng (cm)
    weight: number,          // Khối lượng gói hàng (gram)
    width: number,           // Chiều rộng gói hàng (cm)
   
  ): Observable<any> {
    const url = `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`;

    const body = {
      service_id: serviceId,
      insurance_value: insuranceValue,
      coupon: coupon,
      from_district_id: fromDistrictId,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      height: height,
      length: length,
      weight: weight,
      width: width,
     
    };

    return this.http.post<any>(url, body, {
      headers: this.getheader2()
    });
  }

   // Phương thức gọi API để tạo hóa đơn và chi tiết hóa đơn
   createHoaDon(
    idKhachHang: number,
    voucherId: number,
    tongTienTruocGiam: number,
    paymentMethodId: number,
    TongTienSauGiam: number,
    sdtNguoiNhan: String,
    tenNguoiNhan: String,
    diaChi: String,
    shippingFee: number
  ): Observable<any> {
    const url = `${this.apiHoaDon}/create`; // Đảm bảo đường dẫn đúng
    
    // Tạo HttpParams để gửi các tham số dưới dạng query string
    let params = new HttpParams()
      .set('idKhachHang', idKhachHang.toString()) // ID khách hàng
      .set('voucherId', voucherId.toString()) // ID của voucher
      .set('tongTienTruocGiam', tongTienTruocGiam.toString()) // Tổng tiền trước giảm giá
      .set('paymentMethodId', paymentMethodId.toString()) // ID phương thức thanh toán
      .set('TongTienSauGiam', TongTienSauGiam.toString()) // Tổng tiền sau khi giảm giá
      .set('sdtNguoiNhan', sdtNguoiNhan.toString()) 
      .set('tenNguoiNhan', tenNguoiNhan.toString()) 
      .set('diaChi', diaChi.toString()) // Tổng tiền sau khi giảm giá
      .set('shippingFee', shippingFee.toString());
    // Gửi yêu cầu POST, dữ liệu rỗng vì tất cả tham số đã có trong `params`
    return this.http.post<any>(`${this.apiHoaDon}/create`, {}, { params }).pipe(
      switchMap((response) => this.setHoaDonData(response))
    );
  }

  setHoaDonData(data: any): Observable<any> {
    this.hoaDonSubject.next(data);
    return this.hoaDonSubject.asObservable();
  }
  
  getHoaDonData(): Observable<any> {
    return this.hoaDonSubject.asObservable();
  }
}
