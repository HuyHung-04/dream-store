import { Component,OnInit  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChitietlichsuService } from './chitietlichsu.service';
import { CommonModule } from '@angular/common';
import { DonhangService } from '../donhang/donhang.service'; 
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-chitietlichsu',
  imports: [CommonModule,FormsModule],
  templateUrl: './chitietlichsu.component.html',
  styleUrl: './chitietlichsu.component.css'
})
export class ChitietlichsuComponent {
  maHoaDon: string = ''; 
  chiTietHoaDonData: any;
  isLoading: boolean = false;
  errorMessage: string = '';  
  hoaDonData: any;
  showCancelModal = false; // Trạng thái hiển thị modal
  ghiChu: string = '';     // Lưu lý do hủy
  showGiamToiDa: boolean = false;
  showGiamPhanTram: boolean = false;
  constructor(private route: ActivatedRoute, private chitietlichsuService: ChitietlichsuService,private donhangService: DonhangService ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.maHoaDon = params.get('id')!;
      if (this.maHoaDon) {
        this.getHoaDonDetails(); 
        this.getChiTietHoaDon(this.maHoaDon); 
      }
    });
    
  }


  getHoaDonDetails(): void {
    if (this.maHoaDon) {
      this.isLoading = true; 
      console.log('Fetching details for Ma Hoa Don:', this.maHoaDon);

      this.chitietlichsuService.getHoaDonByMa(this.maHoaDon).subscribe(
        (data) => {
          this.hoaDonData = data;
          // console.log('Dữ liệu chi tiết hóa đơn nhận được:', this.hoaDonData);
          this.isLoading = false;  

        },
        (error) => {
          console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
          this.errorMessage = 'Lỗi khi lấy chi tiết hóa đơn.';
          this.isLoading = false; 
        }
      );
    }
  }

  // Phương thức gọi API lấy chi tiết hóa đơn
  getChiTietHoaDon(maHoaDon: string): void {
  
    this.donhangService.getChiTietHoaDon(this.maHoaDon).subscribe(
      (data) => {
        this.chiTietHoaDonData = data;
        console.log('Dữ liệu chi tiết hóa đơn nhận được:', this.chiTietHoaDonData);
      },
      (error) => {
        console.error('Lỗi khi lấy chi tiết hóa đơn:', error);
      }
    );
    
  }

  // Phương thức xử lý nút "Quay Về Trang Chủ"
  goHome(): void {
    console.log('Quay về trang chủ...');
    window.location.href = '/banhang';  // Giả sử trang chủ là '/home'
  }

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
    if (!this.checkTrangThaiHuy()) {
      return; // Nếu không thể hủy, không mở modal
    }
    
    this.showCancelModal = true;
  }
  
  closeCancelModal(): void {
    this.showCancelModal = false;
    this.ghiChu = '';
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
