import { Component } from '@angular/core';
import { DonhangService } from '../donhang/donhang.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChitietlichsuService } from '../chitietlichsu/chitietlichsu.service';
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
  maHoaDon: string | null = null;
  showCancelModal = false; // Trạng thái hiển thị modal
  ghiChu: string = '';     // Lưu lý do hủy
  constructor(private donhangService: DonhangService, private activatedRoute: ActivatedRoute, private chitietlichsuService: ChitietlichsuService) { }

  ngOnInit(): void {

    this.activatedRoute.paramMap.subscribe(params => {
      this.maHoaDon = params.get('id');
      if (this.maHoaDon) {
        this.getHoaDonDetails();
        this.getChiTietHoaDon(this.maHoaDon);
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


  getHoaDonDetails(): void {
    if (this.maHoaDon) {
      this.chitietlichsuService.getHoaDonByMa(this.maHoaDon).subscribe(
        (data) => {
          this.hoaDonData = data;
          console.log("hóa đơn", data)
        },
        (error) => {
          console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
        }
      );
    }
  }


  // Phương thức hủy hóa đơn
  cancelHoaDon(): void {
    if (this.hoaDonData.trangThai ==2) {
    alert('Đơn hàng đã xác nhận, không thể hủy đơn.') 
      return;
    }

    if (this.hoaDonData.trangThai ==3) {
      alert('Đơn hàng đang giao, không thể hủy đơn.') 
        return;
      }

      if (this.hoaDonData.trangThai ==4) {
        alert('Đơn hàng đã giao, không thể hủy đơn.') 
          return;
        }
  
      if (!this.ghiChu.trim()) {
        alert('Vui lòng nhập lý do hủy hóa đơn.');
        return;
      }

      const xacNhanHuy = window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này?");
      if (!xacNhanHuy) {
        return; // Người dùng từ chối hủy
      }
    if (this.maHoaDon&&this.ghiChu) {
      this.donhangService.huyHoaDon(this.maHoaDon,this.ghiChu).subscribe(
        (response) => {
          console.log('Hóa đơn đã bị hủy:', response);
          this.hoaDonData.trangThai = 5;
          this.showCancelModal = false;
        },
        (error) => {
          console.error('Lỗi khi hủy hóa đơn:', error);
        }
      );
    }
  }

  openCancelModal(): void {
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
}
