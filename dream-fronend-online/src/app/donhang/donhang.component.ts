import { Component } from '@angular/core';
import {DonhangService } from '../donhang/donhang.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChitietlichsuService } from '../chitietlichsu/chitietlichsu.service'; 
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
  maHoaDon: string | null = null;  
  constructor(private donhangService: DonhangService,  private activatedRoute: ActivatedRoute, private chitietlichsuService: ChitietlichsuService) {}

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
    console.log('Fetching details for Ma Hoa Don:', this.maHoaDon);
    this.chitietlichsuService.getHoaDonByMa(this.maHoaDon).subscribe(
      (data) => {
        this.hoaDonData = data;
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      }
    );
  }
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
    window.location.href = '/home';  // Giả sử trang chủ là '/home'
  }
}
