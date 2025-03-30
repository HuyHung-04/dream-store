import { Component } from '@angular/core';
import { HoaDonService } from '../hoadon/hoadon.service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DonhangService } from './donhang.service';
@Component({
  selector: 'app-donhang',
  imports: [CommonModule, FormsModule],
  templateUrl: './donhang.component.html',
  styleUrl: './donhang.component.css'
})
export class DonhangComponent {
  hoaDons: any[] = [];  // Biến lưu danh sách hóa đơn

  errorMessage: string = '';  // Lưu thông báo lỗi
  page: number = 0;  // Số trang mặc định
  size: number = 6;  // Số lượng bản ghi mỗi trang
  totalPages: number = 0;  // Tổng số trang (cần nhận từ API)
  chiTietHoaDonData: any[] = [];
  hoaDonData: any = null;
  showDetailPopup: boolean = false;
  showCancelModal = false; // Trạng thái hiển thị modal
  ghiChu: string = '';     // Lưu lý do hủy
  showGiamToiDa: boolean = false;
  showGiamPhanTram: boolean = false;
   // Khai báo tên người nhận và số điện thoại người nhận để lọc
   tenNguoiNhan: string = '';  // Biến lọc tên người nhận
   sdtNguoiNhan: string = '';  // Biến lọc số điện thoại người nhận
   maHoaDon: string = '';  // Biến lọc tên người nhận
  selectedStatus: number = 0;  // Trạng thái được chọn mặc định là "Tất cả"
  statuses = [
    { value: 0, label: 'Tất cả' },
    { value: 1, label: 'Chờ xác nhận' },
    { value: 2, label: 'Đã xác nhận' },
    { value: 3, label: 'Đang giao hàng' },
    { value: 4, label: 'Giao hàng thành công' },
    { value: 5, label: 'Đơn hàng đã hủy' }
  ];
  constructor(private donHangService: DonhangService) { }

  loading: boolean = false; // Biến để kiểm tra trạng thái tải dữ liệu

  ngOnInit(): void {
    this.loadHoaDons();
  }

  filterByStatus(status: number): void {
    this.selectedStatus = status;
    this.page = 0;
    this.loadHoaDons();  // Tải lại danh sách hóa đơn khi thay đổi trạng thái
  }


// Phương thức để tải hóa đơn từ API với phân trang và lọc trạng thái
loadHoaDons(): void {
  const status = this.selectedStatus === 0 ? 0 : this.selectedStatus;
  this.donHangService.getHoaDonsByTrangThaiAndNguoiNhanAndMa(status, this.tenNguoiNhan, this.sdtNguoiNhan, this.maHoaDon, this.page, this.size).subscribe(
    (data) => {
      this.hoaDons = data.content;  // Dữ liệu trên trang hiện tại
      this.totalPages = data.totalPages;  // Tổng số trang
      console.log(data);
    },
    (error) => {
      this.errorMessage = 'Lỗi khi lấy dữ liệu hóa đơn!';
      console.error('Lỗi lấy hóa đơn:', error);
    }
  );
}


  

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadHoaDons();
    }
  }
  
  


  // Phương thức để cập nhật trạng thái hóa đơn (tăng 1 trạng thái)
  updateStatus(id: number, trangThai: number): void {
    // Kiểm tra nếu trạng thái là "Giao hàng thành công" (trạng thái 4)
    if (trangThai === 4) {
      alert("Đơn hàng đã giao thành công và không thể tiếp tục cập nhật.");
      return; // Không thực hiện cập nhật nếu trạng thái là Giao hàng thành công
    }
    // Confirm trước khi cập nhật trạng thái
    const confirmUpdate = window.confirm('Bạn có chắc chắn muốn cập nhật trạng thái hóa đơn này?');
    console.log(id)
    if (confirmUpdate) {
      this.loading = true;
      this.donHangService.capNhatTrangThai(id).subscribe(
        (response) => {
          // Sau khi cập nhật thành công, tải lại dữ liệu
          this.loadHoaDons();
        },
        (error) => {
          this.errorMessage = 'Lỗi khi cập nhật trạng thái hóa đơn!';
          console.error('Lỗi cập nhật trạng thái:', error);
          this.loading = false;
        }
      );
    }
  }

  // Kiểm tra xem trạng thái hiện tại có phải là trạng thái cuối cùng không
  isLastStatus(trangThai: number): boolean {
    const validStatuses = [1, 2, 3, 4];  // Mảng trạng thái hợp lệ, không bao gồm Hủy đơn (5)
    return validStatuses.indexOf(trangThai) === -1;
  }
  // Lấy nhãn nút tùy thuộc vào trạng thái hiện tại
  getButtonLabel(trangThai: number): string {
    switch (trangThai) {
      case 1: return 'Chờ xác nhận';
      case 2: return 'Đã xác nhận';
      case 3: return 'Đang giao hàng';
      case 4: return 'Giao hàng thành công';
      case 5: return 'Hủy đơn';
      default: return 'Không xác định';
    }
  }

  selectHoaDonChiTiet(maHoaDon: string): void {
    console.log("ma", maHoaDon)
    this.donHangService.getChiTietHoaDon(maHoaDon).subscribe({
      next: (res) => {
        this.chiTietHoaDonData = res;
        console.log("Chi tiết sản phẩm:", res);
      },
      error: (err) => {
        console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
      }
    });

    // Gọi API lấy lại thông tin hóa đơn mới nhất từ server
    this.donHangService.getHoaDonByMa(maHoaDon).subscribe({
      next: (res) => {
        this.hoaDonData = res;
        this.showDetailPopup = true;
        this.tinhHienThiVoucher();
        console.log("ℹHóa đơn chi tiết:", res);
      },
      error: (err) => {
        console.error("Lỗi khi lấy hóa đơn theo mã:", err);
      }
    });

  }
  // Hàm đóng popup chi tiết hóa đơn
  closePopup(): void {
    this.showDetailPopup = false;

  }

  // Phương thức hủy hóa đơn
  cancelHoaDon(maHoaDon: string): void {

    if (!this.ghiChu.trim()) {
      alert('Vui lòng nhập lý do hủy hóa đơn.');
      return;
    }

    const xacNhanHuy = window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này?");
    if (!xacNhanHuy) return;

    this.donHangService.huyHoaDon(maHoaDon, this.ghiChu).subscribe(
      (response) => {
        console.log('Hóa đơn đã bị hủy:', response);
        this.hoaDonData.trangThai = 5; // cập nhật UI nếu cần
        this.showCancelModal = false;
        this.loadHoaDons();
      },
      (error) => {
        console.error('Lỗi khi hủy hóa đơn:', error);
      }
    );
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.ghiChu = '';
  }
  // Phương thức xử lý nút "Quay Về Trang Chủ"
  goHome(): void {
    this.showDetailPopup = false
  }

  openCancelModal(): void {
    this.showCancelModal = true;
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
