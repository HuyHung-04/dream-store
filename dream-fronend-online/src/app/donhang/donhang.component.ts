import { Component } from '@angular/core';
import { HoadonService } from '../hoadon/hoadon.service';
import {DonhangService } from '../donhang/donhang.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-donhang',
  imports: [CommonModule],
  templateUrl: './donhang.component.html',
  styleUrl: './donhang.component.css'
})
export class DonhangComponent {
  hoaDonData: any;
  chiTietHoaDonData: any;
  isModalOpen: boolean = true; // Mở modal khi trang tải

  constructor(private hoadonService: HoadonService,private donhangService: DonhangService) {}

  ngOnInit(): void {
    this.hoadonService.getHoaDonData().subscribe((data) => {
      if (data) {
        this.hoaDonData = data;
        console.log('Dữ liệu hóa đơn nhận được:', this.hoaDonData);
        // Kiểm tra mã hóa đơn có tồn tại trong hoaDonData hay không
        if (this.hoaDonData && this.hoaDonData.ma) {
          const maHoaDon = this.hoaDonData.ma;  // Lấy mã hóa đơn từ hoaDonData
          this.getChiTietHoaDon(maHoaDon);  // Gọi API với mã hóa đơn
        }
      }
    });
  }

  // Phương thức gọi API lấy chi tiết hóa đơn
  getChiTietHoaDon(maHoaDon: string): void {
    this.donhangService.getChiTietHoaDon(maHoaDon).subscribe(
      (data) => {
        this.chiTietHoaDonData = data;
        console.log('Dữ liệu chi tiết hóa đơn nhận được:', this.chiTietHoaDonData);
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      }
    );
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
    // Đóng modal sau khi chọn lịch sử hóa đơn
    this.isModalOpen = false;
  }

  // Phương thức xử lý nút "Quay Về Trang Chủ"
  goHome(): void {
    console.log('Quay về trang chủ...');
    // Đóng modal và quay về trang chủ
    this.isModalOpen = false;
    window.location.href = '/home';  // Giả sử trang chủ là '/home'
  }
}
