import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DangNhapService } from './dangnhap.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dangnhap',
  imports: [CommonModule, FormsModule],
  templateUrl: './dangnhap.component.html',
  styleUrl: './dangnhap.component.css',
})
export class DangnhapComponent implements OnInit {
  errors: any = {};
  tentaikhoan: string = '';
  matkhau: string = '';
  khachhang: any = null;

  constructor(
    private dangNhapService: DangNhapService,
    private router: Router,
    private cookieService: CookieService // Inject CookieService
  ) {}

  ngOnInit(): void {}

  kiemTraTaiKhoan() {
    this.dangNhapService.getKhachHangByEmail(this.tentaikhoan).subscribe((data) => {
      this.khachhang = data;
      if (this.validateForm(this.khachhang)) {
        alert('Đăng nhập thành công!');
        
        // Lưu thông tin khách hàng vào cookie (hết hạn sau 1 ngày)
        console.log(this.khachhang);
        this.cookieService.set('khachhang', JSON.stringify(this.khachhang), { expires: 1, path: '/' });

        // Chuyển hướng đến trang chủ
        this.router.navigate(['']);
      }
    });
  }

  validateForm(khachhang: any): boolean {
    this.errors = {};
    if (!this.tentaikhoan.trim()) {
      this.errors.email = 'Email không được để trống!';
    }
    if (this.khachhang === null) {
      this.errors.email = 'Email không tồn tại!';
    }
    if (!this.matkhau.trim()) {
      this.errors.matKhau = 'Mật khẩu không được để trống!';
    }
    if (this.khachhang?.matKhau !== this.matkhau) {
      this.errors.matKhau = 'Mật khẩu không đúng!';
    }

    return Object.keys(this.errors).length === 0;
  }
}
