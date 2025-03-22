import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HoaDonService, HoaDonSearchRequest, HoaDonResponse } from './hoadon.service';

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
    listTrangThai: null, // Nếu null => không lọc theo trạng thái
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

  // Các biến cho popup hiển thị chi tiết hóa đơn
  selectedInvoiceDetail: HoaDonResponse | null = null;
  showDetailPopup: boolean = false;

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

  // Hàm chọn hóa đơn để hiển thị chi tiết (popup)
  selectHoaDonChiTiet(invoice: HoaDonResponse): void {
    this.selectedInvoiceDetail = invoice;
    this.showDetailPopup = true;
    console.log("Hóa đơn được chọn:", invoice);
  }

  // Hàm đóng popup chi tiết hóa đơn
  closePopup(): void {
    this.showDetailPopup = false;
    this.selectedInvoiceDetail = null;
  }
}
