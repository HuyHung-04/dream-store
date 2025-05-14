import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  HoaDonService,
  HoaDonSearchRequest,
  HoaDonResponse,
  HoaDonChiTietResponse,
  HoaDonChiTietSearchRequest
} from './hoadon.service';

@Component({
  selector: 'app-hoadon',
  templateUrl: './hoadon.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
  styleUrls: ['./hoadon.component.css']
})
export class HoaDonComponent implements OnInit {
  // Yêu cầu tìm kiếm hóa đơn
  searchRequest: HoaDonSearchRequest = {
    maHoaDon: '',
    tenKhachHang: '',
    tenNhanVien: '',
    ngayTaoFrom: null,
    ngayTaoTo: null,
    sdtNguoiNhan: '',
    listTrangThai: null,
    pageSize: 6,
    page: 1
  };

  // Dữ liệu hóa đơn dạng phân trang (định nghĩa inline)
  hoaDons: {
    content: HoaDonResponse[];
    totalElements: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  } = {
    content: [],
    totalElements: 0,
    currentPage: 1,
    pageSize: 6,
    totalPages: 1
  };
  // selectedInvoiceDetail: HoaDonChiTietResponse[] | null = null;
  // Các biến cho popup hiển thị chi tiết hóa đơn
  selectedInvoiceDetail: HoaDonResponse | null = null;
  showDetailPopup: boolean = false;
  chiTietHoaDonData: any[] = [];
  hoaDonData: any = null; // sửa lại kiểu dữ liệu
  showCancelModal = false; // Trạng thái hiển thị modal
  ghiChu: string = '';     // Lưu lý do hủy
  showStatusDropdown: boolean = false;
  statusOptions = [
    { value: null, label: 'Tất cả' },
    { value: 6, label: 'Chưa thanh toán' },
    { value: 7, label: 'Đã thanh toán' },
    { value: 8, label: 'Đã huỷ' }
  ];
  showGiamToiDa: boolean = false;
  showGiamPhanTram: boolean = false;
  constructor(private hoaDonService: HoaDonService) {}

  ngOnInit(): void {
    this.loadHoaDons();
  }

  // Load danh sách hóa đơn từ backend
  loadHoaDons(): void {
    this.hoaDonService.getHoaDons(this.searchRequest,null).subscribe(
      (response: any) => {
        console.log("Dữ liệu từ API:", response);
        if (response && response.data) {
          const totalRecords = response.recordsTotal || 0;
          this.hoaDons = {
            totalPages: Math.ceil(totalRecords / this.searchRequest.pageSize),
            content: response.data,
            totalElements: totalRecords,
            currentPage: this.searchRequest.page,
            pageSize: this.searchRequest.pageSize
          };
        } else {
          console.error("Dữ liệu API không đúng định dạng:", response);
        }
      },
      error => {
        console.error("Lỗi khi tải hóa đơn:", error);
      }
    );
  }


  // Hàm trackBy cho *ngFor (giúp tối ưu hiển thị danh sách)
  trackById(index: number, invoice: HoaDonResponse): number {
    return invoice.id;
  }

  // Hàm tìm kiếm hóa đơn: reset trang hiện tại về 1 và load lại dữ liệu
  search(): void {
    this.searchRequest.page = 1;
    this.loadHoaDons();
  }

  // Hàm reset bộ lọc tìm kiếm
  resetFilters(): void {
    this.searchRequest = {
      maHoaDon: '',
      tenKhachHang: '',
      tenNhanVien: '',
      ngayTaoFrom: null,
      ngayTaoTo: null,
      sdtNguoiNhan: '',
      listTrangThai: null,
      pageSize: 6,
      page: 1
    };
    this.loadHoaDons();
  }

 // Tính tổng số trang dựa trên `totalElements` và `pageSize`
calculateTotalPages(): void {
  this.hoaDons.totalPages = Math.ceil(this.hoaDons.totalElements / this.hoaDons.pageSize);
}

// Chuyển trang: Prev
prevPage(): void {
  if (this.searchRequest.page > 1) {
    this.searchRequest.page--;
    this.loadHoaDons();
  }
}

// Chuyển trang: Next
nextPage(): void {
  if (this.searchRequest.page < this.hoaDons.totalPages) {
    this.searchRequest.page++;
    this.loadHoaDons();
  }
}

selectHoaDonChiTiet(invoice: HoaDonResponse): void {
  const idHoaDon = invoice.id;
  console.log(" Mã hóa đơn:", idHoaDon);
  // Gọi API lấy chi tiết sản phẩm trong hóa đơn
  this.hoaDonService.getChiTietHoaDon(idHoaDon).subscribe({
    next: (res) => {
      this.chiTietHoaDonData = res;
      console.log("Chi tiết sản phẩm:", res);

    },
    error: (err) => {
      console.error("Lỗi khi lấy chi tiết hóa đơn:", err);
    }
  });

  // Gọi API lấy lại thông tin hóa đơn mới nhất từ server
  this.hoaDonService.getHoaDonByMa(idHoaDon).subscribe({
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
    this.selectedInvoiceDetail = null;
  }

  // Danh sách các trạng thái có thể chuyển (tuần tự)
trangThaiChuyenTiep: number[] = [1, 2, 3, 4];

getTrangThaiText(trangThai: number): string {
  switch (trangThai) {
    case 6: return 'Chưa thanh toán';
    case 7: return 'Đã thanh toán'
    case 8: return 'Huỷ đơn'
    default: return 'Không xác định';
  }
}

isTrangThaiCoTheChuyen(trangThai: number): boolean {
  return this.trangThaiChuyenTiep.includes(trangThai);
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





// Phương thức xử lý nút "Quay Về Trang Chủ"
  goHome(): void {
    this.showDetailPopup=false
  }

  getTenPhuongThucThanhToan(id: number): string {
    switch (id) {
      case 1: return 'Thanh toán khi nhận hàng';
      case 2: return 'Tiền mặt';
      case 3: return 'Chuyển khoản';
      default: return 'Không xác định';
    }
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  selectStatus(status: number | null): void {
    this.searchRequest.listTrangThai = status;
    this.showStatusDropdown = false;
    this.search();
  }

  isStatusSelected(status: number | null): boolean {
    return this.searchRequest.listTrangThai === status;
  }

  getSelectedStatusText(): string {
    if (this.searchRequest.listTrangThai === null) {
      return 'Chọn trạng thái';
    }
    const selectedStatus = this.statusOptions.find(opt => opt.value === this.searchRequest.listTrangThai);
    return selectedStatus ? selectedStatus.label : 'Chọn trạng thái';
  }

}
