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
  constructor(private hoaDonService: HoaDonService) {}

  ngOnInit(): void {
    this.loadHoaDons();
  }

  // Load danh sách hóa đơn từ backend
  loadHoaDons(): void {
    this.hoaDonService.getHoaDons(this.searchRequest).subscribe(
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

doiTrangThai(invoice: HoaDonResponse): void {
  const id = invoice.id;
  const currentTrangThai = invoice.trangThai;
  const index = this.trangThaiChuyenTiep.indexOf(currentTrangThai);
  if (index >= 0 && index < this.trangThaiChuyenTiep.length - 1) {
    const newTrangThai = this.trangThaiChuyenTiep[index + 1];
    this.hoaDonService.capNhatTrangThai(id).subscribe(
      (response) => {
        invoice.trangThai = response.trangThai; // cập nhật trực tiếp trong bảng
        console.log(`✅ Đã cập nhật trạng thái hóa đơn ${id} sang: ${this.getTrangThaiText(newTrangThai)}`);
      },
      (err) => {
        console.error(" Lỗi cập nhật trạng thái:", err);
      }
    );
  }
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
