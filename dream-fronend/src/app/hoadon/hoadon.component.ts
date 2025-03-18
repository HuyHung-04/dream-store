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
    listTrangThai: null,
    pageSize: 10,
    page: 1
  };

  // Dữ liệu hóa đơn dạng phân trang (định nghĩa inline)
  hoaDons: {
    content: HoaDonResponse[];
    totalElements: number;
    currentPage: number;
    pageSize: number;
    totalPages?: number;
  } = {
    content: [],
    totalElements: 0,
    currentPage: 1,
    pageSize: 10
  };

  constructor(private hoaDonService: HoaDonService) {}

  ngOnInit(): void {
    this.loadHoaDons();
  }

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
        }
        else if (response && response.content) {
          // Nếu API trả về định dạng cũ với "content"
          this.hoaDons = response;
        }
        else if (Array.isArray(response)) {
          this.hoaDons = {
            totalPages: Math.ceil(response.length / this.searchRequest.pageSize),
            content: response,
            totalElements: response.length,
            currentPage: this.searchRequest.page,
            pageSize: this.searchRequest.pageSize
          };
        }
        else {
          console.error("Dữ liệu API không đúng định dạng:", response);
        }
      },
      error => {
        console.error("Lỗi khi tải hóa đơn:", error);
      }
    );
  }

  // Hàm trackBy cho *ngFor
  trackById(index: number, invoice: HoaDonResponse): number {
    return invoice.id;
  }

  // Hàm tìm kiếm hóa đơn
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
      pageSize: 10,
      page: 1
    };
    this.loadHoaDons();
  }

  // Hàm chuyển trang về trang trước
  prevPage(): void {
    if (this.searchRequest.page > 1) {
      this.searchRequest.page--;
      this.loadHoaDons();
    }
  }

  // Hàm chuyển trang về trang tiếp theo
  nextPage(): void {
    if (this.searchRequest.page < (this.hoaDons.totalPages || 1)) {
      this.searchRequest.page++;
      this.loadHoaDons();
    }
  }

  // Hàm chọn hóa đơn để xem chi tiết
  selectHoaDonChiTiet(invoice: HoaDonResponse): void {
    console.log("Hóa đơn được chọn:", invoice);
    // Triển khai logic hiển thị chi tiết (ví dụ mở modal) nếu cần
  }
}
