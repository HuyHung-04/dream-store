import { Component, OnInit } from '@angular/core';
import { LichsudonhangService } from './lichsudonhang.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-lichsudonhang',
  imports: [CommonModule],
  templateUrl: './lichsudonhang.component.html',
  styleUrl: './lichsudonhang.component.css'
})
export class LichsudonhangComponent {
  hoaDonChiTiet: any[] = [];
  errorMessage: string = '';
  idKhachHang: number = 0;
  trangThai = [
    { value: 0, label: 'Tất cả' },
    { value: 1, label: 'Chờ xác nhận' },
    { value: 2, label: 'Đã xác nhận' },
    { value: 3, label: 'Đang giao hàng' },
    { value: 4, label: 'Giao hàng thành công' },
    { value: 5, label: 'Đơn đã hủy' }
  ];
  selectedStatus: number = 0;
  constructor(private lichsudonhangService: LichsudonhangService, private router: Router, private cookieService: CookieService) { }

  ngOnInit(): void {
    const khachhangStr = this.cookieService.get('khachhang');
    if (khachhangStr) {
      const khachhang = JSON.parse(khachhangStr);
      this.idKhachHang = khachhang.id;
      this.loadHoaDon()

    }
  }

  //lọc trạng thái
  locTrangThai(status: number): void {
    this.selectedStatus = status;
    this.loadHoaDon();
  }

  //load dánh sách hóa đơn
  loadHoaDon(): void {
    const status = this.selectedStatus === 0 ? 0 : this.selectedStatus;
    this.lichsudonhangService.getHoaDonChiTiet(this.idKhachHang, status).subscribe({
      next: (data) => {
        this.hoaDonChiTiet = this.xuLyHoaDonData(data);
      },
      error: (error) => {
        this.errorMessage = 'Error';
        console.error('Error!', error);
      }
    });
  }


  //xử lý dữ liệu từ hóa đơn
  xuLyHoaDonData(data: any[]): any[] {
    const nhomData: { [key: string]: any } = {};

    data.forEach(item => {
      const id = item.idHoaDon;
      if (nhomData[id]) {
        nhomData[id].soLuong += item.soLuong;
      } else {
        nhomData[id] = { ...item };
      }
    });

    return Object.values(nhomData).sort((a, b) => b.idHoaDon - a.idHoaDon);
  }

  viewInvoiceDetail(idHoaDon: number): void {
    this.router.navigate(['/donhang', idHoaDon]);
  }

  goHome(): void {
    console.log('Quay về trang chủ...');
    window.location.href = '/banhang';  // Giả sử trang chủ là '/home'
  }

  // Hàm để ánh xạ trạng thái số thành văn bản
  getTrangThaiText(trangThai: number): string {
    switch (trangThai) {
      case 1:
        return 'Chờ xác nhận';
      case 2:
        return 'Đã xác nhận';
      case 3:
        return 'Đang giao hàng';
      case 4:
        return 'Giao hàng thành công';
      case 5:
        return 'Hủy đơn';
      default:
        return 'Chưa rõ';
    }
  }
}
