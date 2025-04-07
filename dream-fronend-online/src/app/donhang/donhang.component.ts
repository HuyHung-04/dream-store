import { Component } from '@angular/core';
import { DonhangService } from '../donhang/donhang.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-donhang',
  imports: [CommonModule,FormsModule],
  templateUrl: './donhang.component.html',
  styleUrl: './donhang.component.css'
})
export class DonhangComponent {
  hoaDonData: any;
  chiTietHoaDonData: any;
  isModalOpen: boolean = true; // Mở modal khi trang tải
  idHoaDon: number =0;
  showCancelModal = false; // Trạng thái hiển thị modal
  ghiChu: string = '';     // Lưu lý do hủy
  showGiamToiDa: boolean = false;
  showGiamPhanTram: boolean = false;
  constructor(private donhangService: DonhangService, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => {
      this.idHoaDon = +params.get('id')!;
      if (this.idHoaDon) {
        this.getHoaDonDetails();
        this.getChiTietHoaDon(this.idHoaDon);
      }
    });
  }



  // Phương thức gọi API lấy chi tiết hóa đơn
  getChiTietHoaDon(idHoaDon: number): void {
    this.donhangService.getChiTietHoaDon(idHoaDon).subscribe(
      (data) => {
        this.chiTietHoaDonData = data;
        console.log('Dữ liệu chi tiết hóa đơn nhận được:', this.chiTietHoaDonData);
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      }
    );
  }


  getHoaDonDetails(): void {
    if (this.idHoaDon) {
      this.donhangService.getHoaDonByMa(this.idHoaDon).subscribe(
        (data) => {
          this.hoaDonData = data;
          this.tinhHienThiVoucher()
          console.log("hóa đơn", data)
        },
        (error) => {
          console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
        }
      );
    }
  }

  // Hàm kiểm tra trạng thái và thông báo lỗi nếu không thể hủy đơn
checkTrangThaiHuy(): boolean {
  if (this.hoaDonData.trangThai === 2) {
    alert('Đơn hàng đã xác nhận, không thể hủy đơn.');
    return false;
  }

  if (this.hoaDonData.trangThai === 3) {
    alert('Đơn hàng đang giao, không thể hủy đơn.');
    return false;
  }

  if (this.hoaDonData.trangThai === 4) {
    alert('Đơn hàng đã giao, không thể hủy đơn.');
    return false;
  }

  return true; // Nếu trạng thái hợp lệ, trả về true
}


  // Phương thức hủy hóa đơn
  cancelHoaDon(): void {
  // Kiểm tra trạng thái hóa đơn trước khi thực hiện hủy
  if (!this.checkTrangThaiHuy()) {
    this.showCancelModal = false;
    return; // Nếu không thể hủy, đóng modal và dừng lại
  }
  
      if (!this.ghiChu.trim()) {
        alert('Vui lòng nhập lý do hủy hóa đơn.');
        return;
      }

      const xacNhanHuy = window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này?");
      if (!xacNhanHuy) {
        return; // Người dùng từ chối hủy
      }
    if (this.idHoaDon&&this.ghiChu) {
      this.donhangService.huyHoaDon(this.idHoaDon,this.ghiChu).subscribe(
        (response) => {
          console.log('Hóa đơn đã bị hủy:', response);
          this.hoaDonData.trangThai = 5;
          this.hoaDonData.ghiChu = this.ghiChu;
          this.showCancelModal = false;
        },
        (error) => {
          console.error('Lỗi khi hủy hóa đơn:', error);
        }
      );
    }
  }

  openCancelModal(): void {
    if (!this.checkTrangThaiHuy()) {
      return; // Nếu không thể hủy, không mở modal
    }
    this.showCancelModal = true;
  }
  
  closeCancelModal(): void {
    this.showCancelModal = false;
    this.ghiChu = '';
  }

  // Phương thức xử lý nút "Xem Chi Tiết"
  viewInvoiceDetails(): void {
    console.log('Đang xem chi tiết hóa đơn...');
    // Đóng modal sau khi chọn xem chi tiết
    this.isModalOpen = false;
  }

  // Phương thức xử lý nút "Xem Lịch Sử Hóa Đơn"
  viewInvoiceHistory(): void {
    console.log('Đang xem lịch sử hóa đơn...');
    this.isModalOpen = false;
  }

  // Phương thức xử lý nút "Quay Về Trang Chủ"
  goHome(): void {
    console.log('Quay về trang chủ...');
    this.isModalOpen = false;
    window.location.href = '/banhang';  // Giả sử trang chủ là '/home'
  }

  tinhHienThiVoucher(): void {
    const voucher = this.hoaDonData?.voucher;
  
    this.showGiamPhanTram = false;
    this.showGiamToiDa = false;
  
    // Không có voucher hoặc giảm tiền => ẩn cả 2
    if (!voucher || voucher.hinhThucGiam === true) {
      return;
    }
  
    // Giảm phần trăm
    const tongTien = this.hoaDonData.tongTienTruocVoucher || 0;
    const giamPhanTram = voucher.giaTriGiam || 0;
    const giamTien = tongTien * giamPhanTram / 100;
    const giamToiDa = voucher.giamToiDa;
  
    if (giamToiDa && giamTien > giamToiDa) {
      this.showGiamToiDa = true;
      this.showGiamPhanTram = false;
    } else {
      this.showGiamPhanTram = true;
      this.showGiamToiDa = false;
    }
  }
  
}
