import {Component, NgModule, OnInit} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HoaDonService, HoaDonSearchRequest, HoaDonPageResponse, HoaDonCRUDRequest, HoaDonResponse } from './hoadon.service';
import {CommonModule, NgForOf, NgIf} from '@angular/common';

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule
  ],
  providers: []
})
export class AppModule { }
@Component({
  selector: 'app-hoadon',
  templateUrl: './hoadon.component.html',
  imports: [
    FormsModule,
    CommonModule
  ],
  styleUrls: ['./hoadon.component.css']
})
export class HoaDonComponent implements OnInit {
  searchRequest = { page: 1, maHoaDon: '', tenKhachHang: '', ngayTaoFrom: null, ngayTaoTo: null, listTrangThai: [] };
  hoaDons: HoaDonPageResponse = { totalPages: 1, content: [], totalElements: 0, currentPage: 1, pageSize: 10 };
  selectedHoaDon: HoaDonResponse | null = null;
  formRequest: HoaDonCRUDRequest = {};

  // đổi trạng thái duyệt đơn online
  trangThai: number = 0;
  trangThaiText: string[] = ["Chờ xác nhận", "Đã xác nhận", "Đang giao hàng", "Đã giao hàng"];

  constructor(private hoaDonService: HoaDonService) {}
  ngOnInit(): void {
    this.loadHoaDons();
  }
  // cập nhật trạng thái duyệt
  capNhatTrangThai() {
    if (this.trangThai < this.trangThaiText.length - 1) {
      this.trangThai++;
    }
  }
  loadHoaDons(): void {
    this.hoaDonService.getHoaDons(this.searchRequest).subscribe(response => {
    console.log("Dữ liệu từ API:", response);
      if (Array.isArray(response)) {
        this.hoaDons.content = response;
        this.hoaDons.totalElements = response.length;
      } else {
        console.error("Dữ liệu API không phải là mảng:", response);
      }
    });
  }

  search(): void {
    this.loadHoaDons();
  }

  resetFilters(): void {
    this.searchRequest = {
      maHoaDon: '',
      tenKhachHang: '',
      ngayTaoFrom: null,
      ngayTaoTo: null,
      listTrangThai: [],
      page: 1
    };
    this.loadHoaDons();
  }

  createHoaDon(): void {
    this.hoaDonService.createHoaDon(this.formRequest).subscribe(
      (response: HoaDonResponse) => {
        alert('Hóa đơn đã được tạo thành công');
        this.formRequest = {}; // Reset form
        this.loadHoaDons();
      },
      (error: any) => {
        console.error('Error creating hoa don:', error);
      }
    );
  }

  selectHoaDon(hoaDon: HoaDonResponse): void {
    this.selectedHoaDon = hoaDon;
    this.formRequest = { tenKhachHang: hoaDon.tenKhachHang };
  }

  updateHoaDon(): void {
    if (!this.selectedHoaDon) return;
    this.hoaDonService.updateHoaDon(this.selectedHoaDon.id, this.formRequest).subscribe(
      (response: HoaDonResponse) => {
        alert('Hóa đơn đã được cập nhật thành công');
        this.selectedHoaDon = null; // Reset selection
        this.formRequest = {};
        this.loadHoaDons();
      },
      (error: any) => {
        console.error('Error updating hoa don:', error);
      }
    );
  }

  cancelHoaDon(id: number): void {
    this.hoaDonService.cancelHoaDon(id).subscribe(
      () => {
        alert('Hóa đơn đã được hủy thành công');
        this.loadHoaDons();
      },
      (error: any) => {
        console.error('Error canceling hoa don:', error);
      }
    );
  }

  prevPage(): void {
    if (this.searchRequest?.page && this.searchRequest.page > 1) {
      this.searchRequest.page -= 1;
      this.loadHoaDons();
    }
  }

  nextPage(): void {
    if (this.searchRequest?.page && this.hoaDons?.totalPages && this.searchRequest.page < this.hoaDons.totalPages) {
      this.searchRequest.page += 1;
      this.loadHoaDons();
    }
  }


}
