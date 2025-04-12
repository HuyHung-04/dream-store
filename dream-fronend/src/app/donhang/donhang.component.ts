import { Component } from '@angular/core';
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
  hoaDons: any[] = [];

  errorMessage: string = '';
  page: number = 0;
  size: number = 5;
  totalPages: number = 0;
  chiTietHoaDonData: any[] = [];
  hoaDonData: any = null;
  showDetailPopup: boolean = false;
  showCancelModal = false;
  ghiChu: string = '';
  showGiamToiDa: boolean = false;
  showGiamPhanTram: boolean = false;
  fullHoaDonList: any[] = [];
  tenNguoiNhan: string = '';
  sdtNguoiNhan: string = '';
  maHoaDon: string = '';
  chonTrangThai: number = 0;
  trangThai = [
    { value: 0, label: 'Tất cả' },
    { value: 1, label: 'Chờ xác nhận' },
    { value: 2, label: 'Đã xác nhận' },
    { value: 3, label: 'Đang giao hàng' },
    { value: 4, label: 'Giao hàng thành công' },
    { value: 5, label: 'Đơn hàng đã hủy' }
  ];
  constructor(private donHangService: DonhangService) { }

  loading: boolean = false;

  ngOnInit(): void {
    this.loadHoaDons();
  }

  //phương thức lọc trạng thái đơn hàng
  locTrangThai(trangThai: number): void {
    this.chonTrangThai = trangThai;
    this.page = 0;
    this.loadHoaDons();
  }


  // Phương thức để tải hóa đơn từ API với phân trang và lọc trạng thái
  loadHoaDons(): void {
    const status = this.chonTrangThai === 0 ? 0 : this.chonTrangThai;
    this.donHangService.getHoaDonsByTrangThaiAndNguoiNhanAndMa(status, this.tenNguoiNhan, this.sdtNguoiNhan, this.maHoaDon).subscribe(
      (data) => {
        this.fullHoaDonList = data;
        this.totalPages = Math.ceil(data.length / this.size);
        this.setPage(this.page);
      },
      (error) => {
        this.errorMessage = 'Lỗi khi lấy dữ liệu hóa đơn!';
        console.error('Lỗi lấy hóa đơn:', error);
      }
    );
  }

  //phương thức phân trang
  setPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.page = page;
    const start = this.page * this.size;
    const end = start + this.size;
    this.hoaDons = this.fullHoaDonList.slice(start, end);
  }



  /**
   * Thay đổi trang và tải lại dữ liệu
   * page - Trang mới
   */
  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadHoaDons();
    }
  }

  /**
   * Lấy nhãn trạng thái từ giá trị số
   *  value - Giá trị trạng thái
   *  Nhãn trạng thái tương ứng
   */
  getTrangThaiLabel(value: number): string {
    const status = this.trangThai.find(trangThai => trangThai.value === value);
    return status ? status.label : 'Không xác định';
  }


  // Phương thức để cập nhật trạng thái hóa đơn (tăng 1 trạng thái)
  updateTrangThai(id: number, trangThai: number): void {
    if (trangThai === 4) {
      alert("Đơn hàng đã giao thành công và không thể tiếp tục cập nhật.");
      return;
    }

    const nextTrangThai = trangThai + 1;
    const nextTrangThaiLabel = this.getTrangThaiLabel(nextTrangThai);
    const confirmUpdate = window.confirm(
      `Bạn có chắc chắn muốn cập nhật đến trạng thái "${nextTrangThaiLabel}" không?`
    );

    if (confirmUpdate) {
      this.loading = true;
      this.donHangService.capNhatTrangThai(id).subscribe(
        (response) => {
          alert("cập nhật trạng thái thành công")
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
  checkStatus(trangThai: number): boolean {
    const validTrangThai = [1, 2, 3, 4];
    return validTrangThai.indexOf(trangThai) === -1;
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

  //phương thức load hóa đơn và hóa đơn chi tiết khi xem chi tiết đơn hàng
  chonDonHang(idHoaDon: number): void {
    this.donHangService.getHoaDonChiTiet(idHoaDon).subscribe({
      next: (res) => {
        this.chiTietHoaDonData = res;
        console.log("Chi tiết sản phẩm:", res);
      },
      error: (err) => {
        console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
      }
    });
    this.donHangService.getHoaDon(idHoaDon).subscribe({
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
  cancelHoaDon(idHoaDon: number): void {

    if (!this.ghiChu.trim()) {
      alert('Vui lòng nhập lý do hủy hóa đơn.');
      return;
    }

    const xacNhanHuy = window.confirm("Bạn có chắc chắn muốn hủy hóa đơn này?");
    if (!xacNhanHuy) return;

    this.donHangService.huyHoaDon(idHoaDon, this.ghiChu).subscribe(
      (response) => {
        console.log('Hóa đơn đã bị hủy:', response);
        this.hoaDonData.trangThai = 5;
        this.hoaDonData.ghiChu = this.ghiChu;
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

  //phương thức tính số tiền giảm cho voucher
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
